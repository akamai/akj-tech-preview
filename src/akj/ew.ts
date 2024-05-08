/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

import * as glob from 'glob';
import * as tar from 'tar';

import {Terminator} from './akj-impl';
import {coerce, SemVer} from 'semver';
import {IsOptional, IsPositive, IsString, Matches, validate, ValidationError} from 'class-validator';
import {writeFile} from 'node:fs/promises';

const MAINJS_FILENAME = 'main.js';
const MANIFEST_FILENAME = 'bundle.json';

interface Manifest {
	'edgeworker-version': string;
	'bundle-version'?: number;
	'api-version'?: string;
	misc?: Record<string, unknown>; // Using Record for an empty object, adaptable for future properties.
	description?: string;
}

export class EdgeWorkerManifest implements Manifest {
	@Matches(/^(?!.*?\\.{2})[.a-zA-Z0-9_~-]{1,32}$/, {
		message:
			'The edgeworker-version provided is not valid. See https://techdocs.akamai.com/edgeworkers/docs/code-bundle-format',
	})
	'edgeworker-version': string;

	@IsPositive()
	@IsOptional()
	'bundle-version'?: number;

	@IsOptional()
	@Matches(/^[0-9.]*$/, {
		message: 'The api-version must be numeric',
	})
	'api-version'?: string;

	@IsOptional()
	misc?: Record<string, unknown>;

	@IsString()
	@IsOptional()
	description?: string;

	constructor(
		edgeWorkerVersion: string,
		bundleVersion?: number,
		apiVersion?: string,
		misc?: Record<string, unknown>,
		description?: string,
	) {
		this['edgeworker-version'] = edgeWorkerVersion;
		this['bundle-version'] = bundleVersion;
		this['api-version'] = apiVersion;
		this.misc = misc;
		this.description = description;
	}

	private static createEmptyManifest(): EdgeWorkerManifest {
		return new EdgeWorkerManifest('');
	}

	static createEdgeWorkersManifest(loaded: unknown): EdgeWorkerManifest {
		return Object.assign(this.createEmptyManifest(), loaded);
	}

	static formatValidationErrors(validationErrors: ValidationError[]): string {
		return `${validationErrors.flatMap(e => Object.values(e.constraints ?? {}).join(', '))}.`;
	}

	static loadManifest(manifestPath: string): Manifest {
		const loaded: Manifest = JSON.parse(fs.readFileSync(manifestPath).toString());
		return this.createEdgeWorkersManifest(loaded);
	}
}

/**
 * @param {string} manifestPath The path to the manifest.
 * @returns {{isValid: false; errorReason: string} | {isValid: true; version: string}} `isValid` whether there is a
 *   problem. If there is a problem, it is described in `errorReason`, otherwise the version of the thing is returned.
 * @see https://github.com/akamai/cli-edgeworkers/blob/master/src/edgeworkers/client-manager.ts#L154
 */
async function validateManifest(manifestPath: string): Promise<ManifestValidationData> {
	let manifest;
	try {
		manifest = EdgeWorkerManifest.loadManifest(manifestPath);
	} catch (ex) {
		const errorReason =
			ex instanceof Error
				? `ERROR: Manifest file (${MANIFEST_FILENAME}) cannot be loaded or is not Bundle valid JSON: ${ex.message}`
				: `ERROR: Manifest file (${MANIFEST_FILENAME}) cannot be loaded or is not Bundle valid JSON:`;
		// if the manifest cannot be loaded, then return that things are incorrect.
		return {
			isValid: false,
			errorReason: errorReason,
		};
	}

	const edgeWorkersManifest = EdgeWorkerManifest.createEdgeWorkersManifest(manifest);
	const validationErrors = await validate(edgeWorkersManifest);
	if (validationErrors.length > 0) {
		return {
			isValid: false,
			errorReason: EdgeWorkerManifest.formatValidationErrors(validationErrors),
		};
	}

	return {
		isValid: true,
		manifest: edgeWorkersManifest,
	};
}

/**
 * Looks like it creates a temp directory to store the EdgeWorkers tarball.
 *
 * @param {Terminator} terminate Raises and error and ends execution.
 * @param {string} ewId Id of the EdgeWorker.
 * @returns {string} Path to the temporary EdgeWorkers tarball directory.
 * @see https://github.com/akamai/cli-edgeworkers/blob/master/src/edgeworkers/client-manager.ts#L137C1-L152C2
 */
function createEdgeWorkerIdDir(terminate: Terminator, ewId: string): string {
	const edgeWorkersDir = path.join(os.tmpdir(), ewId);

	// Add try/catch logic in case user doesn't have permissions to write directories needed
	try {
		if (!fs.existsSync(edgeWorkersDir)) {
			fs.mkdirSync(edgeWorkersDir, {recursive: true});
		}
	} catch (e) {
		terminate(`ERROR: Cannot create ${edgeWorkersDir}\n${(e as Error).message}`);
	}

	return edgeWorkersDir;
}

type ManifestValidationData = {isValid: false; errorReason: string} | {isValid: true; manifest: Manifest};

/**
 * Get the edgeworker-version from the bundle.json manifest. If automatic semantic versioning is enabled, it will return
 * the new version.
 *
 * If autoSemVer is set to true, the bundle.json for the EdgeWorker will be updated and a new version is written to
 * disk.
 *
 * @param {string} manifestPath The path to the bundle.json manifest
 * @param {boolean} autoSemVer True to automate versioning
 * @param {Terminator} terminate The function to terminate processing on error
 * @param {Promise<ManifestValidationData>} manifestValidator A function to perform validation on the bundle.json
 *   manifest.
 * @param {Promise<void>} manifestWriter A function to perform updating the manifest on disk.
 * @returns {string} The edgeworker-version to use when creating the tarball.
 */
export async function getEdgeWorkerVersion(
	manifestPath: string,
	autoSemVer: boolean,
	terminate: Terminator,
	manifestValidator: (manifestPath: string) => Promise<ManifestValidationData>,
	manifestWriter: (manifestPath: string, bundle: Manifest) => Promise<void>,
): Promise<string> {
	// Validate Manifest and if valid, grab version identifier
	const manifestValidationData = await manifestValidator(manifestPath);

	if (manifestValidationData.isValid === false) {
		terminate(manifestValidationData.errorReason);
	} else {
		let currentEWVersion = manifestValidationData.manifest['edgeworker-version'];
		if (autoSemVer) {
			//do a best effort conversion.  Things like v2 -> 2.0.0.
			const coercedVersion = coerce(currentEWVersion)?.format();
			// if auto semver is enabled, and the current string is not valid, then terminate processing.
			if (!coercedVersion) {
				terminate(
					`ERROR: The provided version '${currentEWVersion}' is not a valid Semantic Version string and cannot be auto incremented.`,
				);
			}

			// increment major, because that sounds ok
			currentEWVersion = new SemVer(coercedVersion).inc('major').format();
			manifestValidationData.manifest['edgeworker-version'] = currentEWVersion;

			await manifestWriter(manifestPath, manifestValidationData.manifest);
		}

		return currentEWVersion;
	}
}

/**
 * Create a tarball containing an EdgeWorker. Does some validation of the bundle.json.
 *
 * @param {Terminator} terminate Raises a fatal error, prints a message, and stops execution.
 * @param {string} ewId The EdgeWorker id.
 * @param {string} codePath Path to the EdgeWorker directory. Should contain main.js etc.
 * @param {boolean} autoSemVer True to automatically increment semantic versioned EW ids
 * @param {string | null} edgeWorkersDir Place to put the tarball.
 * @returns {string} Path to the created tarball.
 * @see https://github.com/akamai/cli-edgeworkers/blob/master/src/edgeworkers/client-manager.ts#L74
 */
export async function buildTarball(
	terminate: Terminator,
	ewId: string,
	codePath: string,
	autoSemVer: boolean = false,
	edgeWorkersDir: string = createEdgeWorkerIdDir(terminate, ewId),
): Promise<string> {
	const codeWorkingDirectory = path.resolve(codePath);

	const mainjsPath = path.join(codeWorkingDirectory, MAINJS_FILENAME);
	const manifestPath = path.join(codeWorkingDirectory, MANIFEST_FILENAME);

	if (!fs.existsSync(mainjsPath) || !fs.existsSync(manifestPath)) {
		terminate(
			`ERROR: EdgeWorkers main.js (${mainjsPath}) and/or manifest (${manifestPath}) provided is not found.`,
		);
	}

	// Build tarball file name as ew_<version>_<now-as-epoch>.tgz
	let tarballFileName = 'ew_';
	const currentEWVersion = await getEdgeWorkerVersion(
		manifestPath,
		autoSemVer,
		terminate,
		async (manifestPath: string) => {
			return await validateManifest(manifestPath);
		},
		async (manifestPath: string, manifest: Manifest) => {
			await writeFile(manifestPath, JSON.stringify(manifest, undefined, 4));
		},
	);

	tarballFileName += currentEWVersion + '_' + Date.now() + '.tgz';
	const tarballPath = path.join(edgeWorkersDir, tarballFileName);

	// get the list of files that we will add to the tarball.  While ['.'] works to create a tarball, it will fail validation
	// when uploaded.  The validation server will not be able to find the bundle.json/main.js when it lists the files inside.
	const files = glob.sync('**/*', {cwd: codeWorkingDirectory});
	// tar files together with no directory structure (ie: tar czvf ../helloworld.tgz *)
	tar.c(
		{
			gzip: true,
			portable: true,
			file: tarballPath,
			cwd: codeWorkingDirectory,
			sync: true,
		},
		files,
	);

	return tarballPath;
}

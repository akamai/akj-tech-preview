/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE
 */

import * as os from 'node:os';
import * as fs from 'node:fs';
import * as path from 'node:path';

import * as ew from '../src/akj/ew';

import * as tar from 'tar';
import {validate} from 'class-validator';
import {fail} from 'node:assert';

/**
 * Create a randomly named directory in `/tmp`
 *
 * @returns {string} Path to the newly created directory
 */
export function mkDirInTmp() {
	return fs.mkdtempSync(path.join(os.tmpdir(), 'pcdn-test-'));
}

/**
 * Creates a temporary directory containing files and directories. It isn't recursive.
 *
 * @returns {string} Path to the root.
 */
function writeFiles(layout: {[key: string]: string}) {
	const root = mkDirInTmp();
	fs.mkdirSync(root, {recursive: true});
	for (const key in layout) {
		if (key.endsWith('/')) {
			fs.mkdirSync(path.join(root, key), {recursive: true});
		} else {
			fs.writeFileSync(path.join(root, key), layout[key]);
		}
	}
	return root;
}

describe('EW', () => {
	describe('Automate Bundle Version Management', () => {
		test('Automatic SemVer increments edgeworker-version and writes an updated bundle.json.', async () => {
			const manifest: ew.EdgeWorkerManifest = new ew.EdgeWorkerManifest('1.0.0');
			const imaginaryPath = 'imaginaryPath';

			const updatedVersion = await ew.getEdgeWorkerVersion(
				imaginaryPath,
				true,
				msg => {
					throw new Error(`An unexpected termination occurred: ${msg}`);
				},
				async manifestPath => {
					expect(manifestPath).toBe(imaginaryPath);

					// return the manifest and ensure that it is valid.
					return {
						isValid: true,
						manifest: manifest,
					};
				},
				async (manifestPath, bundle) => {
					// pretend to write to the file at the specific path
					expect(manifestPath).toBe(imaginaryPath);
					expect(bundle['edgeworker-version']).toBe('2.0.0');
				},
			);

			expect(updatedVersion).toBe('2.0.0');
		});

		test('Disabled automatic SemVer will return current version and not update bundle.json', async () => {
			const manifest: ew.EdgeWorkerManifest = new ew.EdgeWorkerManifest('1.0.0');
			const imaginaryPath = 'imaginaryPath';

			const unmodifiedVersion = await ew.getEdgeWorkerVersion(
				imaginaryPath,
				false,
				msg => {
					throw new Error(`An unexpected termination occurred: ${msg}`);
				},
				async manifestPath => {
					expect(manifestPath).toBe(imaginaryPath);

					// return the manifest and ensure that it is valid.
					return {
						isValid: true,
						manifest: manifest,
					};
				},
				async (manifestPath, bundle) => {
					// pretend to write to the file at the specific path
					expect(manifestPath).toBe(imaginaryPath);
					expect(bundle['edgeworker-version']).toBe('1.0.0');
				},
			);

			expect(unmodifiedVersion).toBe('1.0.0');
		});

		test('Invalid bundle.json will not be updated.', async () => {
			const imaginaryPath = 'imaginaryPath';
			const validationProblem = 'Because I said so';
			const errorMessage = `An unexpected termination occurred: ${validationProblem}`;

			try {
				await ew.getEdgeWorkerVersion(
					imaginaryPath,
					true,
					msg => {
						expect(msg).toBe(validationProblem);
						throw new Error(errorMessage);
					},
					async manifestPath => {
						expect(manifestPath).toBe(imaginaryPath);

						// return the manifest and ensure that it is valid.
						return {
							isValid: false,
							errorReason: validationProblem,
						};
					},
					async (_manifestPath, _bundle) => {
						throw new Error('This should never be called.');
					},
				);
				fail();
			} catch (err) {
				expect((<Error>err).message).toBe(errorMessage);
			}
		});

		test('Automatic SemVer terminates on versions that cannot be coerced.', async () => {
			const currentEWVersion = 'a';
			const manifest: ew.EdgeWorkerManifest = new ew.EdgeWorkerManifest(`${currentEWVersion}`);
			const imaginaryPath = 'imaginaryPath';
			const expectedErrorMessage = `ERROR: The provided version '${currentEWVersion}' is not a valid Semantic Version string and cannot be auto incremented.`;

			try {
				await ew.getEdgeWorkerVersion(
					imaginaryPath,
					true,
					msg => {
						// the terminator should be called because while `a` is a valid version, it can't be coerced to semver.
						expect(msg).toBe(expectedErrorMessage);
						throw new Error(expectedErrorMessage);
					},
					async manifestPath => {
						expect(manifestPath).toBe(imaginaryPath);

						// return the manifest and ensure that it is valid.
						return {
							isValid: true,
							manifest: manifest,
						};
					},
					async (_manifestPath, _bundle) => {
						throw new Error('This should not be called.');
					},
				);

				fail();
			} catch (err) {
				expect((<Error>err).message).toBe(expectedErrorMessage); // Check the error message
			}
		});
	});

	describe('Manifest Validation Tests', () => {
		const edgeWorkerVersion = '1.2.3';
		const bundleVersion = 1;
		const apiVersion = '2';
		const description = 'Some description';
		const misc = {
			changelog: ['Some change'],
		};

		test('Verify Manifest Loads Valid file', async () => {
			const minimalBundle = JSON.parse(`
				{
					"edgeworker-version": "${edgeWorkerVersion}"
				}
			`);
			const minimalBundleManifest = ew.EdgeWorkerManifest.createEdgeWorkersManifest(minimalBundle);
			expect(minimalBundleManifest['edgeworker-version']).toBe(edgeWorkerVersion);
			const minimalBundleValidationErrors = await validate(minimalBundleManifest);
			expect(minimalBundleValidationErrors.length).toBe(0);

			const completebundle = JSON.parse(`
				{
					"edgeworker-version": "${edgeWorkerVersion}",
					"bundle-version": ${bundleVersion},
					"api-version":"${apiVersion}",
					"description":"${description}",
					"misc":${JSON.stringify(misc)}
				}
			`);
			const completebundleManifest = ew.EdgeWorkerManifest.createEdgeWorkersManifest(completebundle);
			expect(completebundleManifest['edgeworker-version']).toBe(edgeWorkerVersion);
			expect(completebundleManifest['api-version']).toBe(apiVersion);
			expect(completebundleManifest['bundle-version']).toBe(bundleVersion);
			expect(completebundleManifest.description).toBe(description);
			expect(completebundleManifest.misc).toStrictEqual(misc);

			const validationErrors = await validate(completebundleManifest);
			expect(validationErrors.length).toBe(0);
		});

		test('Verify Manifest validates EW Bundle', async () => {
			const minimalBundle = JSON.parse(`
				{
					"edgeworker-version": "ThisIsInvalid!"
				}
			`);
			const minimalBundleManifest = ew.EdgeWorkerManifest.createEdgeWorkersManifest(minimalBundle);
			const minimalBundleValidationErrors = await validate(minimalBundleManifest);
			expect(minimalBundleValidationErrors.length).toBe(1);
			expect(ew.EdgeWorkerManifest.formatValidationErrors(minimalBundleValidationErrors)).toBe(
				'The edgeworker-version provided is not valid. See https://techdocs.akamai.com/edgeworkers/docs/code-bundle-format.',
			);
		});

		test('Verify Manifest requires edgeworker-version', async () => {
			const invalidBundle = JSON.parse('{}');
			const invalidBundleManifest = ew.EdgeWorkerManifest.createEdgeWorkersManifest(invalidBundle);
			const invalidBundleValidationErrors = await validate(invalidBundleManifest);
			expect(invalidBundleValidationErrors.length).toBe(1);
			expect(ew.EdgeWorkerManifest.formatValidationErrors(invalidBundleValidationErrors)).toBe(
				'The edgeworker-version provided is not valid. See https://techdocs.akamai.com/edgeworkers/docs/code-bundle-format.',
			);
		});

		test('Verify other manifest fields, but not as complete as we should because they are not really used.', async () => {
			const invalidBundle = JSON.parse(`
				{
					"edgeworker-version": "${edgeWorkerVersion}",
					"bundle-version": "${bundleVersion}",
					"api-version":1,
					"description":true,
					"misc":${JSON.stringify(misc)}
				}
			`);
			const invalidBundleManifest = ew.EdgeWorkerManifest.createEdgeWorkersManifest(invalidBundle);

			//validate that these invalid items are loaded, but will not make it past validation
			expect(invalidBundleManifest['edgeworker-version']).toBe(edgeWorkerVersion);
			expect(invalidBundleManifest['api-version']).toBe(1);
			expect(invalidBundleManifest['bundle-version']).toBe(`${bundleVersion}`);
			expect(invalidBundleManifest.description).toBe(true);
			expect(invalidBundleManifest.misc).toStrictEqual(misc);

			const validationErrors = await validate(invalidBundleManifest);
			expect(validationErrors.length).toBe(3);
			expect(ew.EdgeWorkerManifest.formatValidationErrors(validationErrors)).toBe(
				'bundle-version must be a positive number,The api-version must be numeric,description must be a string.',
			);
		});
	});

	test('Tarball creation sniff test', async () => {
		// This is just a sniff test. We copied buildTarball() from the Akamai EW CLI, so we assume it generally works.
		const base = writeFiles({
			'main.js': 'i am main',
			'bundle.json': JSON.stringify({
				'edgeworker-version': '1.0.0',
				'bundle-version': 2,
				'api-version': '3',
			}),
			'config.js': 'i am config',
			'subdir/': '<this is a dir, value ignored>',
			'subdir/file.js': 'i am subdir/file.js',
		});
		const terminate = (msg: string) => {
			throw new Error(`terminate() called: ${msg}`);
		};
		const pathToTarball = await ew.buildTarball(terminate, '999', base);

		// Read the tarball and verify the expected files have entries.
		const entries: {[key: string]: true} = {}; // Use an object so we can ignore the order
		tar.t({
			sync: true,
			file: pathToTarball,
			onentry: entry => (entries[entry.path] = true),
		});

		// Note that the tarball has multiple entries for files in directories, but that appears to be a feature of the CLI implementation, so we don't change that.
		expect(entries).toMatchObject({
			'main.js': true,
			'bundle.json': true,
			'config.js': true,
			'subdir/file.js': true,
		});
	});
});

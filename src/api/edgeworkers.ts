/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE
 */

import {terminateOnBadBundle} from '../utils/errors';
import {CliPrimitives} from '../akj/akj-impl';
import {PropertyCoordinates, PropertyManagerAPI} from './papi';

/**
 * Given a directory containing an EdgeWorker, create an EdgeWorker bundle and upload it to Property Manager.
 *
 * @param {CliPrimitives} primitives Helpers that make the CLI easier to test.
 * @param {PropertyManagerAPI} api Functions that call to the Property Manager EdgeWorker endpoints.
 * @param {PropertyCoordinates} propertyMeta Indicates the EdgeWorker id.
 * @param {string} pathToEdgeWorker A path to the directory containing the EdgeWorker. Must contain a main.js and
 *   bundle.json.
 * @param {'PRODUCTION' | 'STAGING'} network Target network for the activation.
 * @returns {{edgeWorkerId: number; version: string}} Everything necessary to activate the uploaded version.
 */
export async function uploadAndActivateNewBundle(
	primitives: CliPrimitives,
	api: PropertyManagerAPI,
	propertyMeta: PropertyCoordinates,
	pathToEdgeWorker: string,
	network: 'PRODUCTION' | 'STAGING',
): Promise<{edgeWorkerId: number; version: string}> {
	primitives.statusUpdator.increment(0, 'Building EdgeWorkers Tarball.');

	const bundleByteArray = await primitives.buildTarballInMemory(
		primitives,
		propertyMeta.edgeWorkerId,
		pathToEdgeWorker,
		propertyMeta.autoSemVer || false,
	);

	primitives.statusUpdator.increment(1, 'Validating EdgeWorker Bundle.');

	const bundleValidationResult = await api.validateEdgeWorkerBundle(propertyMeta, bundleByteArray);
	terminateOnBadBundle(primitives, bundleValidationResult);

	primitives.statusUpdator.increment(1, 'Creating EdgeWorker version.');

	const {edgeWorkerId, version} = await api.createEdgeWorkerVersion(
		propertyMeta,
		propertyMeta.edgeWorkerId,
		bundleByteArray,
	);
	primitives.statusUpdator.increment(1, 'Starting EdgeWorker activation.');

	await api.activateEdgeWorkerVersion(propertyMeta, edgeWorkerId, version, network);

	primitives.statusUpdator.increment(1, 'EdgeWorker activation started.');

	return {
		edgeWorkerId: edgeWorkerId,
		version: version,
	};
}

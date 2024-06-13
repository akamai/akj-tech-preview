/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE.md
 */
//@ts-check

const Enum = require('enum');
const {readFileSync} = require('node:fs');
const {createHash} = require('node:crypto');

// @ts-ignore
const ENVIRONMENTS = new Enum(['prod', 'stag', 'dev'], {ignoreCase: true});

/**
 * Get the current environment for loading the configuration.
 *
 * @param {string | undefined} env An enum based on the environment the code is running.
 * @returns {Enum} The environment. Default to DEVELOPMENT if the provided string is not found.
 */
function getEnvironment(env) {
	return ENVIRONMENTS.get(env) || ENVIRONMENTS.dev;
}

/**
 * Load the configuration for the specific environment
 *
 * @returns {{
 * 	file: string; // the file path loaded
 * 	sha256: string; // the sha256 of the file used
 * 	loaded: object; // the JSON object loaded from the file
 * }}
 *   The results of loading the configuration for the specific environment.
 */
function loader() {
	const env = getEnvironment(process.env.ENVIRONMENT);
	const file = `resources/config-${env.toString()}.json`;
	const configFile = readFileSync(file, 'utf8');
	const hash = createHash('sha256');
	const sha256 = hash.update(configFile, 'utf-8').digest('hex');
	return {
		file,
		sha256,
		loaded: JSON.parse(configFile),
	};
}

module.exports = {
	loader,
	getEnvironment,
	ENVIRONMENTS,
};

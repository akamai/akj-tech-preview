/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE
 */

const {getEnvironment, ENVIRONMENTS, loader} = require('../src/config/loader');

/**
 * Test that an expected string will deliver the correct environment
 *
 * @param {string} arg The process argument describing the Environment
 * @param {ENVIRONMENTS} env The expected Environment
 */
function testEnv(arg, env) {
	const loadedEnv = getEnvironment(arg);
	expect(loadedEnv).toBe(env);

	// ensure a mixed case that does not match the expected enums
	const mixedCaseEnv = getEnvironment(arg.charAt(0).toUpperCase() + arg.slice(1).toLowerCase);
	expect(mixedCaseEnv).toBe(ENVIRONMENTS.dev);
}

describe('Loader', () => {
	describe('Environment Loading Works as expected', () => {
		test('Dev Environment', () => {
			testEnv('dev', ENVIRONMENTS.dev);
		});

		test('Staging Environment', () => {
			testEnv('stag', ENVIRONMENTS.stag);
		});

		test('Production Environment', () => {
			testEnv('prod', ENVIRONMENTS.prod);
		});

		test('Unexpected Environments default to DEV', () => {
			const defaultEnv = getEnvironment('unexpected');
			expect(defaultEnv).toBe(ENVIRONMENTS.dev);
		});
	});

	describe('Configuration files are loaded correctly', () => {
		test('Dev configuration file loads correctly', () => {
			process.env.ENVIRONMENT = 'dev';

			const configuration = loader();
			expect(configuration.file).toContain('resources/config-dev.json');
			// sha computed with `sha256sum resources/config-dev.json`
			expect(configuration.sha256).toBe('f3310837747ce45719cc5baf72ede56142c0ac32a0d2e5eacad020db5db8013f');
			expect(configuration.loaded.rules.length).toBeGreaterThan(0);

			delete process.env.ENVIRONMENT;
		});

		test('Staging configuration file loads correctly', () => {
			process.env.ENVIRONMENT = 'stag';

			const configuration = loader();
			expect(configuration.file).toContain('resources/config-stag.json');
			// sha computed with `sha256sum resources/config-stag.json`
			expect(configuration.sha256).toBe('de5755092ae8a4509ef7c5110b9b3479b4b1c3c2baf462526ceea051eb3f76a7');
			expect(configuration.loaded.rules.length).toBeGreaterThan(0);

			delete process.env.ENVIRONMENT;
		});

		test('Production configuration file loads correctly', () => {
			process.env.ENVIRONMENT = 'prod';

			const configuration = loader();
			expect(configuration.file).toContain('resources/config-prod.json');
			// sha computed with `sha256sum resources/config-prod.json`
			expect(configuration.sha256).toBe('9c3078eec8310c7eff8d4d0894eb87642083a7e2029e84ab24a7b9af81152d1a');
			expect(configuration.loaded.rules.length).toBeGreaterThan(0);

			delete process.env.ENVIRONMENT;
		});
	});
});

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

const {Property} = require('akj-tech-preview');

/**
 * An `onConfig` function that uses the setVariable functionality. The variables that are set are then referenced from
 * the EdgeWorker associated with the property.
 *
 * @param {Property} config The configuration object
 */
function onConfig(config) {
	config
		.setOrigin({
			originType: 'CUSTOMER',
			hostname: 'example.com',
		})
		.setCaching({ttl: '7d'})
		.setCpCode({
			value: {
				id: 1234,
			},
		});

	config.setSetVariable({
		variableName: 'PMUSER_PCDN_TEST_1',
		variableValue: 'PCDN_TEST_1_VALUE_BASIC',
	});

	config
		.onMetadataStage({
			matchOperator: 'IS',
			value: 'forward-start',
		})
		.setSetVariable({
			variableName: 'PMUSER_PCDN_TEST_1',
			variableValue: 'PCDN_TEST_1_VALUE_ORIGIN_RESPONSE',
		});

	config
		.onMetadataStage({
			matchOperator: 'IS',
			value: 'client-response',
		})
		.setSetVariable({
			variableName: 'PMUSER_PCDN_TEST_1',
			variableValue: 'PCDN_TEST_1_VALUE_CLIENT_RESPONSE',
		});

	config.setEdgeWorker({
		edgeWorkerId: '1234',
		enabled: true,
	});
}

module.exports = {
	onConfig,
};

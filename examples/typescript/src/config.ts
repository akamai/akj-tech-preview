/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE
 */

import {Property, ConfigureProperty} from 'akj-tech-preview';

/**
 * An `onConfig` function that implmements the `ConfigureProperty` type. This is a basic example that will allow the use
 * of typescript directly. The example is mostly to show how to use the tool in conjunction with compilation steps.
 *
 * @param {Property} config The property to configure
 */
export const onConfig: ConfigureProperty = config => {
	config
		.setOrigin({
			originType: 'CUSTOMER',
			hostname: 'example.com',
		})
		.setCpCode({
			value: {
				id: 1234,
			},
		})
		.setEdgeWorker({
			enabled: true,
			edgeWorkerId: '1234',
		});
};

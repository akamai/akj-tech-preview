#! /usr/bin/env node

/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE
 */

// User-facing CLI for turning PAPI JS to PAPI JSON

import * as cli from './akj/akj-impl';
import {StructuredError} from './utils/errors';
import {prettyPrintStructuredError} from './utils/pretty';
import {Presets, SingleBar} from 'cli-progress';

/**
 * Terminate the process and log a message
 *
 * @param {string} message The message to log before termination.
 * @returns {never} This function will never return.
 */
function terminate(message: string): never {
	process.stderr.write(message + 'n');
	process.exit(1);
}

const args = cli.parseArgs(process.argv, terminate);

const primitives: cli.PCDNCliPrimitives = new cli.PCDNCliPrimitives();

const makeStatusUpdator = (statusBar: SingleBar): cli.StatusUpdator => {
	return {
		increment: (value: number, message?: string) => {
			statusBar.increment(value, {
				status: message || 'N/A',
			});
		},
		stop: () => {
			statusBar.stop();
		},
	};
};

/**
 * Run all of our steps. Asynchronously.
 *
 * @param {cli.CliPrimitives} primitives Helper functions that simplify testing.
 * @param {cli.CliArguments} args Arguments the user passed in.
 */
async function runAsyncSteps(primitives: cli.CliPrimitives, args: cli.CliArguments) {
	try {
		if (!args.init) {
			// create a status bar to track the various steps.  There are 9 steps at this point, so make sure new steps get additional items added.
			const updateBar = new SingleBar(
				{
					format: '{bar} | {percentage}% | {status} | {value}/{total}',
					clearOnComplete: true,
				},
				Presets.shades_grey,
			);
			primitives.statusUpdator = makeStatusUpdator(updateBar);
			updateBar.start(10, 0, {
				status: 'Starting Activation',
			});

			try {
				await cli.runActivation(args, primitives);
			} finally {
				primitives.statusUpdator.stop();
				primitives.printOutput();
			}
		} else {
			await cli.runInitialization(args, primitives);
		}
	} catch (e) {
		if (e instanceof StructuredError) {
			primitives.statusUpdator.stop();
			prettyPrintStructuredError(e, primitives.stderr);
			primitives.printOutput();
		} else {
			throw e;
		}
	}
}
runAsyncSteps(primitives, args);

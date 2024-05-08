/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE.md
 */

import {EdgeWorkerValidationResult, ErrorInstance} from '../api/papi';
import {CliPrimitives, resolveLineOfCode} from '../akj/akj-impl';
import path from 'node:path';
import {prettyPrintBundleProblems, prettyPrintValidationError} from './pretty';

/** Rough shape of the rfc7807 error blob */
export interface FullErrorBlob {
	[key: string]: string;
}

/** An error that carries an error formatted by https://datatracker.ietf.org/doc/html/rfc7807 */
export class StructuredError extends Error {
	/** The RFC7807 error blob. */
	readonly data: FullErrorBlob;

	constructor(message: string, data: FullErrorBlob) {
		super(message);
		this.data = data;
	}

	toString(): string {
		return `${this.message}: ${JSON.stringify(this.data)}`;
	}
}

/**
 * Emit the validation errors to STDERR
 *
 * @param {CliPrimitives} primitives Dependency injection to allow easier testing. maybe cavemen.
 * @param {string} prefix The prefix to write on the error message
 * @param {ErrorInstance[]} errors The error messages to simplify and write
 * @param {object} papiJson The papi JSON
 */
export function emitValidationErrors(
	primitives: CliPrimitives,
	prefix: string,
	errors: Array<ErrorInstance>,
	papiJson: object,
) {
	for (const error of errors) {
		const simp = improveErrorMessage(error);

		const pointer = error.errorLocation;
		if (pointer) {
			// The complaint is associated with a line of code
			const loc = resolveLineOfCode(papiJson, pointer) || pointer;
			prettyPrintValidationError(prefix, loc, simp.message, simp.hint, primitives.stderr);
		} else {
			// The complaint is overall. This happens for missing behaviours.
			prettyPrintValidationError(prefix, undefined, simp.message, simp.hint, primitives.stderr);
		}
	}
}

/**
 * Given the ErrorInstance from PAPI, return a human-meaningful explanation of the problem. If we know how to provide
 * extra information, include that as a hint.
 *
 * @param {ErrorInstance} error Simply the error that needs simplification.
 * @returns {{message: string; hint: string | undefined}} The message to show to the user and, optionally, a hint that
 *   makes it easier to resolve.
 */
function improveErrorMessage(error: ErrorInstance): {message: string; hint: string | undefined} {
	switch (error.type) {
		case 'https://problems.luna.akamaiapis.net/papi/v0/validation/attribute_required':
			if (error.errorLocation) {
				return {message: error.detail, hint: `(Add option ${path.basename(error.errorLocation)})`};
			}

			return {message: error.detail, hint: undefined};

		default:
			return {message: error.detail, hint: undefined};
	}
}

/**
 * Checks to see if the `bundleValidationResult` contains errors. If so, they are displayed, and this function
 * terminates execution.
 *
 * @param {CliPrimitives} primitives Used to control how the CLI behaves. Makes testing easier.
 * @param {EdgeWorkerValidationResult} bundleValidationResult The result of requesting an EW validation.
 */
export function terminateOnBadBundle(
	primitives: CliPrimitives,
	bundleValidationResult: EdgeWorkerValidationResult,
): void | never {
	if (Array.isArray(bundleValidationResult.errors) && bundleValidationResult.errors.length > 0) {
		prettyPrintBundleProblems(bundleValidationResult, primitives.stderr);
		primitives.terminate('EdgeWorker bundle validation failed.');
	}
}

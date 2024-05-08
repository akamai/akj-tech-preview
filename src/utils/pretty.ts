/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE.md
 */

import stream, {Writable} from 'node:stream';
import chalk from 'chalk';
import {StructuredError} from './errors';

/** Chalk colour codes, associated with logical entities they should be used on. */
interface ColorCodes {
	success: chalk.Chalk;

	bold: chalk.Chalk;

	warning: chalk.Chalk;

	/** An `error` that blocks execution. */
	error: chalk.Chalk;

	/** Extra information from Property Manager that the user probably can't use. */
	notRelevant: chalk.Chalk;

	/** A path to a local file. */
	path: chalk.Chalk;

	/** A hint about something the user can do to solve a problem. */
	resolutionHint: chalk.Chalk;
}

export let logicalColors: ColorCodes = {
	success: chalk.green,
	bold: chalk.bold,
	warning: chalk.yellow,
	error: chalk.red,
	notRelevant: chalk.dim,
	path: chalk.cyan,
	resolutionHint: chalk.underline,
};

const noop = new chalk.Instance({level: 0});
const noopColors: ColorCodes = {
	success: noop.reset,
	bold: noop.reset,
	warning: noop.reset,
	error: noop.reset,
	notRelevant: noop.reset,
	path: noop.reset,
	resolutionHint: noop.reset,
};

/**
 * For testing - effectively disables the pretty printer so we can check output strings without worrying about the
 * non-printable characters Chalk introduces.
 *
 * @template PromiseReturnType Whatever the passed promise returns.
 * @param {Promise<PromiseReturnType>} toRun A chunk of code that should be executed without colourizing.
 * @returns {PromiseReturnType} The return value of `toRun`.
 */
export async function runWithNoChalk<PromiseReturnType>(toRun: Promise<PromiseReturnType>): Promise<PromiseReturnType> {
	const originalColors = logicalColors;
	logicalColors = noopColors;
	try {
		return await toRun;
	} finally {
		logicalColors = originalColors;
	}
}

/**
 * Display a validation error - those are errors returned by the Property Manager APIs and then mapped back to the
 * customer's JavaScript.
 *
 * @param {string} severity The severity of the error. We assume it's either `ERROR` or `WARNING`.
 * @param {string | undefined} path A path of a file on disk. Presumably identifies where the problem is.
 * @param {string} message An explanation of the problem.
 * @param {string | undefined} hint A hint suggesting to the user how they can resolve their problem.
 * @param {stream.Writable} out The stream to write to.
 */
export function prettyPrintValidationError(
	severity: string,
	path: string | undefined,
	message: string,
	hint: string | undefined,
	out: Writable,
) {
	if (severity == 'ERROR') {
		severity = logicalColors.error(severity);
	} else if (severity == 'WARNING') {
		severity = logicalColors.warning(severity);
	} else {
		severity = chalk.magenta(severity);
	}

	if (path) {
		path = `${logicalColors.path(path)} -`;
	} else {
		path = '';
	}

	if (hint) {
		hint = logicalColors.resolutionHint(hint);
	} else {
		hint = '';
	}

	out.write(`${severity} ${path} ${message} ${hint}\n`);
}

/**
 * Generic pretty printer. Converts the passed `toPrint` to JSON, and then highlights lines that have properties with
 * the names listed in `colorizers`. It isn't perfect, but it's good enough for a tech preview.
 *
 * @param {unknown} toPrint The object to JSONify and colourize.
 * @param {{[key: string]: chalk.Chalk}} colorizers Keys in this array correspond to keys that should be highlighted in
 *   the JSON, while the value the colourizer.
 * @param {stream.Writable} out Where the output is written.
 */
function prettyPrintJson(toPrint: unknown, colorizers: {[key: string]: chalk.Chalk}, out: stream.Writable): void {
	// There are many JSON pretty-printers, but none of the ones I could find would highlight keys differently, depending on their content. So we have this solution: do a JSON pretty-print, and then colourize each line using a regex.
	// For a real product, I think we would choose something a little more correct that could give us better control.
	const text = JSON.stringify(toPrint, undefined, 4);
	const lines = text.split(/(?=\r?\n)/); // Each line keeps the `\n`

	// Convert the properties into regexes
	const regexes: Array<{regex: RegExp; color: chalk.Chalk}> = [];
	for (const [propertyName, color] of Object.entries(colorizers)) {
		const regex = new RegExp(`^\\s+"${propertyName}":`);
		regexes.push({regex, color});
	}

	// Run over the pretty-printed JSON and match each line against the regex
	input: for (const line of lines) {
		for (const {regex, color} of regexes) {
			if (regex.test(line)) {
				out.write(color(line));
				continue input;
			}
		}

		out.write(logicalColors.notRelevant(line));
	}

	out.write('\n');
}

/**
 * Colourizes the `data` field of RFC7807 StructedErrors.
 *
 * Only certain properties of the error are interesting (`title` and `detail`), so those are highlighted.
 *
 * @param {StructuredError} exception The exception to colourize.
 * @param {stream.Writable} out The stream we should write to.
 */
export function prettyPrintStructuredError(exception: StructuredError, out: stream.Writable): void {
	out.write(logicalColors.error(exception.message) + '\n');

	const highlightedProperties = {
		title: logicalColors.error,
		detail: logicalColors.warning,
		schemaLocation: logicalColors.warning,
	};

	prettyPrintJson(exception.data, highlightedProperties, out);
}

/**
 * Given the body of a request to post-validations, pretty print the JSON.
 *
 * @param {unknown} problems The errors and warnings struct returned from post-validations.
 * @param {stream.Writable} out The stream we should write to.
 * @see https://techdocs.akamai.com/edgeworkers/reference/post-validations
 */
export function prettyPrintBundleProblems(problems: unknown, out: stream.Writable): void {
	out.write(logicalColors.error('Errors detected during bundle validation.\n'));

	const highlightedProperties = {
		errors: logicalColors.error,
		warnings: logicalColors.warning,

		type: logicalColors.error,
		message: logicalColors.warning,
	};

	prettyPrintJson(problems, highlightedProperties, out);
}

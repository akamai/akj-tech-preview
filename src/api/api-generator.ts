/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE
 */

import * as prettier from 'prettier';
import through2 from 'through2';
import streamToString from 'stream-to-string';
import {loadCatalog} from './catalog-tools';
import fs from 'node:fs';
import {Command, OptionValues} from '@commander-js/extra-typings';

/**
 * Run the generation of the `types.ts` file.
 *
 * @param {string} path - The path for the pm_data.json file (or equivalent)
 * @param {string} outputFile - The path to write the output if you do not wish to go to STDOUT
 * @param {boolean} format - True if you want prettier to format the file
 * @param {string | unknown} prettierConfigFile - The file/directory that will contain the `.prettierrc` file to use for
 *   formatting
 */
async function run(path: string, outputFile?: string, format?: boolean, prettierConfigFile?: string | unknown) {
	const catalog = await loadCatalog(path);
	const stream = through2();
	streamToString(stream)
		.then(async value => {
			try {
				let formatted = '';
				if (format) {
					const configFile = (await prettier.resolveConfigFile(prettierConfigFile as string)) || '';
					const prettierrc = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
					formatted = await prettier.format(value, {
						...prettierrc,
						parser: 'typescript',
					});
				} else {
					formatted = value;
				}

				if (outputFile) {
					try {
						process.stdout.write(`Writing generated typescript api output to '${outputFile}'\n`);
						fs.writeFileSync(outputFile, formatted);
					} catch (err) {
						process.stdout.write(
							`Failed to write the formatted file to the provided output file '${outputFile}' due to: \n${err}\n`,
						);
						process.exit(1);
					}
				} else {
					process.stdout.write(formatted);
				}

				// If we failed to write some criteria or behaviors, inform the user
				if (catalog.excludedCriteria.length > 0) {
					process.stderr.write(
						`Missing schemas prevented generation of critera: ${catalog.excludedCriteria.join(', ')}\n`,
					);
				}
				if (catalog.excludedBehaviors.length > 0) {
					process.stderr.write(
						`Missing schemas prevented generation of behaviors: ${catalog.excludedBehaviors.join(', ')}\n`,
					);
				}
			} catch (err) {
				process.stderr.write(`Failed to format the types output file file.  \n${err}\n`);
			}
		})
		.catch(err => {
			process.stderr.write(`Failed to write types output to intermediate stream. \n${err}\n`);
		});

	catalog.renderTypeScript(stream);
	stream.end();
}

type CliAction = (path: unknown) => Promise<void>;

/**
 * Setup the CLI that will be used. Configure the commands and attach the build actions.
 *
 * @param {Command} command - The `Command` that will be configured
 * @param {string[]} args - The process args to parse.
 * @param {CliAction} action - The function that will be called when the CLI is invoked successfully
 * @returns {Promise<Command>} - A promise that the command will be parsed and acted on.
 */
async function setupCli(command: Command, args: string[], action: CliAction): Promise<Command> {
	command.name('api-generator').description('Generate the types.ts file.').version('0.1.0');
	command.argument(
		'[catalogPath]',
		'The path to the Property Manager catalog JSON file.',
		'data/pm_catalog-2024-02-12.json',
	);
	command.option(
		'-o, --outputFile <outputFile>',
		'Write to a file rather than stdout.  If not provided, it will write to stdout.',
	);
	command.option(
		'-f, --format [prettierrc]',
		'Apply formatting options via a provided .prettierrc configuration.  If the prettierrc path is not provided, this option will use the default prettier file in the workspace.',
	);
	command.action(action);
	return await command.parseAsync(args);
}

(async function (args) {
	const cli = new Command();
	await setupCli(cli, args, async catalogPath => {
		const outputFile = (cli.getOptionValue('outputFile') as string) || '';
		const opts: OptionValues = cli.opts();
		const format: boolean = opts.format !== undefined ?? false;
		const prettierConfigFile = typeof opts.format === 'string' ? opts.format : '.prettierrc';
		await run(catalogPath as string, outputFile, format, prettierConfigFile);
	});
})(process.argv);

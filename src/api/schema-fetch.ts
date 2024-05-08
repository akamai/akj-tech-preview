/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE
 */

import * as os from 'os';
import {Command, OptionValues} from '@commander-js/extra-typings';
import {PropertyManagerAPI} from './papi';
import EdgeGrid from 'akamai-edgegrid';
import path from 'path';

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
	command.name('schema-fetch').description('Download the named rule format.').version('0.1.0');
	command.argument('<schema-id>', 'Name of the Rule Format to download.');
	command.option(
		'-s, --section <edgeRcSection>',
		'The ~/.edgerc section to use when querying Property Manager.',
		'default',
	);
	command.action(action);
	return await command.parseAsync(args);
}

(async function (args) {
	const cli = new Command();
	await setupCli(cli, args, async schema => {
		const opts: OptionValues = cli.opts();

		const section = opts.section as string;

		const api = new PropertyManagerAPI(
			new EdgeGrid({
				path: path.join(os.homedir(), '.edgerc'),
				section,
				debug: false,
			}),
		);

		const ruleFormat = await api.fetchSchema(schema as string);
		const writeableFormat = JSON.stringify(ruleFormat, undefined, 4);

		process.stdout.write(writeableFormat);
		process.stdout.write('\n');
	});
})(process.argv);

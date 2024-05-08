/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE
 */

/* eslint-disable no-console */

/**
 * Testable implementation of the customer's commandline.
 *
 * There are three functions, expected to be run in this order:
 *
 * - {@link parseArgs()}
 * - {@link runConversion()}
 * - {@link runPropertyManagerUpdate()}
 */

import {Command} from '@commander-js/extra-typings';
import path from 'node:path';
import fs from 'node:fs/promises';
import * as os from 'os';
import * as deref from 'json-pointer';
import * as convert from '../papi/convert';
import * as papi from '../api/papi';
import inquirer from 'inquirer';
import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {NameValuePromptQuestions, productId as defaultProductId} from '../api/papi';
import {exit} from 'node:process';
import nunjucks from 'nunjucks';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import * as fuzzy from 'fuzzy';
import * as process from 'process';
import * as axios from 'axios';
import * as types from '../types';
import * as pcdnPackage from '../../package.json';
import EdgeGrid from 'akamai-edgegrid';
import {Writable, WritableOptions} from 'node:stream';
import {buildTarball} from './ew';
import {
	IsBoolean,
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsPositive,
	IsString,
	validate,
	ValidationError,
} from 'class-validator';
import {uploadAndActivateProperty} from '../api/property-manager';
import {uploadAndActivateNewBundle} from '../api/edgeworkers';
import {ip, mac} from 'address';
import {logicalColors} from '../utils/pretty';
import {storeAgreementLocally, storeAgreementRemotely, hasLocalAgreement, AGREEMENT_FILENAME} from '../agreement';

abstract class StreamCollector extends Writable {
	private lines: string[];

	constructor(options?: WritableOptions) {
		super({...options, decodeStrings: false});
		this.lines = [];
	}

	_write(chunk: Buffer | string, _encoding: string, callback: (error?: Error | null) => void): void {
		const text = Buffer.isBuffer(chunk) ? chunk.toString() : chunk;
		this.lines.push(text);
		callback();
	}

	_final(callback: (error?: Error | null) => void): void {
		callback();
	}

	// Method to retrieve the collected lines
	saved(): string[] {
		return this.lines;
	}

	isEmpty(): boolean {
		return this.lines.length == 0;
	}

	reset(): void {
		this.lines.length = 0;
	}

	abstract print(): void;
}

export class StdOutCollector extends StreamCollector {
	constructor(options?: WritableOptions) {
		super(options);
	}

	print(): void {
		writeFileSync(process.stdout.fd, this.saved().join(''));
		this.reset();
	}
}

export class StdErrCollector extends StreamCollector {
	constructor(options?: WritableOptions) {
		super(options);
	}

	print(): void {
		writeFileSync(process.stderr.fd, this.saved().join(''));
		this.reset();
	}
}

/**
 * Allows us to inject an http library to send the request. The argument is a subset of the Axios config.
 *
 * @see https://axios-http.com/docs/req_config
 * @see https://axios-http.com/docs/res_schema
 */
export type HttpRequestFn = (values: {
	method: 'POST';
	url: string;
	data: string;
	validateStatus: null;
}) => Promise<{status: number; data: string}>;

/** Primitives used in the production version of the CLI. */
export class PCDNCliPrimitives implements CliPrimitives {
	constructor() {
		this.importer = function (path: string): Promise<{onConfig: convert.OnConfigFn}> {
			return import(path);
		};
		this.loadFile = function (path: string): Promise<{toString: () => string}> {
			return fs.readFile(path);
		};
		this.papiApi = (edgeRcPath, edgeGridSection, accountSwitchKey, debugEdgeGrid) => {
			return new papi.PropertyManagerAPI(
				new EdgeGrid({
					path: edgeRcPath,
					section: edgeGridSection,
					debug: debugEdgeGrid,
				}),
				accountSwitchKey,
			);
		};
		this.buildTarballInMemory = async (
			primitives: CliPrimitives,
			edgeWorkerId: number,
			pathToEdgeWorker: string,
			autoSemVer: boolean,
		) => {
			const location = await buildTarball(
				primitives.terminate,
				edgeWorkerId.toString(),
				pathToEdgeWorker,
				autoSemVer,
			);
			return fs.readFile(location);
		};
		this.stdout = new StdOutCollector();
		this.stderr = new StdErrCollector();
		this.statusUpdator = new NoopStatusUpdator();

		this.terminate = (message: string): never => {
			// if there is a status bar, stop it so that it clears.
			if (this.statusUpdator) {
				this.statusUpdator.stop();
			}

			// print any collected stdout output now.
			if (this.stdout) {
				this.stdout.print();
			}

			// print any collected stderr output now.
			if (this.stderr) {
				this.stderr.write('\n' + message + '\n');
				this.stderr.print();
			}

			process.exit(1);
		};

		this.printOutput = () => {
			this.stderr.print();
			this.stdout.print();
		};

		this.httpRequest = axios.default.request;

		this.storeLocalAgreementInHome = async () => storeAgreementLocally(os.homedir());
		this.checkLocalAgreementInHome = async () => {
			return hasLocalAgreement(os.homedir());
		};
	}

	importer: (path: string) => Promise<{onConfig: convert.OnConfigFn}>;
	terminate: Terminator;
	loadFile: (path: string) => Promise<{toString: () => string}>;
	papiApi: (
		edgeRcPath: string,
		edgeGridSection: string,
		accountSwitchKey: string | undefined,
		debugEdgeGrid: boolean,
	) => papi.PropertyManagerAPI;
	buildTarballInMemory: (
		primitives: CliPrimitives,
		ewId: number,
		codePath: string,
		autoSemVer: boolean,
	) => Promise<Uint8Array>;
	stdout: StreamCollector;
	stderr: StreamCollector;
	statusUpdator: StatusUpdator;
	printOutput: () => void;
	httpRequest: HttpRequestFn;
	storeLocalAgreementInHome: () => Promise<void>;

	checkLocalAgreementInHome: () => Promise<boolean>;
}

/** Helper function that prints a message and terminates. */
export type Terminator = (message: string) => never;
// Tools for converting the JSON PM Catalog into TypeScript.
nunjucks.configure(path.join(__dirname, '..', 'templates'), {autoescape: false});

export interface StatusUpdator {
	increment: (value: number, message?: string) => void;
	stop: () => void;
}

/** For tests and stuff where you really don't care about status bars. */
export class NoopStatusUpdator implements StatusUpdator {
	increment = (_value: number, _message?: string) => {};
	stop = () => {};
}

/**
 * Primitives the CLI can call that makes it more testable. The real CLI provides one implementation, while the tests
 * use another.
 */
export interface CliPrimitives {
	/** Loads the customer's JavaScript and returns the module. */
	importer: (path: string) => Promise<{onConfig: convert.OnConfigFn}>;

	/** Print an error message and stop execution. */
	terminate: Terminator;

	/** Load the named file asynchronously and return the contents as a string. */
	loadFile: (path: string) => Promise<{toString: () => string}>;

	/** Create an instance of the PAPI API. */
	papiApi: (
		edgeRcPath: string,
		edgeGridSection: string,
		accountSwitchKey: string | undefined,
		debugEdgeGrid: boolean,
	) => papi.PropertyManagerAPI;

	/** Creates an EdgeWorker tarball for the given `codePath` and saves it into memory. */
	buildTarballInMemory: (
		primitives: CliPrimitives,
		ewId: number,
		codePath: string,
		autoSemVer: boolean,
	) => Promise<Uint8Array>;

	/** Somewhere to write program output. */
	stdout: StreamCollector;

	/** Somewhere to write error messages and status. */
	stderr: StreamCollector;

	/**
	 * Mechanism to update and deal with status bars. Status bars are not always used (like during initialization). If
	 * no status bar is needed, this will be a `NoopStatusUpdator`
	 */
	statusUpdator: StatusUpdator;

	/* Print any output collected in the stdout/stderr collectors */
	printOutput: () => void;

	/** A function that we can use to make an HTTP request. */
	httpRequest: HttpRequestFn;

	/** Record that the user has agreed to stuff. */
	storeLocalAgreementInHome: () => Promise<void>;

	/** Check to see if the local agreement file is present. */
	checkLocalAgreementInHome: () => Promise<boolean>;
}

/** Arguments parsed out of the command line. */
export interface CliArguments {
	/** The path of the JavaScript module we're supposed to load. */
	pathToConfigJs: string;

	/** Path to the directory that contains the main.js and bundle.json of the EdgeWorker. */
	pathToEdgeWorkerRoot: string;

	/**
	 * Path of the JSON file that contains the property coordinates.
	 *
	 * @see papi.PropertyCoordinates
	 */
	pathToPropertyMeta: string;

	/** When `true` we don't upload and activate the property. */
	isDryRun: boolean;

	/** Path to the user's EdgeGrid RC file. */
	edgeRcPath: string;

	/** Name of the section in the EdgeGrid RC file we should load. */
	edgeGridSection: string;

	/** AccountSwitchKey to pass to the PropertyManager API. */
	accountSwitchKey?: string;

	/** When true, we should activate the property even if there are warnings */
	ignoreWarnings: boolean;

	/** The network to activate on */
	network: 'PRODUCTION' | 'STAGING';

	/** When true, we will create a new property */
	init: boolean;

	debugEdgeGrid: boolean;

	/** When true, print the PAPI json to the console. */
	printPapiJson: boolean;
}

/**
 * Run the local portions of the command line tool: load the customer's `onConfig()`, run it, generate PAPI JSON.
 *
 * @param {string[]} argv - Arguments to the program.
 * @param {Terminator} terminate - The function to print the message and end.
 * @returns {CliArguments} - The parsed arguments
 */
export function parseArgs(argv: string[], terminate: Terminator): CliArguments {
	let pathToPackage: string | undefined = undefined;
	let createProperty: boolean = false;
	let printPapiJson: boolean = false;
	let optsProperty: string | undefined = undefined;
	let isDryRun: boolean = false;
	let ignoreWarnings: boolean = false;
	let network: 'PRODUCTION' | 'STAGING' = 'STAGING';

	const p = new Command()
		.name('akj')
		.description('Generates PAPI JSON from an onConfig() function')
		.version(pcdnPackage.version)
		.option('-e, --edgerc <path>', 'Path to your .edgerc authorization file.', `${os.homedir()}${path.sep}.edgerc`)
		.option('-s, --section <name>', 'Section of your .edgerc to use.', `default`)
		.option('-a, --accountSwitchKey <key>', 'Account switch key.')
		.option('-D, --debug', 'Show debug output')
		.exitOverride(err => terminate(err.message));

	const activateCommand = p
		.command('activate')
		.description('Generates PAPI JSON from an onConfig() function and upload it to Property Manager')
		.argument('[base]', 'Root of your PCDN property.')
		.option('-p, --property <path>', 'Optional path to the JSON file that contains property information')
		.option('-d, --dry-run', 'Stop execution after producing PAPI JSON.', false)
		.option('-w, --ignore-warnings', 'Activate the property, even if there are warnings.', false)
		.option('-j, --print-papi-json', 'Print the PAPI Json to the console during property operations.', false);

	activateCommand.action((base: string | undefined, options) => {
		printPapiJson = options.printPapiJson;
		optsProperty = options.property;
		isDryRun = options.dryRun;
		ignoreWarnings = options.ignoreWarnings;
		pathToPackage = base;
		network = 'STAGING';
	});

	p.command('init [base]')
		.description('Configure a Property to use.  Either by creating a new property or finding an existing one.')
		.action((base: string | undefined) => {
			createProperty = true;
			pathToPackage = base;
		});

	p.parse(argv, {from: 'node'});
	if (typeof pathToPackage !== 'string') {
		pathToPackage = process.cwd();
	}

	const pathToConfigJs = path.join(pathToPackage, 'src', 'config.js');
	const defaultPathToPropertyJson = path.join(pathToPackage, 'property.json');
	const pathToEdgeWorkerRoot = path.join(pathToPackage, 'src');
	const opts = p.opts();
	return {
		pathToConfigJs,
		pathToEdgeWorkerRoot,
		pathToPropertyMeta: optsProperty || defaultPathToPropertyJson,
		isDryRun: isDryRun,
		edgeRcPath: opts.edgerc,
		edgeGridSection: opts.section,
		accountSwitchKey: opts.accountSwitchKey,
		ignoreWarnings: ignoreWarnings,
		network,
		init: createProperty,
		debugEdgeGrid: opts?.debug || false,
		printPapiJson: printPapiJson,
	};
}

/**
 * Load the customer's file, extract `onConfig()`, run it, and return the PAPI JSON.
 *
 * @param {CliArguments} args The arguments passed to the CLI
 * @param {CliPrimitives} primitives Injected delegates to perform actions. Useful when testing with mocks.
 * @returns {Promise<object>} A promise to return the Papi JSON object
 */
async function runConversion(args: CliArguments, primitives: CliPrimitives): Promise<object> {
	primitives.statusUpdator.increment(0, 'Converting onConfig.');

	args.pathToConfigJs = path.resolve(args.pathToConfigJs);

	const runnable: {onConfig: convert.OnConfigFn} = await primitives.importer(args.pathToConfigJs).catch(e => {
		primitives.terminate(`Unable to load ${args.pathToConfigJs}: \n\t${e.stack}`);
	});

	const onConfig: convert.OnConfigFn = runnable.onConfig;
	if (typeof onConfig != 'function') {
		primitives.terminate(`${args.pathToConfigJs} must export a function named \`onConfig\``);
	}

	const papiJson = executeCallbackAndBuildTree(onConfig);

	if (args.printPapiJson) {
		primitives.stdout.write(JSON.stringify(papiJson, undefined, 2) + '\n');
	}

	primitives.statusUpdator.increment(1, 'onConfig conversion completed.');

	return papiJson;
}

/**
 * Run the callback and build the PAPI json.
 *
 * @param {convert.OnConfigFn} onConfig The customer built onConfig function
 * @returns {object} The papi json in the `rules` key of the property
 */
function executeCallbackAndBuildTree(onConfig: convert.OnConfigFn): object {
	const cfg = convert.run(onConfig);
	const tree = cfg.toPapiJson();

	return {
		rules: tree,
	};
}

/**
 * Called to perform the activation steps when the user runs `npx akj activate`.
 *
 * @param {CliArguments} args What the user told us to do.
 * @param {CliPrimitives} primitives Utility functions.
 */
export async function runActivation(args: CliArguments, primitives: CliPrimitives): Promise<void> {
	if (!(await primitives.checkLocalAgreementInHome())) {
		primitives.terminate(
			`Activation is available after you agree to the terms and conditions shown by 'npx akj init'. If you have, but there is no ${AGREEMENT_FILENAME} file in your home directory, then contact your Akamai rep.`,
		);
	}

	const papiJson = await runConversion(args, primitives);
	await runPropertyManagerAndEdgeWorkersUpdate(args, primitives, papiJson);
}

/**
 * Upload the given Property Manager rules and create an EdgeWorker bundle then upload it to Property Manager
 *
 * @param {CliArguments} args The arguments passed to the CLI
 * @param {CliPrimitives} primitives Injected delegates to perform actions. Useful when testing with mocks.
 * @param {object} papiJson The Papi JSON object
 */
async function runPropertyManagerAndEdgeWorkersUpdate(args: CliArguments, primitives: CliPrimitives, papiJson: object) {
	if (args.isDryRun) {
		primitives.stderr.write('--dry-run is set. Not uploading PAPI JSON to Property Manager.\n');
		return;
	}

	const propertyCoords: papi.PropertyCoordinates = await loadPropertyInfo(args.pathToPropertyMeta, primitives);
	primitives.statusUpdator.increment(1, 'Property info loaded.');

	// Upload to property manager
	const papiApi = primitives.papiApi(
		args.edgeRcPath,
		args.edgeGridSection,
		args.accountSwitchKey,
		args.debugEdgeGrid,
	);

	// Activate new version of property
	const propertyActivationResponse = await uploadAndActivateProperty(
		primitives,
		papiApi,
		propertyCoords,
		papiJson,
		args.ignoreWarnings,
		args.network,
	);

	// log the successful property activation info
	const {propertyId, version: propertyVersion} = propertyActivationResponse;

	primitives.stderr.write(
		`Activating version ${logicalColors.bold(logicalColors.success(propertyVersion))} of ${logicalColors.bold('property ' + logicalColors.success(propertyId))}.\n`,
	);

	// activate new version of edgeworker
	const {edgeWorkerId, version: edgeWorkerVersion} = await uploadAndActivateNewBundle(
		primitives,
		papiApi,
		propertyCoords,
		args.pathToEdgeWorkerRoot,
		args.network,
	);

	// log the successful edgeworker activation info
	primitives.stderr.write(
		`Activating version ${logicalColors.bold(logicalColors.success(edgeWorkerVersion))} of ${logicalColors.bold('EdgeWorker ' + logicalColors.success(edgeWorkerId))}.\n`,
	);
}

/** The necessary Personally Identifying Information in preparation to send to Store. */
export interface PersonalInformation {
	ip?: string;
	mac?: string;
	timeOfConsent: string;
	/** The user's username in Control Center. */
	uiUserName: string;
	/** Unique identifier for each user, which corresponds to their Control Center profile or client ID. */
	uiIdentityId: string;
	contractId: string;

	/** Id of the customer account the user is part of. */
	accountId: string;
}

/**
 * Create property, CP code and EdgeWorker.
 *
 * @param {CliArguments} args The arguments passed to the CLI
 * @param {CliPrimitives} primitives Injected delegates to perform actions. Useful when testing with mocks.
 */
export async function runInitialization(args: CliArguments, primitives: CliPrimitives) {
	inquirer.registerPrompt('autocomplete', inquirerPrompt);

	// prompt for terms and conditions.  If the user does not accept the terms and conditions, then exit the tech preview.
	const papiApi = await promptTermsAndConditions(args, primitives);
	const {contract} = await askWhichContract(papiApi);

	await recordTermsAndConditionsAgreement(args, primitives, papiApi, contract);
	const existingPropertyAnswers = await askIfUseExistingProperty(papiApi);

	const group = existingPropertyAnswers.group;
	const authorEmail = existingPropertyAnswers.email;
	const autoSemVer = existingPropertyAnswers.useAutoSemVer;
	let propertyId;
	let edgeWorkerId;
	let cpcodeID: string;
	let cpcodeName;
	let productIds;

	if (existingPropertyAnswers.useExistingProperty) {
		const findPropertyAnswers = await useExistingProperty(contract, group, papiApi);
		propertyId = findPropertyAnswers.propertyId;
		edgeWorkerId = Number(findPropertyAnswers.edgeWorkerId);
		const cpCodes = await papiApi.listCpCodes(contract, group);
		const cpCodeAnswer = await selectCpCode(cpCodes);
		cpcodeID = cpCodeAnswer.cpcodeId;
		const cpCodeInfo = cpCodes.find(element => element.value === cpcodeID);
		productIds = cpCodeInfo?.extraInfo;
		cpcodeName = cpCodeInfo?.name;
	} else {
		//prompt for questions to create the property.
		const newPropertyInfo = await createNewProperty(contract, group, papiApi);
		propertyId = newPropertyInfo.propertyId;
		edgeWorkerId = newPropertyInfo.edgeWorkerId;
		cpcodeName = newPropertyInfo.cpcodeName;
		cpcodeID = newPropertyInfo.cpcodeID;
		productIds = [defaultProductId];
	}

	console.log('Creating local files ...');
	createLocalFiles(
		args,
		propertyId,
		contract,
		group,
		edgeWorkerId,
		authorEmail,
		cpcodeName,
		cpcodeID,
		productIds,
		autoSemVer,
	);

	console.log('Initialization completed.  Please edit your config.js file to specify an origin server.');
}
/**
 * Prompt the user to accept the terms and conditions
 *
 * @param {CliArguments} args The arguments to the CLI
 * @param {CliPrimitives} primitives Injected delegates to perform actions.
 * @returns {Promise<papi.PropertyManagerAPI>} The PropertyManagerAPI
 */
async function promptTermsAndConditions(
	args: CliArguments,
	primitives: CliPrimitives,
): Promise<papi.PropertyManagerAPI> {
	// if there is no existing edgeauth file, stop processing nicely or help the user create it.
	if (!existsSync(args.edgeRcPath)) {
		const edgeRcAnswers = await inquirer.prompt([
			{
				type: 'confirm',
				name: 'helpWithEdgeRc',
				message: `The .edgerc file is mandatory. The file '${args.edgeRcPath}' does not exist.  Do you need help creating it based on the instructions at https://techdocs.akamai.com/developer/docs/set-up-authentication-credentials?`,
			},
			{
				type: 'password',
				name: 'edgeAuthClientSecret',
				message: "Enter the EdgeAuth 'client_secret",
				when: answers => answers.helpWithEdgeRc,
			},
			{
				type: 'password',
				name: 'edgeAuthHost',
				message: "Enter the EdgeAuth 'host'",
				when: answers => answers.helpWithEdgeRc,
			},
			{
				type: 'password',
				name: 'edgeAuthAccessToken',
				message: "Enter the EdgeAuth 'access_token'",
				when: answers => answers.helpWithEdgeRc,
			},
			{
				type: 'password',
				name: 'edgeAuthClientToken',
				message: "Enter the EdgeAuth 'client_token'",
				when: answers => answers.helpWithEdgeRc,
			},
		]);

		if (!edgeRcAnswers.helpWithEdgeRc) {
			console.log(
				`An .edgerc file is required to setup the PCDN Tech Preview. See https://techdocs.akamai.com/developer/docs/set-up-authentication-credentials for help in setting up the credentials.`,
			);
			exit(1);
		}

		writeFileSync(
			args.edgeRcPath,
			nunjucks.render('edgeauth.njk', {
				clientSecret: edgeRcAnswers.edgeAuthClientSecret,
				host: edgeRcAnswers.edgeAuthHost,
				accessToken: edgeRcAnswers.edgeAuthAccessToken,
				clientToken: edgeRcAnswers.edgeAuthClientToken,
			}),
		);
		console.log(`Create the .edgerc file at ${args.edgeRcPath}`);
	}
	let papiApi;
	try {
		papiApi = primitives.papiApi(args.edgeRcPath, args.edgeGridSection, args.accountSwitchKey, args.debugEdgeGrid);
	} catch (e) {
		if (e instanceof Error) {
			e.message = e.message.concat(
				'The default .edgec section is [default]. Use -s option to override default section name if necessary.',
			);
		}
		throw e;
	}

	const termsAnswers = await inquirer.prompt([
		{
			type: 'confirm',
			name: 'termsAndConditions',
			message:
				'Do you accept the terms and conditions for using the PCDN tech preview? See the full terms and conditions at https://github.com/akamai/akj-tech-preview/blob/master/LICENSE.md.',
		},
	]);

	if (!termsAnswers.termsAndConditions) {
		console.log('You must accept the terms and conditions of the PCDN tech preview to continue.');
		exit(1);
	}

	return papiApi;
}

/**
 * Create the local files needed to use the demo. This includes edgeworker code, config.js, and npm files.
 *
 * @param {CliArguments} args The provided CLI arguments
 * @param {string} propertyId The property id including prefix
 * @param {string} contract The contract id including prefix
 * @param {string} group The group id including prefix
 * @param {number} edgeWorkerId The edgeworker id
 * @param {string} authorEmail Email address that should receive notifications when Akamai deploys/activates stuff.
 * @param {string | undefined} cpcodeName The name of the CP Code
 * @param {string | undefined} cpcodeID The id for the cp code
 * @param {string[] | undefined} productsID The list of product ids
 * @param {boolean} autoSemVer True to automatically version the bundle.json file
 */
function createLocalFiles(
	args: CliArguments,
	propertyId: string,
	contract: string,
	group: string,
	edgeWorkerId: number,
	authorEmail: string,
	cpcodeName: string | undefined,
	cpcodeID: string,
	productsID: string[] | undefined,
	autoSemVer: boolean,
) {
	const propertyToWrite: papi.PropertyCoordinates = {
		propertyId: propertyId,
		contractId: contract,
		groupId: group,
		edgeWorkerId,
		authorEmail,
		autoSemVer: autoSemVer,
	};
	if (typeof args.accountSwitchKey === 'string') {
		propertyToWrite.accountSwitchKey = args.accountSwitchKey;
	}
	const pathToBaseDir = path.dirname(args.pathToConfigJs);
	if (!existsSync(pathToBaseDir)) {
		mkdirSync(pathToBaseDir, {recursive: true});
	}
	const configJs: object = {
		edgeWorkerId: edgeWorkerId,
		cpcodeID: cpcodeID.replaceAll('cpc_', ''),
		cpcodeName: cpcodeName,
		productsID: productsID,
	};

	writeFileSync(args.pathToConfigJs, nunjucks.render('config.njk', configJs));

	writeFileSync(args.pathToPropertyMeta, JSON.stringify(propertyToWrite, undefined, 4));
	const pathToEdgeWorkerBundle = path.join(pathToBaseDir, 'bundle.json');
	const pathToEdgeWorkerJs = path.join(pathToBaseDir, 'main.js');
	writeFileSync(pathToEdgeWorkerBundle, nunjucks.render('ew-bundle.njk'));
	writeFileSync(pathToEdgeWorkerJs, nunjucks.render('ew-js.njk'));
}

/**
 * @param {papi.PropertyManagerAPI} papiApi The API to Property Manager
 * @returns {Promise<{
 * 	useExistingProperty: boolean;
 * 	email: string;
 * 	contract: string;
 * 	group: string;
 * 	useAutoSemVer: boolean;
 * }>}
 *   The items needed to describe a property
 */
async function askWhichContract(papiApi: papi.PropertyManagerAPI): Promise<{contract: string}> {
	const contracts = await papiApi.listContracts();

	return inquirer.prompt([
		{
			type: 'autocomplete',
			message: 'Which Contract do you want to use?',
			name: 'contract',
			searchText: 'Searching for Contracts.',
			emptyText: 'No matching Contracts found.',
			source: (_answers: unknown, input = '') => {
				const options = {
					extract: (item: papi.NameValuePromptQuestions) => {
						return item.name;
					},
				};
				const found = fuzzy.filter(input, contracts, options).map(item => item.original);
				return found;
			},
		},
	]);
}

/**
 * @param {papi.PropertyManagerAPI} papiApi The API to Property Manager
 * @returns {Promise<{
 * 	useExistingProperty: boolean;
 * 	email: string;
 * 	group: string;
 * 	useAutoSemVer: boolean;
 * }>} The
 *   items needed to describe a property
 */
async function askIfUseExistingProperty(
	papiApi: papi.PropertyManagerAPI,
): Promise<{useExistingProperty: boolean; email: string; contract: string; group: string; useAutoSemVer: boolean}> {
	const groups = await papiApi.listGroups();

	return inquirer.prompt([
		{
			type: 'confirm',
			name: 'useExistingProperty',
			message: 'Do you want to use an existing Property and EdgeWorker?',
		},
		{
			type: 'input',
			name: 'email',
			message: 'Please enter your email address to receive property activation status changes: ',
			validate: email => {
				const valid = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
				if (valid) {
					return true;
				} else {
					return `This is an invalid email: ${email}`;
				}
			},
		},
		{
			type: 'autocomplete',
			message: 'Which Group do you want to use?',
			name: 'group',
			searchText: 'Searching for Groups.',
			emptyText: 'No matching Groups found.',
			source: (_answers: unknown, input = '') => {
				const options = {
					extract: (item: papi.NameValuePromptQuestions) => {
						return item.name;
					},
				};
				const found = fuzzy.filter(input, groups, options).map(item => item.original);
				return found;
			},
		},
		{
			type: 'confirm',
			name: 'useAutoSemVer',
			message: 'Can we automatically increment the EdgeWorker version in bundle.json during activation?',
		},
	]);
}

/**
 * Find the existing property and edgeworker id
 *
 * @param {string} contract The contract to search for the property
 * @param {string} group The group to search for the property
 * @param {papi.PropertyManagerAPI} papiApi API to Property Manager
 * @returns {Promise<any>} The property id and Edgeworker id
 */
async function useExistingProperty(
	contract: string,
	group: string,
	papiApi: papi.PropertyManagerAPI,
): Promise<{propertyId: string; edgeWorkerId: string}> {
	const properties = await papiApi.listProperties(contract, group);
	const edgeWorkers = await papiApi.listEdgeWorkers(group);

	return inquirer.prompt([
		{
			type: 'autocomplete',
			message: 'Which property do you want to use?',
			name: 'propertyId',
			searchText: 'Searching for Properties.',
			emptyText: 'No matching properties found.',
			source: (_answers: unknown, input = '') => {
				const options = {
					extract: (item: papi.NameValuePromptQuestions) => {
						return item.name;
					},
				};
				const found = fuzzy.filter(input, properties, options).map(item => item.original);
				return found;
			},
		},
		{
			type: 'autocomplete',
			message: 'Which EdgeWorker do you want to use?',
			name: 'edgeWorkerId',
			searchText: 'Searching for EdgeWorkers.',
			emptyText: 'No matching EdgeWorkers found.',
			source: (_answers: unknown, input = '') => {
				const options = {
					extract: (item: papi.NameValuePromptQuestions) => {
						return item.name;
					},
				};
				const found = fuzzy.filter(input, edgeWorkers, options).map(item => item.original);
				return found;
			},
		},
	]);
}

/**
 * Select an available cp code
 *
 * @param {NameValuePromptQuestions[]} cpCodes The list of available cp codes to choose
 * @returns {Promise<object>} The cp code id
 */
async function selectCpCode(cpCodes: Array<NameValuePromptQuestions>): Promise<{cpcodeId: string}> {
	return inquirer.prompt([
		{
			type: 'autocomplete',
			message: 'Which CP code do you want to use?',
			name: 'cpcodeId',
			searchText: 'Searching for CP code.',
			emptyText: 'No matching CP code found.',
			source: (_answers: unknown, input = '') => {
				const options = {
					extract: (item: papi.NameValuePromptQuestions) => {
						return item.name;
					},
				};
				const found = fuzzy.filter(input, cpCodes, options).map(item => item.original);
				return found;
			},
		},
	]);
}

/**
 * Create a new property
 *
 * @param {string} contract The contract to search for the property
 * @param {string} group The group to search for the property
 * @param {papi.PropertyManagerAPI} papiApi The API to Property Manager
 * @returns {Promise<any>} The edgeworker, cpcode, property, and cpcodename for the created property
 */
async function createNewProperty(
	contract: string,
	group: string,
	papiApi: papi.PropertyManagerAPI,
): Promise<{
	edgeWorkerId: number;
	cpcodeID: string;
	propertyId: string;
	cpcodeName: string;
}> {
	const createPropertyAnswers = await inquirer.prompt([
		{
			type: 'input',
			name: 'propertyName',
			message: 'What is the property name?',
		},
		{
			type: 'input',
			name: 'hostName',
			message: 'What is the hostname for the property?',
		},
		{
			type: 'input',
			name: 'cpCodeName',
			message: 'What is the CP Code name to use?  (Invalid characters include: ,_\'"^#%:)',
			validate: value => {
				const invalidCharacters = /[,)'^#%:"]/;
				if (invalidCharacters.test(value)) {
					return `The CP Code name cannot include on of: ${invalidCharacters}`;
				}
				return true;
			},
		},
		{
			type: 'input',
			name: 'edgeWorkerName',
			message: 'Enter a name for the EdgeWorker?',
		},
		{
			type: 'list',
			name: 'edgeHostName',
			message: 'Do you want to use an existing Edge Hostname to redirect the property to or create new one?',
			choices: [
				{
					name: 'Use an existing one',
					value: 'existing',
				},
				{
					name: 'Create an Enhanced TLS edge hostname',
					value: 'enhanced',
				},
				{
					name: 'Create a Standard TLS edge hostname',
					value: 'standard',
				},
			],
		},
	]);

	const edgeHostNameId = await getOrCreateEdgeHostName(
		contract,
		group,
		createPropertyAnswers.edgeHostName,
		createPropertyAnswers.hostName,
		papiApi,
	);
	console.log(`Creating property ${createPropertyAnswers.propertyName} ...`);
	const propertyId = await papiApi.createProperty(
		contract,
		group,
		createPropertyAnswers.propertyName,
		types.RULE_FORMAT,
	);
	await papiApi.addPropertyHostNames(contract, group, createPropertyAnswers.hostName, edgeHostNameId, propertyId);
	console.log(`Property ${propertyId} is created`);

	const cpcodeName = createPropertyAnswers.cpCodeName;
	console.log(`Creating CP code ${cpcodeName}...`);
	const cpcodeID = await papiApi.createCpcode(contract, group, cpcodeName);
	console.log('CP code ' + cpcodeID + ' is created');

	console.log(`Creating EdgeWorker ${createPropertyAnswers.edgeWorkerName} ...`);
	const edgeWorkerId = await papiApi.createEdgeWorkerId(group, createPropertyAnswers.edgeWorkerName);
	console.log(`EdgeWorker ${edgeWorkerId} is created`);
	return {
		propertyId: propertyId,
		cpcodeName: cpcodeName,
		cpcodeID: cpcodeID,
		edgeWorkerId: edgeWorkerId,
	};
}

/**
 * Get the EdgeHostname Id. Either create or find it.
 *
 * @param {string} contract The contract to search for the property
 * @param {string} group The group to search for the property
 * @param {string} option If the hostname is existing already
 * @param {string} hostname The hostname to create if not existing
 * @param {papi.PropertyManagerAPI} papiApi The API to Property Manager
 * @returns {Promise<string>} The edgehostname id
 */
export async function getOrCreateEdgeHostName(
	contract: string,
	group: string,
	option: string,
	hostname: string,
	papiApi: papi.PropertyManagerAPI,
): Promise<string> {
	if (option === 'existing') {
		// list all the existing edge hostnames
		const edgeHostNames = await papiApi.listEdgeHostNames(contract, group);
		return getExistingEdgeHostName(edgeHostNames);
	} else if (option === 'standard') {
		console.log('Creating Standard TLS edge hostname ...');
		return papiApi.createEdgeHostNames(contract, group, hostname, false);
	} else {
		console.log('Creating Enhanced TLS edge hostname ...');
		return papiApi.createEdgeHostNames(contract, group, hostname, true);
	}
}

/**
 * Find existing edgehostnames
 *
 * @param {NameValuePromptQuestions[]} edgeHostNames The edgehostnames to search
 * @returns {Promise<string>} The edgehostname ids
 */
export async function getExistingEdgeHostName(edgeHostNames: Array<NameValuePromptQuestions>): Promise<string> {
	const edgeHostNameAnswer = await inquirer.prompt([
		{
			type: 'autocomplete',
			message: 'Which existing edge hostname do you want to use?',
			name: 'edgeHostName',
			searchText: 'Searching for edge hostnames.',
			emptyText: 'No matching edge hostnames found.',
			source: (_answers: unknown, input = '') => {
				const options = {
					extract: (item: papi.NameValuePromptQuestions) => {
						return item.name;
					},
				};
				const found = fuzzy.filter(input, edgeHostNames, options).map(item => item.original);
				return found;
			},
		},
	]);
	return edgeHostNameAnswer.edgeHostName;
}

export class PropertyInfo implements papi.PropertyCoordinates {
	@IsString()
	@IsNotEmpty()
	propertyId: string;

	@IsString()
	@IsNotEmpty()
	contractId: string;

	@IsString()
	@IsNotEmpty()
	groupId: string;

	@IsString()
	@IsOptional()
	@IsNotEmpty()
	accountSwitchKey?: string;

	@IsPositive()
	edgeWorkerId: number;

	@IsEmail()
	authorEmail: string;

	@IsBoolean()
	@IsOptional()
	autoSemVer?: boolean;

	constructor(
		propertyId: string,
		contractId: string,
		groupId: string,
		edgeWorkerId: number,
		authorEmail: string,
		accountSwitchKey?: string,
		autoSemVer?: boolean,
	) {
		this.contractId = contractId;
		this.propertyId = propertyId;
		this.groupId = groupId;
		this.accountSwitchKey = accountSwitchKey;
		this.edgeWorkerId = edgeWorkerId;
		this.authorEmail = authorEmail;
		this.autoSemVer = autoSemVer;
	}

	private static createEmptyPropertyInfo(): PropertyInfo {
		return new PropertyInfo('', '', '', 0, '');
	}

	// Create an empty PropertyInfo and merge in the provided object.
	static createPropertyInfo(loaded: unknown): PropertyInfo {
		return Object.assign(this.createEmptyPropertyInfo(), loaded);
	}

	static formatValidationErrors(validationErrors: ValidationError[]): string {
		return `${validationErrors.flatMap(e => Object.values(e.constraints ?? {}).join(', '))}.`;
	}
}

/**
 * To talk to the Property Manager API, we need to know a bunch of property-related Ids. This function loads them.
 *
 * @param {string} pathToPropertyMeta - TODO
 * @param {CliPrimitives} primitives Dependency injection to make testing easier
 * @returns {Promise<papi.PropertyCoordinates>} Eventually becomes ACG minus the account but plus the property id
 */
export async function loadPropertyInfo(
	pathToPropertyMeta: string,
	primitives: CliPrimitives,
): Promise<papi.PropertyCoordinates> {
	// Load the file
	let file;
	primitives.statusUpdator.increment(0, 'Loading Property Info');
	try {
		file = await primitives.loadFile(pathToPropertyMeta);
	} catch (err) {
		primitives.terminate(`Failed to read '${pathToPropertyMeta}': ${err}`);
	}

	// Parse the file contents as JSON
	let info: PropertyInfo;
	try {
		const temp = JSON.parse(file.toString());
		info = PropertyInfo.createPropertyInfo(temp);
		const validationErrors = await validate(info);

		if (validationErrors.length > 0) {
			primitives.terminate(PropertyInfo.formatValidationErrors(validationErrors));
		}
	} catch (err) {
		primitives.terminate(`Could not parse '${pathToPropertyMeta}' as JSON: ${err}\n`);
	}

	primitives.statusUpdator.increment(1, 'Loaded Property Info');

	return info;
}

/**
 * Given a JSON pointer into the papiJson, find the line of code that generated it. The line of code is extracted from
 * the nearest `__loc` property.
 *
 * @param {object} papiJson The papi json object
 * @param {string} pointerToProblem Papi provided pointer to what is the issue
 * @returns {string | undefined} The resolved line of code, or maybe nothing if we don't find something.
 */
export function resolveLineOfCode(papiJson: object, pointerToProblem: string): string | undefined {
	if (pointerToProblem.startsWith('#')) {
		// The PAPI pointers sometimes start with a nonstandard `#`.
		// We remove it so the helper library can parse the pointer.
		pointerToProblem = pointerToProblem.slice(1);
	}

	const bits = deref.parse(pointerToProblem);

	for (let i = bits.length; i >= 0; i--) {
		const pointer = deref.compile(bits.slice(0, i));

		let target;
		try {
			target = deref.get(papiJson, pointer);
		} catch (_e) {
			// The library throws an exception when it can't resolve a path.
			// Ignore the exception so we can traverse up the hierarchy.
			continue;
		}

		const loc = target?.__loc;
		if (typeof loc === 'string') {
			return loc;
		}
	}

	return undefined;
}

/**
 * Record that the user agreed to the terms and conditions. If we can't connect to the endpoint, then we exit.
 *
 * @param {object} args An instance of the `CliArguments`.
 * @param {string | null} args.accountSwitchKey We need the ASK to tell the Store which account the customer is using.
 * @param {object} primitives Needed so we can call terminate on a failure.
 * @param {HttpRequestFn} primitives.httpRequest Function used to submit data to the Store.
 * @param {Terminator} primitives.terminate Called in case of error
 * @param {papi.PropertyManagerAPI} papiApi How we talk to the PM endpoints.
 * @param {string} contract The contractId the user is running in.
 */
export async function recordTermsAndConditionsAgreement(
	args: {accountSwitchKey?: string},
	primitives: {terminate: Terminator; httpRequest: HttpRequestFn; storeLocalAgreementInHome(): Promise<void>},
	papiApi: papi.PropertyManagerAPI,
	contract: string,
) {
	// Get the information necessary to identify this signer
	const timeOfConsent = new Date();
	let macAddr;
	mac(function (_, addr) {
		macAddr = addr;
	});
	const {uiUserName, uiIdentityId, accountId} = await papiApi.viewProfile();

	const pii: PersonalInformation = {
		ip: ip(),
		mac: macAddr,
		timeOfConsent: timeOfConsent.toString(),
		uiUserName,
		uiIdentityId,
		contractId: contract,
		accountId: args.accountSwitchKey ?? accountId,
	};

	// Record the agreement at a secure remote endpoint
	try {
		await storeAgreementRemotely(primitives.httpRequest, pii);
	} catch (e) {
		if (e instanceof Error) {
			primitives.terminate(
				`Failed to register terms and conditions agreement: ${e.message}\nContact your Akamai rep.`,
			);
		} else {
			throw e;
		}
	}
	await primitives.storeLocalAgreementInHome();
}

/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE.md
 */

import {Property, CriteriaBuilder, RULE_FORMAT} from '../types';
import getCurrentLine from 'get-current-line';
import path from 'node:path';
import * as process from 'node:process';
import Ajv from 'ajv-draft-04';
import fs from 'node:fs';
import betterAjvErrors from 'better-ajv-errors';
import defaults from '@nodecg/json-schema-defaults';

/** The `pmVarHandling` type */
type PmVariableRegistration = {
	/** Options that can contain PM variables in `{{` and `}}` */
	allowsVars?: string[];
	/** Options name PM variables */
	variable?: string[];
	/** Options that are lists of PM variables */
	variableList?: string[];
};

/** Helper that loads a path synchronously. */
export type SynchronousLoadFile = (pathToFile: string) => string;

/** The static configuration file Json representation */
type ScfJson = {
	name: string;
	behaviors?: Array<object>;
	criteria?: Array<object>;
	criteriaMustSatisfy: 'any' | 'all';
	criteriaLocked?: boolean;
	children?: Array<ScfJson>;
	comments?: string;
	uuid?: string;
	templateUuid?: string;
	templateLink?: string;
};

/** The static configuration file Schema Json representation */
type ScfSchemaJson = {
	definitions: {
		catalog: {
			behaviors: Record<string, object>;
			criteria: Record<string, object>;
			option_types: Record<string, object>;
		};
		behavior: object;
		criteria: object;
	};
};

/**
 * Find the line of code that was associated with generating the PAPI rule.
 *
 * @returns {string} - Line file and line that generated the PAPI
 */
function findLineOfCode(): string {
	const currentLine = getCurrentLine({file: new RegExp('(types.[jt]s|convert.[jt]s)')});
	const relativeFilePath = path.relative(process.cwd(), currentLine.file);
	return `${relativeFilePath}:${currentLine.line}`;
}

/**
 * Given a relative path to a Static Config File, resolve the path to load.
 *
 * @param {string} pathOfCaller Absolute path of the file that's importing the JSON.
 * @param {string} pathToImportFrom Possibly relative path of the file to import.
 * @returns {string} Path to the file that we want to import. The file may not exist.
 */
export function resolveImportPath(pathOfCaller: string, pathToImportFrom: string): string {
	const fileDir = path.dirname(pathOfCaller);
	const resolved = path.resolve(fileDir, pathToImportFrom);
	return resolved;
}

/** The argument passed to `.any()` or `.all()`. It only allows the addition of criteria. */
export class MatchRuleBuilder {
	matchAccumulator: Array<{
		option: {name: string; options: object; __loc: string};
		pmVarRegistration: PmVariableRegistration;
	}> = [];

	public addFromProperty(
		_type: 'CRITERIA' | 'BEHAVIOR',
		name: string,
		pmVarRegistration: PmVariableRegistration,
		params: object,
	): MatchRuleBuilder {
		this.matchAccumulator.push({
			option: {name, options: params, __loc: findLineOfCode()},
			pmVarRegistration: pmVarRegistration,
		});
		return this;
	}
}

/** Trait declaring that the receiver can be turned into PAPI JSON. */
interface JsonFlattenable {
	toPapiJson(): object;
}

/** Represents a PAPI rule tree imported with {@link RuleBuilder.importChildRule()}. */
class StaticallyImportedPapi implements JsonFlattenable {
	readonly json: object;
	readonly originalLineOfCode: string;

	constructor(json: object, loc: string) {
		this.json = json;
		this.originalLineOfCode = loc;
	}

	toPapiJson(): object {
		// This could be done earlier, but it's consistent
		// with the implementation of RuleBuilder.
		Object.assign(this.json, {__loc: this.originalLineOfCode});
		return this.json;
	}
}

/** Indicate that the validation of a json file failed. */
export class BadJsonError extends Error {
	readonly filePath: string;

	constructor(message: string, filePath: string) {
		super(message);
		this.filePath = filePath;
		this.name = 'BadJsonError';
	}

	toString(): string {
		return `\nFailed to validate static configuration file, errors are in ${this.filePath}: \n${this.message}\n`;
	}
}

/** Provides matcher/command/setter API to the caller, while internally managing tree state. */
export class RuleBuilder implements JsonFlattenable {
	/** Only defined for root. */
	readonly variables: {[key: string]: PropertyManagerVariableDefinition} = {};

	/** Pointer to the parent of this node. The value is `undefined` for the root node. */
	readonly parent?: RuleBuilder;

	/** Uninitialized PAPI JSON. Until `toPapiJson()` is called, this is just used to carry the attributes. */
	readonly papiAttributes: PapiJson = {};

	/** Criteria PAPI JSON */
	readonly matchers: Array<object> = [];

	/** Behaviour PAPI JSON */
	readonly commands: Array<object> = [];

	/** Child nodes. */
	readonly children: Array<JsonFlattenable> = [];

	/** Function that loads Static Configuration Files. */
	readonly scfLoader: SynchronousLoadFile;

	/**
	 * Internal tracker for the line of code that caused the rule to be created. May be `undefined` for the root rule
	 * (since that's created by our framework). Otherwise, the value should be written into the text of the outgoing
	 * comment, or written to the name, if there isn't one.
	 */
	readonly originalLineOfCode?: string;

	/**
	 * Create a new RuleBuilder.
	 *
	 * @param {SynchronousLoadFile} scfLoader Function we use to load a Static Configuration Files (SCF).
	 * @param {RuleBuilder | undefined} parent The parent of this rule. May be undefined for the root, but should be
	 *   defined for every other rule.
	 * @param {string} loc The line of (customer) code that created this rule.
	 */
	constructor(scfLoader: SynchronousLoadFile, parent: RuleBuilder | undefined, loc?: string) {
		this.scfLoader = scfLoader;

		if (parent) {
			this.parent = parent;
		}

		if (loc) {
			this.originalLineOfCode = loc;
		}
	}

	public name(name: string): RuleBuilder {
		this.papiAttributes.name = name;
		return this;
	}

	public comment(text: string): RuleBuilder {
		this.papiAttributes.comments = text;
		return this;
	}
	public is_secure(secureRule: boolean): RuleBuilder {
		if (this.papiAttributes.name === 'default') {
			this.papiAttributes.options = {
				is_secure: secureRule,
			};
		}
		return this;
	}

	public group(groupName: string, comment?: string): RuleBuilder {
		const child = new RuleBuilder(this.scfLoader, this, findLineOfCode());
		child.name(groupName);
		child.comment(comment || '');
		this.children.push(child);
		return child;
	}

	public newBlankRule(ruleName: string, comment?: string): RuleBuilder {
		const child = new RuleBuilder(this.scfLoader, this, findLineOfCode());
		child.name(ruleName);
		child.comment(comment || '');
		this.children.push(child);
		return child;
	}

	do(cb: (cfg: CriteriaBuilder) => void, action: CriteriaMustSatisfy): RuleBuilder {
		const criteriaParam = new MatchRuleBuilder();
		cb(new CriteriaBuilder(criteriaParam));
		const child = new RuleBuilder(this.scfLoader, this, findLineOfCode());
		child.papiAttributes.criteriaMustSatisfy = action;
		this.children.push(child);

		// Populate a rule with the matchers that accumulated in the builder.
		for (const pair of criteriaParam.matchAccumulator) {
			child.matchers.push(pair.option);
			child.registerVariablesInOptions(pair.pmVarRegistration, pair.option.options);
		}
		child.papiAttributes.criteriaMustSatisfy = 'any';

		return child;
	}

	public doAny(cb: (cfg: CriteriaBuilder) => void): RuleBuilder {
		return this.do(cb, 'any');
	}

	public doAll(cb: (cfg: CriteriaBuilder) => void): RuleBuilder {
		return this.do(cb, 'all');
	}

	public addFromProperty(
		type: 'CRITERIA' | 'BEHAVIOR',
		name: string,
		pmVarHandling: {allowsVars?: string[]; variable?: string[]; variableList?: string[]},
		params: object,
	): RuleBuilder {
		this.findRoot().registerVariablesInOptions(pmVarHandling, params);

		if (type == 'CRITERIA') {
			const child = new RuleBuilder(this.scfLoader, this, findLineOfCode());
			child.matchers.push({name, options: params, __loc: findLineOfCode()});

			this.children.push(child);
			return child;
		} else {
			this.commands.push({name, options: params, __loc: findLineOfCode()});

			return this;
		}
	}

	/**
	 * Find all of the PM variables referenced in the options, and record them in the root of the tree. Note that we
	 * only consider the options fields that are allowed to contain variables.
	 *
	 * @param {PmVariableRegistration} pmVarHandling A series of option names detailing how PM variables should be
	 *   handled.
	 * @param {object} params The options passed in.
	 */
	private registerVariablesInOptions(pmVarHandling: PmVariableRegistration, params: object) {
		const referencedPmVars: string[] = [];

		// Find the PM variables referenced with `{{` and `}}` in strings
		if (pmVarHandling.allowsVars) {
			referencedPmVars.push(...RuleBuilder.extractUserVariablesInOptions(pmVarHandling.allowsVars, params));
		}

		// Find the PM variables named in options with the type `variable`
		if (pmVarHandling.variable) {
			referencedPmVars.push(...RuleBuilder.extractVariableNameOptions(pmVarHandling.variable, params));
		}

		// Now find the PM variables named in options of type `variableList`
		if (pmVarHandling.variableList) {
			referencedPmVars.push(...RuleBuilder.extractVariableListOptions(pmVarHandling.variableList, params));
		}

		if (referencedPmVars.length === 0) {
			return;
		}

		// We have at least one PM variable that may be new, so we try to register it.
		const root = this.findRoot();
		for (const variable of referencedPmVars) {
			if (variable in root.variables) {
				// This prevents variables from being overwritten - that means we can record the line of code in the value and have it show the first place the variable was referenced.
				continue;
			}

			const loc = findLineOfCode();
			root.variables[variable] = {
				name: variable,
				description: `Variable defined on ${loc}`,
				hidden: false,
				sensitive: false,
				__loc: loc,
			};
		}
	}

	/**
	 * Given an options object and the name of each option that can contain a PM variable, make a list of variable names
	 * that are defined by this object. We only return variable names that are referenced in the
	 * {@link https://techdocs.akamai.com/property-mgr/reference/declare-a-variable | `user` namespace} (ie, have a
	 * `user.` prefix), meaning variables referenced with `{{builtin.FOO}}` or `{{parent.BAR}}` are ignored.
	 *
	 * @param {string[]} allowsVars Names of the options that are allowed to contain Property Manager variables.
	 * @param {object} params Options passed in.
	 * @returns {string[]} All of the propery manager variables named in the allowed options.
	 */
	static extractUserVariablesInOptions(allowsVars: string[], params: object): string[] {
		const ret: string[] = [];

		for (const optionName of allowsVars) {
			const optionValue: unknown = params[optionName as keyof object];

			if (typeof optionValue !== 'string') {
				continue;
			}

			// Use the `g` flag to make the RegExp stateful, so we can repeatedly call `exec()` to walk each PM variable in the string
			const varRegExp = /{{user\.(.*?)}}/g;

			let match;
			while (null != (match = varRegExp.exec(optionValue))) {
				ret.push(match[1]);
			}
		}

		return ret;
	}

	/**
	 * For options with the type `variable`, the value of the option is a PM variable reference. Find all of those and
	 * return them.
	 *
	 * @param {string} variables Names of the options variables.
	 * @param {object} params The options passed in by the customer .
	 * @returns {string[]} Names of the PM variables that are referenced by options of type `variable`.
	 */
	static extractVariableNameOptions(variables: string[], params: object): string[] {
		const ret: string[] = [];

		for (const optionName of variables) {
			const optionValue: unknown = params[optionName as keyof typeof params];

			if (typeof optionValue !== 'string') {
				continue;
			}

			ret.push(optionValue);
		}

		return ret;
	}

	static extractVariableListOptions(variableList: string[], params: object): string[] {
		const ret: string[] = [];

		for (const optionName of variableList) {
			const optionValue: unknown = params[optionName as keyof typeof params];

			if (typeof optionValue === 'undefined') {
				continue;
			}

			// We need the user passed in an array here. If they don't, then this
			// function silently fails to find the variable names, and the user won't
			// see their variables in the root rule.
			if (!Array.isArray(optionValue)) {
				throw new Error(
					`Expected the option ${optionName} to be an array of strings, but it was ${typeof optionValue}.`,
				);
			}

			// Similarly, we hope the values are strings. But we don't enforce that.
			ret.push(...optionValue);
		}

		return ret;
	}

	/**
	 * User-visible function for importing a Static Configuration File (SCF).
	 *
	 * Determines where the function was called from, resolves the path, and then hands off to an internal
	 * implementation.
	 *
	 * @param {string} path A path (potentially) relative to the calling file.
	 * @returns {RuleBuilder} The current rule.
	 */
	public importChildRule(path: string): RuleBuilder {
		const currentLine = getCurrentLine({file: new RegExp('(types.[jt]s|convert.[jt]s)')});

		const absPath = resolveImportPath(currentLine.file, path);

		return this.importChildRuleToPath(absPath);
	}

	/**
	 * Internal static config import. Load the given path and insert it as a child of the current tree.
	 *
	 * @param {string} absPath Absolute path to the JSON file we want to load.
	 * @returns {RuleBuilder} Current node.
	 */
	public importChildRuleToPath(absPath: string): RuleBuilder {
		const loaded = this.scfLoader(absPath);

		const unvalidated = JSON.parse(loaded);

		const schema = JSON.parse(fs.readFileSync(`${__dirname}/../../schema/${RULE_FORMAT}-scf.json`, 'utf-8'));
		this.validateScfJson(unvalidated, schema, loaded, absPath);

		let validatedWithDefaults = unvalidated;
		try {
			// Inserting defaults in the validated static json
			validatedWithDefaults = this.insertDefaults(schema, unvalidated);
		} catch (err) {
			process.stderr.write(
				`\nFailed to inserts defaults for properties in static configuration file. Will use the static configuration json object without defaults inserted.\nErrors are in: \n${err}\n`,
			);
		}

		this.children.push(new StaticallyImportedPapi(validatedWithDefaults, findLineOfCode()));

		return this;
	}

	/**
	 * Insert defaults for properties in SCF
	 *
	 * @param {ScfSchemaJson} schema SCF Json schema
	 * @param {ScfJson} validated Validated json object for SCF.
	 * @returns {ScfJson} Validated json object for SCF with defaults inserted.
	 */
	private insertDefaults(schema: ScfSchemaJson, validated: ScfJson): ScfJson {
		const behaviors = validated.behaviors;
		const criteria = validated.criteria;
		const children = validated.children;
		const validatedWithDefaults = validated;

		if (typeof behaviors !== 'undefined' && behaviors.length !== 0) {
			validatedWithDefaults.behaviors = this.insertDefaultsForBehaviorsOrCriteria(schema, 'behaviors', behaviors);
		}
		if (typeof criteria !== 'undefined' && criteria.length !== 0) {
			validatedWithDefaults.criteria = this.insertDefaultsForBehaviorsOrCriteria(schema, 'criteria', criteria);
		}
		if (typeof children !== 'undefined' && children.length !== 0) {
			validatedWithDefaults.children = this.insertDefaultsForChildren(schema, children);
		}
		return validatedWithDefaults;
	}

	/**
	 * Insert defaults for properties in the children of the SCF
	 *
	 * @param {ScfSchemaJson} schema SCF Json schema
	 * @param {ScfJson[]} children The children in Validated json object for SCF.
	 * @returns {ScfJson[]} Validated json object for SCF with defaults of the properties in the children inserted.
	 */
	private insertDefaultsForChildren(schema: ScfSchemaJson, children: Array<ScfJson>): Array<ScfJson> {
		children.forEach(child => {
			this.insertDefaults(schema, child);
		});
		return children;
	}
	/**
	 * Insert defaults for properties in the behaviors of the SCF
	 *
	 * @param {ScfSchemaJson} schema SCF Json schema
	 * @param {'behaviors' | 'criteria'} type The type that needs to insert defaults.
	 * @param {object[]} behaviorsOrCriteria The behaviors or criteria in Validated json object for SCF.
	 * @returns {object[]} Validated json object for SCF with defaults of the properties in the behaviors inserted.
	 */
	private insertDefaultsForBehaviorsOrCriteria(
		schema: ScfSchemaJson,
		type: 'behaviors' | 'criteria',
		behaviorsOrCriteria: Array<object>,
	): Array<object> {
		behaviorsOrCriteria.forEach((entry: any) => {
			const schemaDefinition = schema.definitions.catalog[type][entry.name];
			const defaultProperties: any = defaults(schemaDefinition);
			for (const key in defaultProperties.options) {
				if (!entry.options.hasOwnProperty(key)) {
					entry.options[key] = defaultProperties.options[key];
				}
			}
		});
		return behaviorsOrCriteria;
	}

	/**
	 * Static config file validation.
	 *
	 * @param {object} unvalidated JSON object that needs to validate.
	 * @param {ScfSchemaJson} schema Json schema object
	 * @param {string} rawJson Raw JSON string of the `unvalidated` JSON object.
	 * @param {string} jsonPath Absolute path of the json file to be validated.
	 */
	private validateScfJson(unvalidated: object, schema: ScfSchemaJson, rawJson: string, jsonPath: string) {
		const ajv = new Ajv({allErrors: true});
		const validate = ajv.compile(schema);
		const valid = validate(unvalidated);
		if (!valid) {
			let errors = '';
			if (validate.errors) {
				const betterErrors = betterAjvErrors(schema, unvalidated, validate.errors, {
					// Raw JSON payload used when formatting codeframe. Gives accurate line and column listings.
					json: rawJson,
					format: 'cli',
				});
				errors += betterErrors;
			}
			throw new BadJsonError(errors, jsonPath);
		}
	}

	/**
	 * @returns {object} An object suitable for having `JSON.stringify()` called on it to emit PAPI rules. Note that
	 *   this _isn't_ JSON.
	 */
	public toPapiJson(): object {
		const ret: PapiJson = {...this.papiAttributes};

		if (typeof ret.name === 'undefined') {
			// The PAPI API rquires every rule to have a name. This is a placeholder if the
			// customer doesn't supply us with a name.
			ret.name = this.originalLineOfCode;
		}

		if (typeof ret.comments === 'undefined') {
			ret.comments = this.originalLineOfCode;
		} else if (typeof this.originalLineOfCode !== 'undefined') {
			// We always want to include the LoC, so we force it into the comment if the user has already specified one.
			ret.comments += `\n${this.originalLineOfCode}`;
		}

		if (this.matchers.length > 0) {
			ret.criteria = this.matchers;
		}

		const varList = Object.values(this.variables);
		if (varList.length > 0) {
			ret.variables = varList;
		}

		if (this.commands.length > 0) {
			ret.behaviors = this.commands;
		}

		if (this.children.length > 0) {
			ret.children = [];
			for (const child of this.children) {
				ret.children.push(child.toPapiJson());
			}
		}

		return ret;
	}

	/**
	 * Returns the RuleBuilder at the top of the tree.
	 *
	 * @returns {RuleBuilder} The top-most rule in the tree. It could be this node.
	 */
	private findRoot(): RuleBuilder {
		// We want to use `walker` to walk up the Rule hierarchy, so we need to suppress the `no-this-alias` rule.
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		let walker: RuleBuilder = this;

		while (typeof walker.parent !== 'undefined') {
			walker = walker.parent;
		}

		return walker;
	}
}

/**
 * The declaration of a PM variable.
 *
 * @see https://techdocs.akamai.com/property-mgr/reference/declare-a-variable
 */
interface PropertyManagerVariableDefinition {
	name: string;
	value?: string;
	description?: string;
	hidden: boolean;
	sensitive: boolean;
	/**
	 * This isn't part of the real definition, but it allows us to show the customer the line of code that introduces a
	 * PM variable that fails validation by Pulsar.
	 */
	__loc?: string;
}

type CriteriaMustSatisfy = 'any' | 'all';

/** Represents a PAPI JSON rule. */
interface PapiJson {
	name?: string;
	comments?: string;
	variables?: Array<PropertyManagerVariableDefinition>;
	criteria?: Array<object>;
	criteriaMustSatisfy?: CriteriaMustSatisfy;
	behaviors?: Array<object>;
	children?: Array<PapiJson>;
	options?: object;
}

/** The `onConfig()` function we expect customers to implement. */
export type OnConfigFn = (cfg: Property) => Property;

/**
 * Execute an `onConfig()`, and return the configured RuleBuilder.
 *
 * @param {SynchronousLoadFile} scfLoader A function that loads the
 * @param {OnConfigFn} onConfig The configuration to build from
 * @returns {RuleBuilder} The rulebuilder containing the PAPI rule tree.
 */
export function run(scfLoader: SynchronousLoadFile, onConfig: OnConfigFn): RuleBuilder {
	const cfg = new RuleBuilder(scfLoader, undefined, '');
	cfg.papiAttributes.name = 'default';

	onConfig(new Property(cfg));

	return cfg;
}

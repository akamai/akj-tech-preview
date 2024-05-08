/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE
 */

import {Property, CriteriaBuilder} from '../types';
import getCurrentLine from 'get-current-line';
import path from 'node:path';
import * as process from 'node:process';

/** The `pmVarHandling` type */
type PmVariableRegistration = {
	/** Options that can contain PM variables in `{{` and `}}` */
	allowsVars?: string[];
	/** Options name PM variables */
	variable?: string[];
	/** Options that are lists of PM variables */
	variableList?: string[];
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

/** The argument passed to `.any()` or `.all()`. It only allows the addition of criteria. */
class MatchRuleBuilder {
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

/** Provides matcher/command/setter API to the caller, while internally managing tree state. */
export class RuleBuilder {
	/** Only defined for root. */
	readonly variables: {[key: string]: PropertyManagerVariableDefinition} = {};

	/** Pointer to the parent of this node. The value is `undefined` for the root node. */
	readonly parent?: RuleBuilder;

	/** Attributes settable from the PAPI API. */
	readonly papiAttributes: PapiJson = {};

	readonly matchers: Array<object> = [];
	readonly commands: Array<object> = [];

	readonly children: Array<RuleBuilder> = [];

	/**
	 * Internal tracker for the line of code that caused the rule to be created. May be `undefined` for the root rule
	 * (since that's created by our framework). Otherwise, the value should be written into the text of the outgoing
	 * comment, or written to the name, if there isn't one.
	 */
	readonly originalLineOfCode?: string;

	/**
	 * Create a new RuleBuilder.
	 *
	 * @param {RuleBuilder | undefined} parent The parent of this rule. May be undefined for the root, but should be
	 *   defined for every other rule.
	 * @param {string} loc The line of (customer) code that created this rule.
	 */
	constructor(parent: RuleBuilder | undefined, loc?: string) {
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
		const child = new RuleBuilder(this, findLineOfCode());
		child.name(groupName);
		child.comment(comment || '');
		this.children.push(child);
		return child;
	}

	do(cb: (cfg: CriteriaBuilder) => void, action: CriteriaMustSatisfy): RuleBuilder {
		const criteriaParam = new MatchRuleBuilder();
		cb(new CriteriaBuilder(criteriaParam));
		const child = new RuleBuilder(this, findLineOfCode());
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
			const child = new RuleBuilder(this, findLineOfCode());
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
 * Take a onConfig file and convert it into a rulebuilder
 *
 * @param {OnConfigFn} onConfig The configuration to build from
 * @returns {RuleBuilder} The rulebuilder.
 */
export function run(onConfig: OnConfigFn): RuleBuilder {
	const cfg = new RuleBuilder(undefined, '');
	cfg.papiAttributes.name = 'default';

	onConfig(new Property(cfg));

	return cfg;
}

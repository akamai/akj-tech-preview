/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE.md
 */

import stream from 'node:stream';
import nunjucks from 'nunjucks';

// Tools for converting the JSON PM Catalog into TypeScript.
nunjucks.configure('src/templates', {autoescape: false});

/** Corresponds to the latest version of a criteria or behavior from the PM catalog. */
class CatalogEntry {
	/** Function name */
	name: string;

	type: CriteriaOrBehaviourDefinition;

	documentation: DocumentationDetails;

	/** The options definition from the Rule Format. */
	schema: {[key: string]: NamedOptionSchema};

	// TODO: arguments
	// TODO: Validation rules

	constructor(
		name: string,
		type: CriteriaOrBehaviourDefinition,
		documentation: DocumentationDetails,
		schema: RuleFormatOptionsSchema,
	) {
		this.name = name;
		this.type = type;
		this.schema = schema;
		this.documentation = documentation;
	}
}

/** Indicates how PM variables should be registered when processing an option. */
type PmVariableRegistration =
	/** No PM variable handling. The option should not be checked for PM variables. */
	| undefined
	/** The option may contain PM variables in `{{` and `}}` */
	| 'allowsVars'
	/** The option is the name of a PM variable. */
	| 'variable'
	/** The option is a list of names of PM variables. */
	| 'variableList';

/**
 * A representation a parameter that needs to be added to the generated Typescript interface. This parameter includes
 * information on the name, type, optionality and documentation.
 */
interface Parameter {
	/*	The name of the parameter */
	name: string;

	/* If the parameter is optional. */
	optional: boolean;

	/* The type for the parameter */
	type: string;

	/* The documentation that will fill out the comment describing what the parameter is doing */
	documentation: string;

	/** The default value of the parameter. */
	defaultVal: number | string | boolean | undefined;

	/** Contains the TypeScript text that we insert into the `if` statement before a default is assigned. */
	defaultAssignmentStmt: ParameterDefaultAssignmentGuard | undefined;

	/**
	 * Indicates if the value is allowed to contain references to PM variables. Mapped from `allows_vars` in the
	 * pm_catalog.
	 */
	allowsVars: boolean;

	/**
	 * How PM variables should be registered for this option.
	 *
	 * 1. `undefined` means this option has no PM variable handling - it's just a verbatim value.
	 * 2. `'allowsVars'` means this option may have embedded `{{` and `}}` to include PM variables.
	 * 3. `'variable'` indicates this is a variable name, and it should be treated as a new PM variable reference.
	 * 4. `'variableList'` indicates this is a list of variable names, where each should be treated as a new PM variable
	 *    reference.
	 */
	pmVarRegistration: PmVariableRegistration;
}

/**
 * A variant of a set of parameters. If parameters to a function call have conditional visibility, then the function
 * will have a set of variants of the arguments that can be provided.
 */
interface ParameterVariant {
	/* An array of parameters in the variant. */
	parameters: Parameter[];
}

/** The struct passed to function.njk */
interface TypeFunction {
	/* The name of the function */
	name: string;

	/* The slug for linking to techdocs help */
	help: string;

	/* The function description */
	description: string;

	/* If this is a criteria or a behavior */
	type: 'CRITERIA' | 'BEHAVIOR';

	/* The parameters for the function */
	parameters: Parameter[];

	/* The return type for the function */
	returnType: 'Property' | 'CriteriaBuilder';

	/* The name to be used as the return type for the papi JSON */
	papiName: string;

	defaultAssignmentStatements: Array<{
		name: string;
		stmt: string;
		value: unknown;
		dependsOnVars: string[];
	}>;

	/** A JSONified list of the option names that are allowed to contain Property Manager variables. */
	paramsThatAllowPMVars: string;
}

/**
 * Describes how to generate a default statement in TypeScript. Internal representation before we build something the
 * template can consume.
 */
interface ParameterDefaultAssignmentGuard {
	/** Name of the option that this guards. */
	name: string;

	/**
	 * A TypeScript expression that acts as the guard. Suitable for insertion into an `if` statement. The string `%s` is
	 * used as a placeholder for the name of the variable.
	 *
	 * @see PLACEHOLDER The placeholder constant.
	 */
	jsExpression: string;

	/** Variables named in the expression. Allows us to reorder the assignments, should that ever be necessary. */
	dependsOnVars: Array<string>;
}

/** When we're generating TypeScript, this is used for the name of the parameter variable. */
const PLACEHOLDER = '%s';

/** Contains the catalog entries available to customers. Broken up by criteria and behaviours. */
export class Catalog {
	/** The Rule Format of the schemas in the {@link CatalogEntry}. */
	readonly ruleFormat: string;

	criteria: Map<string, CatalogEntry> = new Map();
	behaviors: Map<string, CatalogEntry> = new Map();

	excludedCriteria = new Array<string>();
	excludedBehaviors = new Array<string>();

	private constructor(ruleFormat: string) {
		this.ruleFormat = ruleFormat;
	}

	/**
	 * Initialize a {@link Catalog} with references to the given PM catalog and JSON schema for each criteria and
	 * behavior. After completion, the Catalog object can be used to generate `types.ts`.
	 *
	 * @param {PmCatalog} pmCatalog The Property Manager catalog JSON, as acquired from Andrew Faden.
	 * @param {any} schema The Rule Format (aka JSON schema) for the given Property Manager catalog.
	 * @returns {Catalog} The constructed Catalog, suitable for function generation.
	 */
	public static loadFrom(pmCatalog: PmCatalog, schema: RuleFormatSchema): Catalog {
		const catalog = new Catalog(pmCatalog.ruleFormat);

		const criteriaSchema = schema.definitions.catalog.criteria;
		for (const condition in pmCatalog.latestVersions.conditions) {
			const version = pmCatalog.latestVersions.conditions[condition];

			if (condition in pmCatalog.conditionDefinitions) {
				if (!(condition in criteriaSchema)) {
					// Save the items we refuse to handle until later.
					catalog.excludedCriteria.push(condition);
					continue;
				}

				const defn = pmCatalog.conditionDefinitions[condition][version];
				const documentation = pmCatalog.documentation.conditions[condition];

				catalog.criteria.set(
					condition,
					new CatalogEntry(
						condition,
						defn,
						documentation,
						criteriaSchema[condition].properties.options.properties,
					),
				);
			}
		}

		const behaviorSchema = schema.definitions.catalog.behaviors;

		for (const behavior in pmCatalog.latestVersions.features) {
			const version = pmCatalog.latestVersions.features[behavior];

			if (behavior in pmCatalog.featureDefinitions) {
				if (!(behavior in behaviorSchema)) {
					// Save the excluded behaviours that we can't handle, so they can be printed later
					catalog.excludedBehaviors.push(behavior);
					continue;
				}

				const defn = pmCatalog.featureDefinitions[behavior][version];
				const documentation = pmCatalog.documentation.features[behavior];

				catalog.behaviors.set(
					behavior,
					new CatalogEntry(
						behavior,
						defn,
						documentation,
						behaviorSchema[behavior]?.properties.options.properties,
					),
				);
			}
		}

		return catalog;
	}

	/**
	 * Determines the type declaration for an `option` that will become a TypeScript boolean.
	 *
	 * @param {CriteriaOrBehaviourOption} opt The `CriteriaOrBehaviourOption` to define
	 * @returns {[boolean | undefined, string]} First entry is the default value (in TypeScript, it must be written to
	 *   text later), or `undefined` if there is no default value. The second entry is the type - in text that is
	 *   suitable to write to `types.ts`.
	 */
	public static makeTypeDeclarationBoolean(opt: CriteriaOrBehaviourOption): [boolean | undefined, string] {
		let defaultVal: boolean | undefined = undefined;

		if (
			opt.defaultVal === false ||
			opt.defaultVal === 'false' ||
			opt.defaultVal === 'off' ||
			opt.defaultVal === 'OFF' ||
			opt.defaultVal === '0' ||
			opt.defaultVal === 'IGNORE' ||
			opt.defaultVal == 'ignore' ||
			opt.defaultVal === 'IMAGE'
		) {
			defaultVal = false;
		} else if (
			opt.defaultVal === true ||
			opt.defaultVal === 'true' ||
			opt.defaultVal === 'on' ||
			opt.defaultVal === 'ON' ||
			opt.defaultVal === '1' ||
			opt.defaultVal === 'APPEND' ||
			opt.defaultVal == 'append' ||
			opt.defaultVal === 'VIDEO'
		) {
			defaultVal = true;
		} else if (typeof opt.defaultVal !== 'undefined') {
			throw Error(`unknown boolean option ${opt.defaultVal} (${typeof opt.defaultVal})`);
		}

		return [defaultVal, 'boolean'];
	}

	/**
	 * Evaluate the visibility properties of the option and produce an expression that controls when it should be
	 * visible.
	 *
	 * @param {CriteriaOrBehaviourOption} opt An option that we want to generate default assignment operations for.
	 * @returns {ParameterDefaultAssignmentGuard | undefined} `undefined` if there is no guard on the default assignment
	 *
	 *   - Callers should set the default when appropriate. A {@link ParameterDefaultAssignmentGuard} is returned when there
	 *       are one or more conditions that need to be evaluated before setting the guard.
	 */
	public static makeDefaultAssignmentStatement(
		opt: CriteriaOrBehaviourOption,
	): ParameterDefaultAssignmentGuard | undefined {
		if (typeof opt.visible === 'undefined') {
			// The option isn't visibile, but we know it has a defaultValue.
			// Create a statement that triggers the insertion of the default value into
			// the API source.
			return {name: opt.name, jsExpression: ``, dependsOnVars: []};
		}

		return Catalog.makeVisibilityStatement(opt.name, opt.visible.if);
	}

	/**
	 * Top-level creation of a visibility expression. This recursively converts the expression from JSON to a TypeScript
	 * boolean operation.
	 *
	 * @param {string} name Option name.
	 * @param {VisibilityExpression} stmt Conditions describing when the named option should be visible.
	 * @returns {ParameterDefaultAssignmentGuard | undefined} `undefined` if the expression can't be converted to
	 *   TypeScript. Callers should pretend the statement doesn't exist. Normally, however a
	 *   {@link ParameterDefaultAssignmentGuard} is returned.
	 */
	public static makeVisibilityStatement(
		name: string,
		stmt: VisibilityExpression,
	): ParameterDefaultAssignmentGuard | undefined {
		if (['eq', 'in', 'neq'].includes(stmt.op)) {
			return Catalog.makeVisibilityCheck(name, stmt as VisibilityCheck);
		} else if (['and', 'or', 'not'].includes(stmt.op)) {
			return Catalog.makeVisibilityOperator(name, stmt as VisibilityOperator);
		} else if (['type', 'contains'].includes(stmt.op)) {
			// These operators refer to information that is not available at runtime, so we skip them.
			return undefined;
		} else {
			throw new Error(`Bad op (${stmt.op}) for ${name}`);
		}
	}

	/**
	 * Create a boolean operator (AND, OR, NOT) that can be inserted into TypeScript
	 *
	 * @param {string} name Name of the option we're guarding.
	 * @param {VisibilityOperator} stmt Visibility statement describing when the value can be seen.
	 * @returns {ParameterDefaultAssignmentGuard | undefined} If the operator request is unsupported, this returns an
	 *   `undefined`. If the statement is supported, returns a {@link ParameterDefaultAssignmentGuard}.
	 */
	public static makeVisibilityOperator(
		name: string,
		stmt: VisibilityOperator,
	): ParameterDefaultAssignmentGuard | undefined {
		if (stmt.op === 'not') {
			// Not is different from the others, so we treat it differently.
			const expression = stmt.expression;
			if (typeof expression !== 'object') {
				throw new Error(`Unknown type for expression "${expression}": ${typeof expression}`);
			}

			const toNegate = Catalog.makeVisibilityStatement(name, expression);
			if (typeof toNegate === 'undefined') {
				return undefined;
			}

			return {...toNegate, jsExpression: `!(${toNegate.jsExpression})`};
		}

		// Build an AND or OR
		const dependsOn: string[] = [];
		const statements: string[] = [];
		for (const subStmt of stmt.params) {
			const childGuard = Catalog.makeVisibilityStatement(name, subStmt);
			if (typeof childGuard === 'undefined') {
				continue;
			}

			dependsOn.push(...childGuard.dependsOnVars);
			statements.push(`(${childGuard.jsExpression})`);
		}

		if (statements.length === 0) {
			// It's possible that our child statements won't be something we can evaluate, in which case this is empty.
			// An empty statement causes the TypeScript compiler to puke, so we pretend we are empty.
			return undefined;
		}

		let op;
		if (stmt.op === 'and') {
			op = ' && ';
		} else if (stmt.op === 'or') {
			op = ' || ';
		} else {
			throw new Error(`unknown op "${op}" in "${name}"`);
		}

		return {name: name, jsExpression: statements.join(op), dependsOnVars: dependsOn};
	}

	/**
	 * Convert the given statement into a TypeScript boolean expression.
	 *
	 * @param {string} name Name of the option that the predicate will test.
	 * @param {VisibilityCheck} stmt The boolean statement that we are checking.
	 * @returns {ParameterDefaultAssignmentGuard | undefined} `undefined` if the statement is not supported (ie, it has
	 *   a scope). Callers should pretend this statement doesn't exist. However, if the statement is supported, this
	 *   returns a {@link ParameterDefaultAssignmentGuard}.
	 */
	public static makeVisibilityCheck(
		name: string,
		stmt: VisibilityCheck,
	): ParameterDefaultAssignmentGuard | undefined {
		if (stmt.scope) {
			// Scope refers to a value in the contract, or somewhere outside the current criteria/behaviour. We ignore it.
			return undefined;
		}

		switch (stmt.op) {
			case 'eq': {
				if (
					typeof stmt.value !== 'boolean' &&
					typeof stmt.value !== 'string' &&
					typeof stmt.value !== 'number'
				) {
					throw new Error(`unknown type for ${stmt.attribute}: ${typeof stmt.value}`);
				}

				const jsExpression = `${PLACEHOLDER}.${stmt.attribute} as unknown === ${JSON.stringify(stmt.value)}`;
				const dependsOnVars = [stmt.attribute];

				return {name: name, jsExpression, dependsOnVars};
			}

			case 'neq': {
				if (
					typeof stmt.value !== 'boolean' &&
					typeof stmt.value !== 'string' &&
					typeof stmt.value !== 'number'
				) {
					throw new Error(`unknown type for ${stmt.attribute}: ${typeof stmt.value}`);
				}

				const jsExpression = `${PLACEHOLDER}.${stmt.attribute} as unknown !== ${JSON.stringify(stmt.value)}`;
				const dependsOnVars = [stmt.attribute];

				return {name: name, jsExpression, dependsOnVars};
			}

			case 'in': {
				if (!Array.isArray(stmt.value)) {
					throw new Error(
						`Require Array for 'op=in' - ${name}: ${stmt.attribute}: ${typeof stmt.value} - ${JSON.stringify(stmt.value)}`,
					);
				}

				for (const item of stmt.value) {
					if (typeof item !== 'string') {
						throw new Error(
							`Expected a string value for items in an "in" clause, but got ${item} which is a ${typeof item}`,
						);
					}
				}

				const jsExpression = `(${PLACEHOLDER}.${stmt.attribute} !== undefined && ${JSON.stringify(stmt.value)}.includes(${PLACEHOLDER}.${stmt.attribute}))`;
				const dependsOnVars = [stmt.attribute];

				return {name: name, jsExpression, dependsOnVars};
			}

			default:
				throw new Error(`Unknown op "${stmt['op']}" for option named "${name}"`);
		}
	}

	/**
	 * Creates the TypeScript type definition for a parameter to a criteria/behaviour.
	 *
	 * @param {string} name Name of the containing criteria or behaviour. Used for fixups and errors.
	 * @param {CriteriaOrBehaviourOption} opt The PM catalog option that defines this parameter. Used for visibility and
	 *   PM variable calculations.
	 * @param {NamedOptionSchema} schema The Rule Format schema that defines this parameter. Used for type handling.
	 * @param {OptionDocumentation} documentation The documentation links for this specific option.
	 * @returns {Parameter} The created `Parameter`
	 */
	public static makeParameter(
		name: string,
		opt: CriteriaOrBehaviourOption,
		schema: NamedOptionSchema,
		documentation?: OptionDocumentation,
	): Parameter {
		const [defaultVal, typeDeclaration, pmVarHandling] = Catalog.makeTypeDeclaration(name, opt, schema);

		// Determine if this should be considered optional
		let optional = true;
		if (
			typeof opt.defaultVal === 'undefined' &&
			typeof opt.visible === 'undefined' &&
			(typeof opt.allowEmpty === 'undefined' || !opt.allowEmpty)
		) {
			optional = false;
		}

		// If the option has a default value, then we need to create an assignment statement that
		// assigns the default value in the API source. That is dependent on the `visibility`
		// statement, since non-visible options are checked by the PAPI API.
		let defaultAssignmentStmt: ParameterDefaultAssignmentGuard | undefined = undefined;
		if (typeof opt.defaultVal !== 'undefined') {
			defaultAssignmentStmt = Catalog.makeDefaultAssignmentStatement(opt);
		}

		// Compose the documentation.
		let generatedDoc = '';
		if (documentation) {
			generatedDoc = documentation.description.papi;
		}

		if (typeof defaultVal !== 'undefined') {
			if (generatedDoc.length > 0) {
				generatedDoc += ' ';
			}
			generatedDoc = `${generatedDoc}Default: ${JSON.stringify(defaultVal)}.`;
		}

		if (pmVarHandling === 'allowsVars') {
			if (generatedDoc.length > 0) {
				generatedDoc += ' ';
			}
			generatedDoc = `${generatedDoc}PM variables may appear between '{{' and '}}'.`;
		}

		const newParameter: Parameter = {
			name: opt.name,
			optional: optional,
			type: typeDeclaration,
			documentation: generatedDoc,
			defaultVal: JSON.stringify(defaultVal),
			defaultAssignmentStmt,
			allowsVars: opt.allows_vars === true,
			pmVarRegistration: pmVarHandling,
		};

		return newParameter;
	}

	private static makeEnumerationDeclaration(
		values?: Array<number | string | boolean | OptionPredicate>,
	): string | undefined {
		const nonObjs = values
			// Some values are actually predicates to see if the value should be visible. We skip those.
			?.map(value => {
				if (typeof value === 'object') {
					return (value as OptionPredicate).value;
				} else {
					return value;
				}
			});

		if (typeof nonObjs === 'undefined' || nonObjs.length === 0) {
			return undefined;
		}

		return nonObjs.map(value => JSON.stringify(value)).join(' | ');
	}

	/**
	 * Creates the TypeScript type definition for a parameter.
	 *
	 * @param {string} behaviourOrCriteriaName Name of the criteria or behavior that contains the opt. Used for fixups
	 *   and error output.
	 * @param {CriteriaOrBehaviourOption} opt The PM catalog definition of the option. Mostly used for PM variable
	 *   handling, and type handling of lists.
	 * @param {NamedOptionSchema} schema The Rule Format definition of the option.
	 * @returns {[string | undefined, string]} A description of the option type.
	 *
	 *   1. The first value is the default (or `undefined` if there is no default) as a TypeScript value. ie, it needs to be
	 *        converted to a string later.
	 *   2. The second value is a string specifying TypeScript type that should be inserted in the output file. It can be
	 *        inserted verbatim.
	 *   3. The third value indicates the expected type of
	 *        {@link https://techdocs.akamai.com/property-mgr/reference/variables | PM variable} handling.
	 */
	public static makeTypeDeclaration(
		behaviourOrCriteriaName: string,
		opt: CriteriaOrBehaviourOption,
		schema: NamedOptionSchema,
	): [string | boolean | number | object | undefined, string, PmVariableRegistration] {
		let pmVarHandling: PmVariableRegistration = undefined;
		if (opt.allows_vars === true) {
			pmVarHandling = 'allowsVars';
		}

		// We have the JSON schema for the option. Use that, since it is what the PAPI JSON is validated against.
		if ('enum' in schema) {
			let type;
			let defaultValue;
			if (
				(schema.enum.length === 2 && schema.enum[0] === true) ||
				(schema.enum[0] === false && schema.enum[1] === true) ||
				schema.enum[1] === false
			) {
				// Some booleans are (inexplicably) expressed as an enum. This normalizes that to the type.
				type = 'boolean';
				defaultValue = schema.default;
			} else {
				// This is a "normal" enum consisting of a bunch of literal values
				type = schema.enum.map(value => JSON.stringify(value)).join(' | ');
				defaultValue = schema.default;

				if (
					schema.enum.length > 0 &&
					typeof schema.default !== 'undefined' &&
					typeof schema.default !== typeof schema.enum[0]
				) {
					// Indicates the default value has a different type from the enums

					if (
						behaviourOrCriteriaName === 'responseCode' &&
						opt.name === 'statusCode' &&
						typeof defaultValue === 'string' &&
						typeof schema.enum[0] === 'number'
					) {
						// Fixup: the responseCode.statusCode default value is a different type from the enum values
						defaultValue = parseInt(defaultValue);
					} else {
						// Aside from our fixup, this is disallowed
						throw new Error(
							`Inconsistent default and enum in ${behaviourOrCriteriaName}.${opt.name}: \n${JSON.stringify(schema, undefined, 2)}`,
						);
					}
				}
			}

			return [defaultValue, type, undefined];
		} else if ('$ref' in schema) {
			// The JSON schema has cross pointers to types defined elsewhere in the document. We simplify those.
			const pointer = schema.$ref;

			// Determine the defaultValue first, so we can do type-specific fix ups (if necessary).
			let defaultValue: string | object | undefined = undefined;
			if ('default' in schema) {
				defaultValue = schema.default;
			}

			// Map the `$ref` type to a TypeScript type. We could do this automatically, but we opt for manual in tech preview.
			let type;
			if (pointer === '#/definitions/catalog/option_types/list') {
				type = 'string[]';

				if (typeof opt.values !== 'undefined') {
					const enums = Catalog.makeEnumerationDeclaration(opt.values);
					if (typeof enums === 'string') {
						type = `Array<${enums}>`;
					}
				}

				if (behaviourOrCriteriaName == 'corsSupport' && opt.name == 'methods' && defaultValue == 'GET POST') {
					// Fixup: `GET POST` is not one of the values in the enum for `method`
					defaultValue = ['GET', 'POST'];
				}

				if (typeof defaultValue === 'string') {
					// Fixup: The Rule Format list type allows string values for lists. But we want to be more consistent. So we force a string array.
					defaultValue = [defaultValue];
				}
			} else if (pointer === '#/definitions/catalog/option_types/duration') {
				type = 'string';
			} else if (pointer === '#/definitions/catalog/option_types/variable') {
				if (pmVarHandling !== undefined) {
					throw new Error(
						`Conflicting variable directives for ${behaviourOrCriteriaName}.${opt.name}. pmVarHandling is ${pmVarHandling}`,
					);
				}

				type = 'string';
				pmVarHandling = 'variable';
			} else if (pointer === '#/definitions/catalog/option_types/variableList') {
				if (pmVarHandling !== undefined) {
					throw new Error(
						`Conflicting variable directives for ${behaviourOrCriteriaName}.${opt.name}. pmVarHandling is ${pmVarHandling}`,
					);
				}

				type = 'string[]';
				pmVarHandling = 'variableList';
			} else if (
				pointer === '#/definitions/catalog/option_types/date' ||
				pointer === '#/definitions/catalog/option_types/datetimezone' ||
				pointer === '#/definitions/catalog/option_types/random'
			) {
				type = 'string';
			} else {
				// These are unknown and unhandled reference types. We can add to them over time.
				type = 'any';
			}

			return [defaultValue, type, pmVarHandling];
		} else {
			// Here, the type is defined explicitly
			let type;
			let defaultValue;
			if (schema.type === 'array') {
				if (typeof schema.items === 'object' && typeof schema.items.type === 'string') {
					type = `Array<${schema.items.type}>`;
				} else {
					// Fixup
					type = 'Array<object>';
				}

				defaultValue = undefined;
			} else {
				type = schema.type;
				defaultValue = schema.default;
			}

			// Add handling for PM variables
			if (type === 'string') {
				if (opt.type === 'variable') {
					if (pmVarHandling === 'allowsVars') {
						throw new Error(`Conflicting variable directives for ${behaviourOrCriteriaName}.${opt.name}`);
					}
					pmVarHandling = 'variable';
				}
			}

			return [defaultValue, type, pmVarHandling];
		}

		throw new Error(
			`Unexpected fall through when generating the type declaration for ${behaviourOrCriteriaName}.${opt.name}`,
		);
	}

	/**
	 * Normalizes the value of a `type="enum"` option. It also fixes a single special case where the type of the
	 * `values` does not match the type of the `defaultVal` - see comments in the source.
	 *
	 * @param {CriteriaOrBehaviourDefinition} opt The option that we're examining for a default.
	 * @returns {string | boolean | number | object | undefined} The default value, as a typed TypeScript variable (ie,
	 *   not yet serialized). We treat `undefined` as a flag that there is no value.
	 */
	static forceConsistencyForDefaultValueInEnum(
		opt: CriteriaOrBehaviourOption,
	): string | boolean | number | object | undefined {
		if (!Array.isArray(opt.values)) {
			// There are no values - this should never happen
			return opt.defaultVal;
		}

		if (opt.values.length === 0) {
			// The values array is empty. We don't need to worry about consistency.
			return opt.defaultVal;
		}

		if (typeof opt.values[0] !== typeof opt.defaultVal) {
			if (typeof opt.values[0] === 'number' && typeof opt.defaultVal === 'string') {
				// This is a special case for the `responseCode` behaviour: the `statusCode` defaultVal
				// is a string, but the values are all numbers. So we force the `defaultVal` to
				// be consistent.
				return Number(opt.defaultVal);
			} else {
				throw new Error(`Inconsistent defaultVal and values! See ${opt.name}`);
			}
		}

		return opt.defaultVal;
	}

	private getFunctionList(
		criteriaOrBehaviors: Map<string, CatalogEntry>,
		type: 'CRITERIA' | 'BEHAVIOR',
		returnType: 'Property' | 'CriteriaBuilder',
	): TypeFunction[] {
		const functions: TypeFunction[] = [];

		for (const item of criteriaOrBehaviors.values()) {
			// Generate the function name
			let prefix;
			switch (type) {
				case 'CRITERIA':
					prefix = 'on';
					break;
				case 'BEHAVIOR':
					prefix = 'set';
					break;
			}

			const functionName = prefix + item.name.charAt(0).toUpperCase() + item.name.slice(1);

			// Constuct the parameters associated with the criteria/behaviour.  If no documentation exists,
			// then do not provide it
			const parameterList = item.type.options
				.filter(opt => opt.type !== 'title')
				.map(value => {
					const definition = item.schema[value.name];

					try {
						if (item.documentation.options) {
							return Catalog.makeParameter(
								item.name,
								value,
								definition,
								item.documentation.options[value.name],
							);
						} else {
							return Catalog.makeParameter(item.name, value, definition);
						}
					} catch (e) {
						throw new Error(`Error building parameter ${item.name}.${value.name}`, {cause: e});
					}
				});

			// Build the assignment statements for defaults.
			const defaultAssignmentStatements: Array<{
				name: string;
				stmt: string;
				value: unknown;
				dependsOnVars: string[];
			}> = parameterList.flatMap(param => {
				if (typeof param.defaultVal === 'undefined') {
					// Undefined statements are useless. Skip them.
					return [];
				}

				// Produce the JS object that the template can read.
				return {
					name: param.name,
					// The text to insert in the `if` guard. An 'undefined' stmt means the template just needs to insert a check against the option itself.
					stmt: param.defaultAssignmentStmt?.jsExpression || '',
					// The default value we're inserting into the API source.
					value: param.defaultVal,
					dependsOnVars: param.defaultAssignmentStmt?.dependsOnVars || [],
				};
			});

			fixAndValidateDefaultAssignmentOrdering(functionName, defaultAssignmentStatements);

			// Make the list of variables that can contain PM variables
			const pmVarHandling: {allowsVars: string[]; variable: string[]; variableList: string[]} = {
				allowsVars: [],
				variable: [],
				variableList: [],
			};
			parameterList.forEach(param => {
				if (param.pmVarRegistration === 'allowsVars') {
					pmVarHandling.allowsVars.push(param.name);
				} else if (param.pmVarRegistration === 'variable') {
					pmVarHandling.variable.push(param.name);
				} else if (param.pmVarRegistration === 'variableList') {
					pmVarHandling.variableList.push(param.name);
				}
			});

			const pmVarHandlingTrimmed: {allowsVars?: string[]; variable?: string[]; variableList?: string[]} = {};
			for (const [key, value] of Object.entries(pmVarHandling)) {
				if (value.length > 0) {
					pmVarHandlingTrimmed[key as keyof typeof pmVarHandlingTrimmed] = value;
				}
			}

			// const paramsThatAllowPMVars = parameterList.filter(param => param.allowsVars).map(param => param.name);

			// Create the object that Nunjucks will read
			const f: TypeFunction = {
				name: functionName,
				help: item.type.help,
				description: item.documentation.description.papi,
				type: type,
				parameters: parameterList,
				returnType: returnType,
				papiName: item.name,
				defaultAssignmentStatements,
				paramsThatAllowPMVars: JSON.stringify(pmVarHandlingTrimmed),
			};

			functions.push(f);
		}

		return functions;
	}

	public renderTypeScript(out: stream.Writable): void {
		const criteriaBuilder = this.getFunctionList(this.criteria, 'CRITERIA', 'CriteriaBuilder');
		const propertyCriteria = this.getFunctionList(this.criteria, 'CRITERIA', 'Property');
		const propertyBehaviours = this.getFunctionList(this.behaviors, 'BEHAVIOR', 'Property');

		// The types
		const renderedTypes = nunjucks.render('types.njk', {
			ruleFormat: this.ruleFormat,
			criteriaBuilder: criteriaBuilder,
			propertyCriteria: propertyCriteria,
			propertyBehaviours: propertyBehaviours,
		});

		out.write(renderedTypes);
	}
}

/**
 * Does an in-place fixup of the assignment ordering.
 *
 * Moves assignments around so that anything that depends on another default is checked after the default is set.
 * Necessary because of `imageManagerVideo` (`superCacheRegion` is defined before `useExistingPolicySet`, but it depends
 * on `useExistingPolicySet`) and `imageManager` which has the same issue.
 *
 * Note that `origin` has `useUniqueCacheKey`, which depends on `hostname`, but that _doesn't_ have a default.
 *
 * Since we could loop forever trying to fix dependency loops, we throw an exception if we can't fix the problems in a
 * single iteration.
 *
 * @param {string} functionName Name of the function in `types.ts`, just used to raise more descriptive errors.
 * @param {object} assignments A listing of assignments that are modified in place. The assignments are expected to be
 *   written in the order of this array.
 * @see fixAssignmentOrdering
 */
export function fixAndValidateDefaultAssignmentOrdering(
	functionName: string,
	assignments: Array<{
		name: string;
		dependsOnVars: string[];
	}>,
) {
	const updateCount = fixAssignmentOrdering(functionName, assignments);
	if (updateCount > 0) {
		const secondTry = fixAssignmentOrdering(functionName, assignments);
		if (secondTry > 0) {
			// Ideally, we'd loop over the fixes, but there are certain patterns (such as cyclic dependencies) that
			// would cause an infinite loop. In the original version of the pm_catalog, a single fixup pass is
			// sufficient.
			throw new Error(`Unable to fix ordering of ${functionName} - fixed once, but that wasn't enough.`);
		}
	}
}

/**
 * Updates `assignments` in place, so guards are moved after statements that set defaults for options they query. If an
 * option depends on another option that _doesn't_ have a default, then it is ignored (at time of writing, the only
 * instance of that pattern is `useUniqueCacheKey` depending on `hostname` in `origin`).
 *
 * Ie, if the assignment of the default value to option `b` has a guard that checks option `a`, we make sure the `b`
 * assignment is after `a`.
 *
 * @param {string} functionName Name of the criteria/behaviour we're calling this on behalf of. Only for debugging.
 * @param {object} assignments The ordered list of assignments. Updated in place.
 * @returns {number} The number of items that were reordered. A zero indicates the assignments don't need to change.
 * @see fixAndValidateDefaultAssignmentOrdering
 */
function fixAssignmentOrdering(
	functionName: string,
	assignments: Array<{
		name: string;
		dependsOnVars: string[];
	}>,
): number {
	// Names of the options that have had their default set.
	const hadDefaultSet: string[] = [];

	// Names of the options who have a dependency, but the dependency hasn't been assigned a default.
	const unsetDependencies: {name: string; dependsOn: string}[] = [];

	// Walk through every assignment, checking for those who don't have defaults.
	for (const expr of assignments) {
		let highestDependencyIndex = 0;
		let nameOfHighestDependency: string | undefined;

		for (const dependency of expr.dependsOnVars) {
			if (!hadDefaultSet.includes(dependency)) {
				// This assignment depends on an dependency that hasn't been set yet.

				// Walk over each of the dependencies, and find the one with the highest index.
				const indexOfDependency = assignments.findIndex(otherExp => otherExp.name === dependency);

				if (indexOfDependency >= highestDependencyIndex) {
					highestDependencyIndex = indexOfDependency;
					nameOfHighestDependency = dependency;
				}
			}
		}

		if (typeof nameOfHighestDependency !== 'undefined') {
			unsetDependencies.push({name: expr.name, dependsOn: nameOfHighestDependency});
		}

		hadDefaultSet.push(expr.name);
	}

	// Reorder the assignments so items that have a dependency are manipulated after the dependency.
	let movedCount = 0;
	for (const toMove of unsetDependencies) {
		const itemMoving = assignments.findIndex(expr => expr.name === toMove.name);
		if (typeof itemMoving === 'number') {
			const expr = assignments.splice(itemMoving, 1);

			const addAfter = assignments.findIndex(expr => expr.name === toMove.dependsOn);
			if (addAfter === -1) {
				throw new Error(
					`In ${functionName}, ${toMove.name} depends on ${toMove.dependsOn}, but we're unable to find ${toMove.dependsOn} while adjusting`,
				);
			}

			assignments.splice(addAfter + 1, 0, ...expr);

			movedCount += 1;
		}
	}

	return movedCount;
}

/**
 * Take a list of Options (or Parameters) that are allowed for a function and create an array of variants based on the
 * conditional visibility of the options
 *
 * @param {CriteriaOrBehaviourOption[]} _parameterList The options for the function parameters
 * @returns {ParameterVariant[]} The list of variants that take visibility into account
 */
export function createVariants(_parameterList: CriteriaOrBehaviourOption[]): ParameterVariant[] {
	return [];
}

/** See https://collaborate.akamai.com/confluence/display/DPPE/Options+API#OptionsAPI-OptionTypes */
export type OptionType =
	| 'string'
	| 'textarea'
	| 'externalResource'
	| 'enum'
	| 'switch'
	| 'numeric'
	| 'regex'
	| 'boolean'
	| 'list'
	| 'slider'
	| 'netstorage'
	| 'cpcode'
	| 'date'
	| 'duration'
	| 'wafconfig'
	| 'table'
	| 'datetimezone'
	| 'variable'
	| 'variableList'
	/* A UI element. No show. */
	| 'title'
	| 'sslcertlist'
	/** A certificat authority list. */
	| 'casetlist'
	/** A random value, stored as an object array? */
	| 'random'
	| 'cloudletconfig'
	| 'imageManagementPolicySet'
	| 'imageManagementApiNewKey'
	| 'siteshield';

/** Layout of the JSON schema that defines the Rule Format files. */
export interface RuleFormatSchema {
	definitions: {
		catalog: {
			criteria: {
				[key: string]: RuleFormatCriteriaOrBehavior;
			};
			behaviors: {
				[key: string]: RuleFormatCriteriaOrBehavior;
			};
		};
	};
}

/** Within a JSON schema, this defines what a criteria or behaviour looks like. */
export interface RuleFormatCriteriaOrBehavior {
	properties: {
		options: {
			properties: RuleFormatOptionsSchema;
		};
	};
}

export interface RuleFormatOptionsSchema {
	[key: string]: NamedOptionSchema;
}

/** Within a JSON schema, this defines an option. */
export type NamedOptionSchema =
	| {type: 'string'; default?: string}
	| {type: 'number'; default?: number}
	| {type: 'boolean'; default?: boolean}
	/** We don't dig down into the associated type, but we want to be able to map this appropriately. */
	| {type: 'array'; items: {type: string}}
	| {enum: Array<string>; default?: string}
	| {enum: Array<number>; default?: number}
	| {enum: Array<boolean>; default?: boolean}
	| {$ref: string; default?: string | object};

/** Tests the value of an attribute. */
type VisibilityCheck =
	| {
			attribute: string;
			op: 'eq' | 'neq';
			scope?: string;
			value: boolean | string | number;
	  }
	| {
			attribute: string;
			op: 'in';
			scope?: string;
			value: string[];
	  };

/**
 * The top-level visibility expression: it can either be a test of a specific value (a {@link VisibilityCheck}) or a
 * boolean operation that combines the results of other expressions (a {@link VisibilityOperator}).
 */
type VisibilityExpression = VisibilityCheck | VisibilityOperator;

/** A boolean operator that operates on the results of other visibility checks. */
type VisibilityOperator =
	| {op: 'and' | 'or'; params: VisibilityExpression[]}
	| {op: 'not'; expression: VisibilityExpression};

/**
 * Criteria/Behaviours can have options that are only visible depending on the criteria set out in an object that allows
 * for conditional matches based on previous choices.
 */
export interface CriteriaOrBehaviourOptionVisibility {
	if: VisibilityExpression;
}

/**
 * A parameter to a behaviour or a criteria. Corresponds to entries in the `options` array in the `pm_catalog.json`.
 *
 * See https://collaborate.akamai.com/confluence/display/DPPE/Options+API#OptionsAPI-DefininganOption
 */
export interface CriteriaOrBehaviourOption {
	name: string;
	type: OptionType;
	values?: Array<string | boolean | number | OptionPredicate>;
	defaultVal?: string | boolean | number;
	visible?: CriteriaOrBehaviourOptionVisibility;
	allowEmpty?: boolean;
	allows_vars?: boolean;
}

/**
 * Some values are only visibile if they have a predicate enabled. For the moment, we're showing all values (including
 * those that would be filtered out), to provide the user with maximal flexibility.
 *
 * This exposes the value that the user can specify, but ignores all of the other fields.
 */
interface OptionPredicate {
	value: string;
}

/** A criteria or behaviour from the `pm_catalog.json`. */
interface CriteriaOrBehaviourDefinition {
	status: 'CURRENT' | 'DEPRECATED';
	// internal: boolean;
	// listable: boolean;
	options: Array<CriteriaOrBehaviourOption>;
	version: string;

	/* The help string used for linking to techdocs */
	help: string;
}

/** A Description value that describes the external documentation exposed in the PAPI. */
export interface DescriptionDocumentation {
	papi: string;
}

/** A documentation description of an Option that is provided to a condition or behaviour */
export interface OptionDocumentation {
	description: DescriptionDocumentation;
	values?: {
		description: DescriptionDocumentation;
		value: string;
	};
}

/** Documentation for a "Condition" or "Features" within the papi json */
interface DocumentationDetails {
	description: DescriptionDocumentation;
	options?: {
		[optionName: string]: OptionDocumentation;
	};
}

interface Documentation {
	conditions: {
		[condition: string]: DocumentationDetails;
	};
	features: {
		[feature: string]: DocumentationDetails;
	};
}

/**
 * Top-level structure representing the layout of the JSON in the pm_catalog.json. We're only interested in the most
 * recent version of each criteria and behaviour, so we ignore the other properties.
 */
export interface PmCatalog {
	/** The name of the Rule Format this catalog conforms to. */
	ruleFormat: string;

	/** Behaviours. */
	featureDefinitions: {
		/**
		 * Each key is the name of a behavior. The value is a list of versions. We use the [latestVersions] field to
		 * find the current one.
		 */
		[key: string]: {
			[version: string]: CriteriaOrBehaviourDefinition;
		};
	};

	/** Criteria. */
	conditionDefinitions: {
		/** Similar to the [featureDefinitions] - keyed by criteria name, the value is a map of versions. */
		[key: string]: {
			[version: string]: CriteriaOrBehaviourDefinition;
		};
	};

	latestVersions: {
		conditions: {
			[key: string]: string;
		};
		features: {
			[key: string]: string;
		};
	};

	/** Documentation derived from the doc.yaml files within the property manager catalog. */
	documentation: Documentation;
}

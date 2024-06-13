/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE.md
 */

import {
	PmCatalog,
	Catalog,
	OptionType,
	CriteriaOrBehaviourOption,
	createVariants,
	fixAndValidateDefaultAssignmentOrdering,
	NamedOptionSchema,
	RuleFormatSchema,
	OptionDocumentation,
} from '../src/papi/pmcatalog-tools';
import streamBuffers from 'stream-buffers';
import {loadCatalog} from '../src/api/catalog-tools';

describe('PAPI JSON Handling', () => {
	test('Should get the latest version of criteria and a behaviours', () => {
		const pmCatalog: PmCatalog = {
			ruleFormat: 'v2015-08-12',
			featureDefinitions: {
				fz: {
					v1: {version: 'v1', help: 'PM_007', status: 'CURRENT', options: []},
					v3: {version: 'v3-ver', help: 'PM_007', status: 'DEPRECATED', options: []},
				},
			},
			conditionDefinitions: {
				c1: {
					v1: {version: 'v1', help: 'PM_007', status: 'CURRENT', options: []},
					v2: {version: 'v2', help: 'PM_007', status: 'CURRENT', options: []},
				},
			},
			latestVersions: {
				conditions: {
					c1: 'v2',
					C1: 'v1', // the PM catalog uses alternate names for some criteria/behaviors. Verify we don't trip on those.
				},
				features: {
					fz: 'v3',
					zzz: '99', // again, alternate name validation.
				},
			},
			documentation: {
				conditions: {
					c1: {
						description: {
							papi: 'asdf',
						},
					},
				},
				features: {
					fz: {
						description: {
							papi: 'Asdf2',
						},
					},
				},
			},
		};

		const schema: RuleFormatSchema = {
			definitions: {
				catalog: {
					criteria: {
						c1: {
							properties: {
								options: {
									properties: {},
								},
							},
						},
					},
					behaviors: {
						fz: {
							properties: {
								options: {
									properties: {},
								},
							},
						},
					},
				},
			},
		};
		const catalog = Catalog.loadFrom(pmCatalog, schema);

		expect(catalog.criteria.size).toBe(1);
		expect(catalog.criteria.get('c1')).toMatchObject({
			name: 'c1',
			type: {version: 'v2'},
		});

		expect(catalog.behaviors.size).toBe(1);
		expect(catalog.behaviors.get('fz')).toMatchObject({
			name: 'fz',
			type: {version: 'v3-ver'},
		});
	});
});

describe('TypeScript generation', () => {
	test('Should produce a TypeScript signature that looks kinda/sorta right, including options', () => {
		const pmCatalog: PmCatalog = {
			ruleFormat: 'ignored',
			featureDefinitions: {
				fz: {
					v3: {
						version: 'v3-ver',
						status: 'DEPRECATED',
						help: 'PM_007',
						options: [
							{
								name: 'opt1',
								type: 'boolean',
								defaultVal: true,
							},
							{
								name: 'o2',
								type: 'string',
								defaultVal: 'hi',
							},
							{
								name: 'o3',
								type: 'numeric',
								defaultVal: 200,
							},
						],
					},
				},
			},
			conditionDefinitions: {},
			latestVersions: {
				conditions: {},
				features: {fz: 'v3'},
			},
			documentation: {
				conditions: {},
				features: {
					fz: {
						description: {
							papi: 'Asdf2',
						},
						options: {
							opt1: {
								description: {
									papi: 'Test1',
								},
							},
							o2: {
								description: {
									papi: 'Test2',
								},
							},
							o3: {
								description: {
									papi: 'Test3',
								},
							},
						},
					},
				},
			},
		};

		const schema: RuleFormatSchema = {
			definitions: {
				catalog: {
					criteria: {},
					behaviors: {
						fz: {
							properties: {
								options: {
									properties: {
										opt1: {
											type: 'boolean',
											default: true,
										},
										o2: {
											type: 'string',
											default: 'hi',
										},
										o3: {
											type: 'number',
											default: 200,
										},
									},
								},
							},
						},
					},
				},
			},
		};
		const catalog = Catalog.loadFrom(pmCatalog, schema);

		// Make sure we have our target function.
		expect(catalog.behaviors.get('fz')).toMatchObject({
			name: 'fz',
			type: {version: 'v3-ver'},
		});

		// Generate a signature
		const buf = new streamBuffers.WritableStreamBuffer();
		catalog.renderTypeScript(buf);

		const text = buf.getContentsAsString();

		// We check for individual parameters, rather than the full string, because there will be comments an other junk in there
		expect(text).toContain('setFz(params: ');
		expect(text).toContain('opt1?: boolean,');
		expect(text).toContain('o2?: string,');
		expect(text).toContain('o3?: number');
		expect(text).toContain('}): Property');
	});

	test('Detect inconsistent default and enum types', () => {
		// The `opt` is almost entirely ignored in this flow, but we need it to get the name, and to satisfy the signature.
		const opt: CriteriaOrBehaviourOption = {
			defaultVal: 'ignored',
			name: 'dynamicMethod',
			type: 'enum',
			values: [],
		};

		const schema: NamedOptionSchema = {
			enum: ['SERVE_301'],
			default: true, // This breaks our schema, hence the `as unknown` below
		} as unknown as NamedOptionSchema;

		expect(() => Catalog.makeParameter('name', opt, schema)).toThrow(
			'Inconsistent default and enum in name.dynamicMethod',
		);
	});

	test('Doc includes the default value', () => {
		// The `opt` is almost entirely ignored in this flow, but we need it to get the name, and to satisfy the signature.
		const opt: CriteriaOrBehaviourOption = {
			defaultVal: 'default from the schema is used - ignore this',
			name: 'dynamicMethod',
			type: 'string',
		};

		const schema: NamedOptionSchema = {
			type: 'string',
			default: 'le value default',
		};

		expect(Catalog.makeParameter('name', opt, schema)).toMatchObject({
			documentation: 'Default: "le value default".',
		});
	});

	test('Doc includes the variable note', () => {
		// The `opt` is almost entirely ignored in this flow, but we need it to get the name, and to satisfy the signature.
		const opt: CriteriaOrBehaviourOption = {
			name: 'ignore me',
			type: 'string',
			allows_vars: true,
		};

		const schema: NamedOptionSchema = {
			type: 'string',
		};

		expect(Catalog.makeParameter('name', opt, schema)).toMatchObject({
			documentation: "PM variables may appear between '{{' and '}}'.",
		});
	});

	test('Doc includes everything', () => {
		// The `opt` is almost entirely ignored in this flow, but we need it to get the name, and to satisfy the signature.
		const opt: CriteriaOrBehaviourOption = {
			name: 'ignore me',
			type: 'string',
			allows_vars: true,
		};

		const schema: NamedOptionSchema = {
			type: 'string',
			default: 'D E F A U L T',
		};

		const doc: OptionDocumentation = {
			description: {
				papi: 'papi doc.',
			},
		};

		expect(Catalog.makeParameter('name', opt, schema, doc)).toMatchObject({
			documentation: "papi doc. Default: \"D E F A U L T\". PM variables may appear between '{{' and '}}'.",
		});
	});
});

describe('Visibility guards', () => {
	test('visible.if references a scope - we should pretend the visibility condition does not exist', () => {
		const opt: CriteriaOrBehaviourOption = {
			allowEmpty: true,
			defaultVal: 'BEACON',
			name: 'streamType',
			type: 'enum',
			values: ['BEACON', 'LOG', 'BEACON_AND_LOG'],
			visible: {
				if: {
					attribute: 'modulesOnContract',
					op: 'contains', // Not akshully defined in our demispec,
					scope: 'global',
					value: 'DataStreamLogs',
				},
			},
		} as unknown as CriteriaOrBehaviourOption; // We need to do the `as unknown` thing to ignore the contains op, mentioned above.

		const schema: NamedOptionSchema = {
			enum: ['BEACON', 'LOG', 'BEACON_AND_LOG'],
			default: 'BEACON',
		};

		const param = Catalog.makeParameter('name', opt, schema);

		expect(param).toMatchObject({
			defaultVal: `"BEACON"`,
			defaultAssignmentStmt: undefined,
		});
	});

	test('Assignment guard should be collapsed if a boolean statement has no checks', () => {
		const opt: CriteriaOrBehaviourOption = {
			defaultVal: false,
			name: 'secondHostnameEnabled',
			type: 'switch',
			values: [false, true],
			visible: {
				if: {
					op: 'and',
					params: [
						{
							attribute: 'hostname',
							op: 'type', // We ignore this check because of the op
							value: ['ipv4_address', 'ipv6_address'],
						},
						{
							attribute: 'productName',
							op: 'in',
							scope: 'global', // We ignore this check because of the scope
							value: ['API_Accel'],
						},
					],
				},
			},
		} as unknown as CriteriaOrBehaviourOption; // We need to do the `as unknown` to ignore the unsupported op mentioned above

		const param = Catalog.makeParameter('name', opt, {enum: [true, false], default: false});

		expect(param).toMatchObject({
			defaultVal: `false`,
			defaultAssignmentStmt: undefined,
		});
	});

	test('op="eq"', () => {
		const opt: CriteriaOrBehaviourOption = {
			defaultVal: 'SERVE_301',
			name: 'dynamicMethod',
			type: 'enum',
			values: ['SERVE_301', 'SERVE_302', 'SERVE_ALTERNATE'],
			visible: {
				if: {
					attribute: 'actionType',
					op: 'eq',
					value: 'DYNAMIC',
				},
			},
		};

		const schema: NamedOptionSchema = {
			enum: ['SERVE_301', 'SERVE_302', 'SERVE_ALTERNATE'],
			default: 'SERVE_301',
		};

		const param = Catalog.makeParameter('name', opt, schema);

		expect(param).toMatchObject({
			defaultVal: `"SERVE_301"`,
			defaultAssignmentStmt: {
				dependsOnVars: ['actionType'],
				jsExpression: '%s.actionType as unknown === "DYNAMIC"',
				name: 'dynamicMethod',
			},
		});
	});

	test('op="in"', () => {
		const opt: CriteriaOrBehaviourOption = {
			defaultVal: 'ALG_3DES',
			name: 'algorithm',
			type: 'enum',
			values: ['ALG_3DES', 'ALG_AES128', 'ALG_AES256'],
			visible: {
				if: {
					attribute: 'transform',
					op: 'in',
					value: ['ENCRYPT', 'DECRYPT'],
				},
			},
		};

		const schema: NamedOptionSchema = {
			enum: ['ALG_3DES', 'ALG_AES128', 'ALG_AES256'],
			default: 'ALG_3DES',
		};

		const param = Catalog.makeParameter('name', opt, schema);

		expect(param).toMatchObject({
			defaultVal: `"ALG_3DES"`,
			defaultAssignmentStmt: {
				dependsOnVars: ['transform'],
				jsExpression: '(%s.transform !== undefined && ["ENCRYPT","DECRYPT"].includes(%s.transform))',
				name: 'algorithm',
			},
		});
	});

	test('Boolean AND', () => {
		const opt: CriteriaOrBehaviourOption = {
			defaultVal: 5,
			name: 'brandedDenyCacheTtl',
			type: 'slider',
			visible: {
				if: {
					op: 'and',
					params: [
						{
							attribute: 'enabled',
							op: 'eq',
							value: true,
						},
						{
							attribute: 'branded403StatusCode',
							op: 'neq',
							value: 302,
						},
					],
				},
			},
		};

		const schema: NamedOptionSchema = {
			type: 'number',
			default: 5,
		};

		const param = Catalog.makeParameter('name', opt, schema);

		expect(param).toMatchObject({
			defaultVal: `5`,
			defaultAssignmentStmt: {
				dependsOnVars: ['enabled', 'branded403StatusCode'],
				jsExpression: '(%s.enabled as unknown === true) && (%s.branded403StatusCode as unknown !== 302)',
				name: 'brandedDenyCacheTtl',
			},
		});
	});

	test('op="not"', () => {
		const opt: CriteriaOrBehaviourOption = {
			defaultVal: true,
			name: 'enabled',
			type: 'switch',
			values: [false, true],
			visible: {
				if: {
					expression: {
						attribute: 'streamType',
						op: 'in',
						value: ['LOG'],
					},
					op: 'not',
				},
			},
		};

		const schema: NamedOptionSchema = {
			enum: [false, true],
			default: true,
		};

		const param = Catalog.makeParameter('name', opt, schema);

		expect(param).toMatchObject({
			defaultVal: 'true',
			defaultAssignmentStmt: {
				dependsOnVars: ['streamType'],
				jsExpression: '!((%s.streamType !== undefined && ["LOG"].includes(%s.streamType)))',
				name: 'enabled',
			},
		});
	});

	test('Detect invalid data: non-string for `op: "in"`', () => {
		const opt: CriteriaOrBehaviourOption = {
			defaultVal: 'ALG_3DES',
			name: 'algorithm',
			type: 'enum',
			values: ['ALG_3DES'],
			visible: {
				if: {
					attribute: 'transform',
					op: 'in',
					value: [99], // This is invalid - it should be a string.
				},
			},
		} as unknown as CriteriaOrBehaviourOption; // Necessary because of the incorrect type for the value

		const schema: NamedOptionSchema = {
			enum: ['ALG_3DES'],
		};

		expect(() => Catalog.makeParameter('name', opt, schema)).toThrow(
			'Expected a string value for items in an "in" clause, but got 99 which is a number',
		);
	});

	test('Detect invalid op="not"', () => {
		const opt: CriteriaOrBehaviourOption = {
			defaultVal: true,
			name: 'enabled',
			type: 'switch',
			values: [false, true],
			visible: {
				if: {
					expression: true, // Incorrect, this should be an object
					op: 'not',
				},
			},
		} as unknown as CriteriaOrBehaviourOption; // Necessary because of incorrect `expression` type above

		const schema: NamedOptionSchema = {
			enum: [false, true],
		};

		expect(() => Catalog.makeParameter('name', opt, schema)).toThrow('Unknown type for expression "true": boolean');
	});
});

describe('Default assignment reordering', () => {
	test('Verify that we move assignments to after their last dependency', () => {
		const before: {name: string; dependsOnVars: string[]}[] = [
			{
				name: 'a',
				dependsOnVars: ['c', 'b'], // Note that we put 'b' at the end to ensure our `max()` statement works.
			},
			{
				name: 'b',
				dependsOnVars: [],
			},
			{
				name: 'c',
				dependsOnVars: [],
			},
			{
				name: 'just here',
				dependsOnVars: [],
			},
		];

		fixAndValidateDefaultAssignmentOrdering('name', before);

		expect(before).toMatchObject([
			{
				name: 'b',
				dependsOnVars: [],
			},
			{
				name: 'c',
				dependsOnVars: [],
			},
			{
				name: 'a',
				dependsOnVars: ['c', 'b'],
			},
			{
				name: 'just here',
			},
		]);
	});

	test('More like setImageManager - just have the single mis-ordered dependency in the middle of a bunch of others', () => {
		const before: {name: string; dependsOnVars: string[]}[] = [
			{
				name: 'a',
				dependsOnVars: [],
			},
			{
				name: 'b',
				dependsOnVars: ['c'],
			},
			{
				name: 'c',
				dependsOnVars: [],
			},
			{
				name: 'd',
				dependsOnVars: [],
			},
		];

		fixAndValidateDefaultAssignmentOrdering('name', before);

		expect(before).toMatchObject([
			{
				name: 'a',
			},
			{
				name: 'c',
			},
			{
				name: 'b',
				dependsOnVars: ['c'],
			},
			{
				name: 'd',
			},
		]);
	});

	test("More like setOrigin - `useUniqueCacheKey` depends on `hostname`, but it `hostname` doesn't have a default", () => {
		const before: {name: string; dependsOnVars: string[]}[] = [
			{
				name: 'a',
				dependsOnVars: ['z'],
			},
			{
				name: 'b',
				dependsOnVars: [],
			},
		];

		fixAndValidateDefaultAssignmentOrdering('name', before);

		expect(before).toMatchObject([
			{
				name: 'a',
				dependsOnVars: ['z'],
			},
			{
				name: 'b',
				dependsOnVars: [],
			},
		]);
	});

	test('Unfixable - cyclic dependency', () => {
		const before: {name: string; dependsOnVars: string[]}[] = [
			{
				name: 'a',
				dependsOnVars: ['b'],
			},
			{
				name: 'b',
				dependsOnVars: ['a'],
			},
		];

		expect(() => fixAndValidateDefaultAssignmentOrdering('name', before)).toThrow(
			`Unable to fix ordering of name - fixed once, but that wasn't enough.`,
		);
	});

	test('Multiple moves', () => {
		const before: {name: string; dependsOnVars: string[]}[] = [
			{
				name: 'a',
				dependsOnVars: ['b', 'c'],
			},
			{
				name: 'b',
				dependsOnVars: ['c'],
			},
			{
				name: 'c',
				dependsOnVars: [],
			},
		];

		fixAndValidateDefaultAssignmentOrdering('name', before);

		expect(before).toMatchObject([
			{
				name: 'c',
				dependsOnVars: [],
			},
			{
				name: 'b',
				dependsOnVars: ['c'], // Note that this would fail if `b` depended on `a`.
			},
			{
				name: 'a',
				dependsOnVars: ['b', 'c'],
			},
		]);
	});
});

describe('Type declarations', () => {
	test('Booleans from "enum" and "boolean"', () => {
		const opt: CriteriaOrBehaviourOption = {values: [], name: 'ignored', type: 'enum' as OptionType};

		expect(Catalog.makeTypeDeclaration('n', opt, {enum: [true, false]})).toStrictEqual([
			undefined,
			'boolean',
			undefined,
		]);
		expect(Catalog.makeTypeDeclaration('n', opt, {type: 'boolean'})).toStrictEqual([
			undefined,
			'boolean',
			undefined,
		]);
	});

	test('Literal unions (from "enum")', () => {
		const opt: CriteriaOrBehaviourOption = {values: [], name: 'ignore', type: 'enum' as OptionType};
		expect(Catalog.makeTypeDeclaration('n', opt, {enum: [true, false]})[1]).toStrictEqual('boolean');

		expect(
			Catalog.makeTypeDeclaration('n', opt, {enum: ['HOST_HEADER', 'CUSTOM'], default: 'HOST_HEADER'}),
		).toStrictEqual(['HOST_HEADER', '"HOST_HEADER" | "CUSTOM"', undefined]);

		expect(Catalog.makeTypeDeclaration('n', opt, {enum: [200, 202], default: 202})).toStrictEqual([
			202,
			'200 | 202',
			undefined,
		]);
	});

	test('Verify cpcode type', () => {
		const opt: CriteriaOrBehaviourOption = {values: [], name: 'ignored', type: 'cpcode' as OptionType};

		expect(
			Catalog.makeTypeDeclaration('n', opt, {$ref: '#/definitions/catalog/option_types/cpcode'}),
		).toStrictEqual([
			undefined,
			'{id: number, name?: string, description?: string, createdDate?: number, cpCodeLimits?: Array<string>, products?: Array<string>}',
			undefined,
		]);
	});
});

describe('Test loading the Packaged pm_catalog.json file', () => {
	test('Load the file to be sure parsing is not broken")', async () => {
		const catalog = await loadCatalog('data/pm_catalog-2024-02-12.json');
		expect(catalog.behaviors.size).toBeGreaterThan(0);
		expect(catalog.criteria.size).toBeGreaterThan(0);
	});
});

describe('Test variant generation', () => {
	test('Test that single arguments generate only 1 variant.', () => {
		const options: CriteriaOrBehaviourOption[] = [
			{
				name: 'option1',
				type: 'enum',
				values: ['1', '2', '3'],
			},
		];

		createVariants(options);
	});

	test('Test "and" conditions', () => {
		const options: CriteriaOrBehaviourOption[] = [
			{
				name: 'option1',
				type: 'enum',
				values: ['1', '2', '3'],
			},
			{
				name: 'option2',
				type: 'enum',
				values: ['a', 'b', 'c'],
			},
			{
				name: 'option3',
				type: 'enum',
				values: ['!', '@', '#'],
				visible: {
					if: {
						op: 'and',
						params: [
							{
								attribute: 'option1',
								op: 'eq',
								value: '1',
							},
							{
								attribute: 'option2',
								op: 'eq',
								value: 'a',
							},
						],
					},
				},
			},
		];

		createVariants(options);
	});

	test('Test "in" conditions', () => {});

	test('Test "contains" conditions', () => {
		const options: CriteriaOrBehaviourOption[] = [
			{
				name: 'option1',
				type: 'enum',
				values: ['1', '2', '3'],
			},
			{
				name: 'option2',
				type: 'enum',
				values: ['a', 'b', 'c'],
				visible: {
					if: {
						attribute: 'option1',
						op: 'eq',
						value: '1',
					},
				},
			},
		];

		createVariants(options);
	});

	test('Test "eq" conditions', () => {
		const options: CriteriaOrBehaviourOption[] = [
			{
				name: 'option1',
				type: 'enum',
				values: ['1', '2', '3'],
			},
			{
				name: 'option2',
				type: 'enum',
				values: ['a', 'b', 'c'],
				visible: {
					if: {
						attribute: 'option1',
						op: 'eq',
						value: '1',
					},
				},
			},
		];

		createVariants(options);
	});
});

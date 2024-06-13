/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE.md
 */

import * as path from 'node:path';
import {CriteriaBuilder, Property} from '../src/types';
import {RuleBuilder, resolveImportPath, run, SynchronousLoadFile, BadJsonError} from '../src/papi/convert';

const NO_LOAD: SynchronousLoadFile = (_: string) => {
	throw new Error('not expecting to load');
};

describe('Execution workflow', () => {
	test('Trivial insertion of commands should accumulate criteria/behaviors in the PAPI rule', () => {
		const builder = new RuleBuilder(NO_LOAD, undefined);
		const fn = function (cfg: RuleBuilder): RuleBuilder {
			cfg.addFromProperty('CRITERIA', 'c', {}, {c: true}).addFromProperty('BEHAVIOR', 'b', {}, {b: true});

			cfg.addFromProperty('BEHAVIOR', 'child2', {}, {child2: true});

			return cfg;
		};

		fn(builder);

		const json = builder.toPapiJson();

		expect(json).toMatchObject({
			children: [
				{
					criteria: [{name: 'c', options: {c: true}}],
					behaviors: [{name: 'b', options: {b: true}}],
				},
			],
			behaviors: [{name: 'child2', options: {child2: true}}],
		});
	});

	test('PM variable detection in strings with allows_Vars', () => {
		const r = RuleBuilder.extractUserVariablesInOptions(['hasOne', 'hasTwo', 'hasNone'], {
			hasOne: 'blah {{user.aa}} blah', // Has a single match, and is a named var.
			hasTwo: '{{user.bbb}} and {{user.c}}', // Has two matches. Both should be found.
			hasNone: 'no vars here', // In the allowsVars list, but doesn't contain a PM var.
			shouldNotBeFound: '{{user.should not be detected}}', // Not in the allowsVars list
		});

		expect(r).toEqual(['aa', 'bbb', 'c']);
	});

	test('PM variable detection in strings for "variables" type', () => {
		const r = RuleBuilder.extractVariableNameOptions(['isName'], {
			isName: 'i am name',
			isNotName: "this isn't a name",
		});

		expect(r).toEqual(['i am name']);
	});

	test('PM variable detection and inclusion in the root rule', () => {
		const builder = new RuleBuilder(NO_LOAD, undefined);

		const fn = function (cfg: RuleBuilder): RuleBuilder {
			cfg.addFromProperty(
				'CRITERIA',
				'c',
				{allowsVars: ['fromCriteria']},
				{fromCriteria: 'preamble {{user.fromCriteria}} postamble'},
			)
				.addFromProperty(
					'BEHAVIOR',
					'b',
					{allowsVars: ['allowedVar']},
					{allowedVar: '{{user.yes}}', unallowedVar: '{{user.no}}'},
				)
				.addFromProperty('CRITERIA', 'd', {variableList: ['vList']}, {vList: ['vList1', 'vList2']});
			return cfg;
		};

		fn(builder);

		const json = builder.toPapiJson();

		expect(json).toMatchObject({
			variables: [
				{
					name: 'fromCriteria',
					description: expect.stringContaining('Variable defined on '),
				},
				{
					name: 'yes',
					description: expect.stringContaining('Variable defined on '),
				},
				{
					name: 'vList1',
					description: expect.stringContaining('Variable defined on '),
				},
				{
					name: 'vList2',
					description: expect.stringContaining('Variable defined on '),
				},
			],
		});
	});

	test('PM variable raises an error on invalid `variableList`', () => {
		const builder = new RuleBuilder(NO_LOAD, undefined);

		const fn = function (cfg: RuleBuilder): RuleBuilder {
			cfg.addFromProperty('CRITERIA', 'd', {variableList: ['vList']}, {vList: 'totally invalid value'});
			return cfg;
		};

		expect(() => fn(builder)).toThrow('Expected the option vList to be an array of strings, but it was string');
	});

	test("PM variable detection doesn't overwrite previously seen vars", () => {
		const builder = new RuleBuilder(NO_LOAD, undefined);

		// We cheat - run the builder once to register the variable `myVar`...
		const fn = function (cfg: RuleBuilder): RuleBuilder {
			cfg.addFromProperty('CRITERIA', 'd', {allowsVars: ['av']}, {av: '{{user.myVar}}'});
			return cfg;
		};

		fn(builder);

		// Allow the 'any' type so we can navigate the object to find 'originalLine'
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const json: any = builder.toPapiJson();

		expect(json).toMatchObject({
			variables: [
				{
					name: 'myVar',
					description: expect.stringContaining('Variable defined on '),
				},
			],
		});
		const originalLine = json.variables[0].description;

		// ... now update the builder to register the same property again...
		builder.addFromProperty('CRITERIA', 'z', {allowsVars: ['av']}, {av: '{{user.myVar}}'});

		expect(builder.toPapiJson()).toMatchObject({
			variables: [
				{
					name: 'myVar',
					// ... the 'description' contains the line that the variable was first registered on. Make sure it hasn't changed since the first execution.
					description: originalLine,
				},
			],
		});
	});

	test('.any() inserts multiple criteria and sets .criteriaMustSatisfy="any"', () => {
		const builder = new RuleBuilder(NO_LOAD, undefined);

		const fn = function (cfg: RuleBuilder) {
			cfg.doAny((cb: CriteriaBuilder) => {
				cb.onPath({values: ['pth']});

				cb.onHostname({values: ['hst']}).onBucket({percentage: 6});
			});

			return cfg;
		};

		fn(builder);

		const json = builder.toPapiJson();

		expect(json).toMatchObject({
			children: [
				{
					criteria: [
						{name: 'path', options: {values: ['pth']}},
						{name: 'hostname', options: {values: ['hst']}},
						{name: 'bucket', options: {percentage: 6}},
					],
					criteriaMustSatisfy: 'any',
				},
			],
		});
	});

	test('.newBlankRule() works', () => {
		const builder = new RuleBuilder(NO_LOAD, undefined);

		const NEW_RULE_NAME = 'rule1';
		const NEW_RULE_COMMENT = 'This is a comment';

		const fn = function (cfg: RuleBuilder) {
			cfg.newBlankRule(NEW_RULE_NAME, NEW_RULE_COMMENT);

			return cfg;
		};

		fn(builder);

		interface JsonType {
			children: [{name: string; comments: string}];
		}

		const json = builder.toPapiJson() as JsonType;

		expect(json).toMatchObject({
			children: expect.arrayContaining([
				expect.objectContaining({
					name: NEW_RULE_NAME,
					comments: expect.any(String),
				}),
			]),
		});
		expect(json.children[0].comments).toContain(NEW_RULE_COMMENT);
	});

	test('.any() updates PM variable listings', () => {
		const builder = new RuleBuilder(NO_LOAD, undefined);

		const fn = function (cfg: RuleBuilder) {
			cfg.doAny((cb: CriteriaBuilder) => {
				// For `onMatchVariable`, the `variableName` option is of type 'variable', so it creates a PM variable,
				// and the `variableExpression` option is an 'allowVars', so it creates a PM variable as well.
				cb.onMatchVariable({variableName: 'inName', variableExpression: '{{user.inExpression}}'});
			});

			return cfg;
		};

		fn(builder);

		const json = builder.toPapiJson();

		expect(json).toMatchObject({
			variables: [
				{
					name: 'inExpression',
				},
				{
					name: 'inName',
				},
			],
		});
	});

	test(".any() can't accidentally insert a behaviour", () => {
		const fn = function (cfg: Property): Property {
			expect(cfg).toHaveProperty('setDnsPrefresh');
			cfg.any((crit: CriteriaBuilder) => {
				expect(crit).not.toHaveProperty('setDnsPrefresh');
			});

			return cfg;
		};

		run(NO_LOAD, fn);
	});

	test('Make sure type wrappers are as expected', () => {
		const fn = function (cfg: Property): Property {
			expect(cfg).toBeInstanceOf(Property);

			const anyRet = cfg.any((crit: CriteriaBuilder) => {
				expect(crit).toBeInstanceOf(CriteriaBuilder);

				const critRet = crit.onBucket({});

				expect(critRet).toBeInstanceOf(CriteriaBuilder);

				// We require identity, since that means we have the same underlying
				// builder, which ensures the criteria end up in the same rule.
				expect(critRet).toBe(crit);
			});

			expect(anyRet).toBeInstanceOf(Property);
			expect(anyRet).not.toBe(cfg);

			const prefetchRet = cfg.setPrefetchable({});
			expect(prefetchRet).toBeInstanceOf(Property);

			// The new builder should be a child rule of the parent, meaning
			// it can't be the same.
			expect(prefetchRet).not.toBe(cfg);

			return cfg;
		};

		run(NO_LOAD, fn);
	});

	test('Insertion via generated PAPI function', () => {
		const fn = function (cfg: Property): Property {
			cfg.setModifyOutgoingResponseHeader({
				action: 'ADD',
				standardAddHeaderName: 'OTHER',
				standardDeleteHeaderName: 'OTHER',
				standardModifyHeaderName: 'OTHER',
				customHeaderName: 'aka-my-custom-hdr',
				headerValue: 'hello PAPI world',
				newHeaderValue: 'ignored',
				avoidDuplicateHeaders: true,
				regexHeaderMatch: '',
				regexHeaderReplace: '',
				matchMultiple: true,
			});

			return cfg;
		};

		const papi = run(NO_LOAD, fn);
		expect(papi).toBeInstanceOf(RuleBuilder);
		const json = (papi as RuleBuilder).toPapiJson();

		expect(json).toMatchObject({
			behaviors: [
				{
					name: 'modifyOutgoingResponseHeader',
					options: {
						action: 'ADD',
						standardAddHeaderName: 'OTHER',
						headerValue: 'hello PAPI world',
						customHeaderName: 'aka-my-custom-hdr',
					},
				},
			],
		});
	});

	test('Rule names are assigned as appropriate', () => {
		const fn = function (cfg: Property): Property {
			// Sets the top-level rule name
			cfg.name('parent name');

			cfg.onClientIp({matchOperator: 'IS_ONE_OF', values: ['0']})
				// Set the name of a child
				.name('child name');

			cfg
				// Don't set the name of this child, verify we use the line number.
				.onClientIp({matchOperator: 'IS_ONE_OF', values: ['99']});

			return cfg;
		};

		const papi = run(NO_LOAD, fn);
		expect(papi).toBeInstanceOf(RuleBuilder);
		const json = (papi as RuleBuilder).toPapiJson();

		expect(json).toMatchObject({
			name: 'parent name',
			children: [
				{
					name: 'child name',
					criteria: [
						{
							name: 'clientIp',
						},
					],
				},
				{
					name: expect.stringMatching(/tests\/convert.test.ts:\d+/),
				},
			],
		});
	});

	test('Comments are inserted in parallel to line numbers', () => {
		const fn = function (cfg: Property): Property {
			// Sets the top-level rule name
			cfg.comment('parent comment');

			cfg.onClientIp({matchOperator: 'IS_ONE_OF', values: ['0']})
				// Set the name of a child
				.comment('child comment');

			cfg
				// Don't set the name of this child, verify we use the line number.
				.onClientIp({matchOperator: 'IS_ONE_OF', values: ['99']});

			cfg
				// .any() could follow a different code path, so we check it specially.
				.any(cb => cb.onBucket({percentage: 5}))
				.name('any name')
				.comment('any comment');

			return cfg;
		};

		const papi = run(NO_LOAD, fn);
		expect(papi).toBeInstanceOf(RuleBuilder);
		const json = (papi as RuleBuilder).toPapiJson();

		expect(json).toMatchObject({
			// The top-most Rule won't have a line number because it was created outside of the customer's config.
			comments: expect.stringMatching(/parent comment(?!.*tests\/convert.test.ts:\d+)(?!undefined)/ms),
			children: [
				{
					comments: expect.stringMatching(/child comment.*tests\/convert.test.ts:\d+/ms),
					criteria: [
						{
							name: 'clientIp',
						},
					],
				},
				{
					comments: expect.stringMatching(/tests\/convert.test.ts:\d+/),
				},
				{
					criteria: [{name: 'bucket'}],
					criteriaMustSatisfy: 'any',
					name: 'any name',
					comments: expect.stringMatching(/any comment.*tests\/convert.test.ts:\d+/ms),
				},
			],
		});
	});

	test('Include JS stack trace information in PAPI JSON', () => {
		const fn = function (cfg: Property): Property {
			cfg.onPath({values: []}).setModifyOutgoingResponseHeader({
				action: 'ADD',
				standardAddHeaderName: 'OTHER',
				standardDeleteHeaderName: 'OTHER',
				standardModifyHeaderName: 'OTHER',
				customHeaderName: 'aka-my-custom-hdr',
				headerValue: 'hello PAPI world',
				newHeaderValue: 'ignored',
				avoidDuplicateHeaders: true,
				regexHeaderMatch: '',
				regexHeaderReplace: '',
				matchMultiple: true,
			});

			cfg.any((crit: CriteriaBuilder) => {
				crit.onBucket({});
			});

			return cfg;
		};

		const papi = run(NO_LOAD, fn);
		expect(papi).toBeInstanceOf(RuleBuilder);
		const json = (papi as RuleBuilder).toPapiJson();

		expect(json).toMatchObject({
			children: [
				{
					comments: expect.stringMatching(/convert.test.ts/),
					criteria: [
						{
							name: 'path',
						},
					],
					behaviors: [
						{
							name: 'modifyOutgoingResponseHeader',
						},
					],
				},
				{
					comments: expect.stringMatching(/convert.test.ts/),
					criteria: [
						{
							name: 'bucket',
						},
					],
				},
			],
		});
	});

	test('Verify is_secure will not be added to non default rule', () => {
		const fn = function (cfg: Property): Property {
			cfg.name('parent name');
			cfg.is_secure(true);
			cfg.onHostname({values: ['my-subdomain.example.org']});

			return cfg;
		};

		const papi = run(NO_LOAD, fn);
		expect(papi).toBeInstanceOf(RuleBuilder);
		const json = (papi as RuleBuilder).toPapiJson();
		expect(json).toMatchObject({
			name: 'parent name',
			children: [
				{
					criteria: [{name: 'hostname', options: {values: ['my-subdomain.example.org']}}],
				},
			],
		});
	});
	test('Verify is_secure can be added to default rule', () => {
		const fn = function (cfg: Property): Property {
			cfg.is_secure(true);
			cfg.onHostname({values: ['my-subdomain.example.org']});

			return cfg;
		};

		const papi = run(NO_LOAD, fn);
		expect(papi).toBeInstanceOf(RuleBuilder);
		const json = (papi as RuleBuilder).toPapiJson();
		expect(json).toMatchObject({
			name: 'default',
			options: {is_secure: true},
			children: [
				{
					criteria: [{name: 'hostname', options: {values: ['my-subdomain.example.org']}}],
				},
			],
		});
	});
	test('Verify filename location in comments is relative', () => {
		const fn = function (cfg: Property): Property {
			cfg.onHostname({values: ['my-subdomain.example.org']});
			return cfg;
		};

		const papi = run(NO_LOAD, fn);
		expect(papi).toBeInstanceOf(RuleBuilder);
		const json = (papi as RuleBuilder).toPapiJson();

		expect(json).toMatchObject({
			children: [
				{
					criteria: [{name: 'hostname', options: {values: ['my-subdomain.example.org']}}],
					comments: expect.stringMatching(/^tests\/convert.test.ts:\d+/),
				},
			],
		});
	});
});

/**
 * A helper function to remove ANSI code from a string.
 *
 * @param {string} text A string of text to remove ANSI code
 * @returns {string} A string without ANSI code.
 */
function removeAnsiCodeFromStr(text: string): string {
	// eslint-disable-next-line no-control-regex
	const ansiRegex = /\u001b\[[0-9;]*m/g;
	// Remove ANSI escape codes from the string
	return text.replace(ansiRegex, '');
}

describe('Validate Static Config File (SCF) import and output', () => {
	test('Trivial successful import with defaults inserted', () => {
		const loader = (): string =>
			'{"$schema":"../../schema/v2024-02-12.json","name":"default","behaviors":[{"name":"caching","options":{"behavior":"MAX_AGE","ttl":"1d","mustRevalidate":false}}]}';

		const builder = new RuleBuilder(loader, undefined);

		const returnedRuleBuilder = builder.importChildRuleToPath('ignored');

		// Sadly there doesn't seem to be an identity operator. `===` is as close as we can get.
		// We don't use `.toBe()` because that's a bit opaque.
		expect(returnedRuleBuilder === builder).toBeTruthy();

		const json = builder.toPapiJson();
		expect(json).toMatchObject({
			children: [
				{
					behaviors: [
						{
							name: 'caching',
							options: {
								behavior: 'MAX_AGE',
								ttl: '1d',
								mustRevalidate: false,
								// below are defaults
								enhancedRfcSupport: false,
								honorNoStore: true,
								honorPrivate: false,
								honorNoCache: true,
								honorMaxAge: true,
								honorSMaxage: false,
								honorMustRevalidate: false,
								honorProxyRevalidate: false,
							},
						},
					],
				},
			],
		});
	});

	test('Verify that we can resolve paths relative to the calling file', () => {
		expect(resolveImportPath('/a/b/c/config.js', '../parent.json')).toEqual('/a/b/parent.json');

		expect(resolveImportPath('/a/b/c/config.js', 'peer.json')).toEqual('/a/b/c/peer.json');
		expect(resolveImportPath('/a/b/c/config.js', './peer.json')).toEqual('/a/b/c/peer.json');

		expect(resolveImportPath('/a/b/c/config.js', '/abs.json')).toEqual('/abs.json');

		expect(resolveImportPath('/a/b/c/config.js', 'dir/child.json')).toEqual(`/a/b/c/dir/child.json`);
		expect(resolveImportPath('/a/b/c/config.js', './dir/child.json')).toEqual(`/a/b/c/dir/child.json`);
	});

	test('Verify we can insert a Static Config File, and then add another child to the same node', () => {
		// Configure a loader that only loads our path
		const PATH = 'testPath.json';
		const loader: SynchronousLoadFile = (absPath: string) => {
			// We use `toContain()`, since the path has been made absolute.
			expect(absPath).toContain(PATH);

			return '{"name":"default","behaviors":[{"name":"caching","options":{"behavior":"MAX_AGE","ttl":"1d","mustRevalidate":false}}],"criteria":[{"name":"fileExtension","options":{"matchOperator":"IS_ONE_OF"}}], "children":[{"name":"Image","behaviors":[{"name":"caching","options":{"behavior":"MAX_AGE","ttl":"1d","mustRevalidate":false}}]}]}';
		};

		// Create a callback that tries an import
		const fn = function (cfg: Property): Property {
			cfg.onHostname({values: ['my-subdomain.example.org']}).importChildRule(PATH);

			cfg.onPath({values: ['/wheee']}).setEdgeWorker({edgeWorkerId: '999'});

			return cfg;
		};

		// Run
		const ruleBuilder = run(loader, fn);
		expect(ruleBuilder).toBeInstanceOf(RuleBuilder);
		const papi = (ruleBuilder as RuleBuilder).toPapiJson();

		// Validate
		expect(papi).toMatchObject({
			children: [
				{
					criteria: [
						{
							name: 'hostname',
						},
					],
					children: [
						// Here it is! The static config!
						{
							behaviors: [
								{
									name: 'caching',
									options: {
										behavior: 'MAX_AGE',
										ttl: '1d',
										mustRevalidate: false,
										// Below are defaults
										enhancedRfcSupport: false,
										honorNoStore: true,
										honorPrivate: false,
										honorNoCache: true,
										honorMaxAge: true,
										honorSMaxage: false,
										honorMustRevalidate: false,
										honorProxyRevalidate: false,
									},
								},
							],
							criteria: [
								{
									name: 'fileExtension',
									options: {
										matchOperator: 'IS_ONE_OF',
										// default is inserted
										matchCaseSensitive: false,
									},
								},
							],
							children: [
								{
									name: 'Image',
									behaviors: [
										{
											name: 'caching',
											options: {
												behavior: 'MAX_AGE',
												ttl: '1d',
												mustRevalidate: false,
												// Below are defaults
												enhancedRfcSupport: false,
												honorNoStore: true,
												honorPrivate: false,
												honorNoCache: true,
												honorMaxAge: true,
												honorSMaxage: false,
												honorMustRevalidate: false,
												honorProxyRevalidate: false,
											},
										},
									],
								},
							],
							// The full path isn't included in the `__loc`, so we just make sure the current file's name is in there.
							// We ignore the line number, because it's hard to validate.
							__loc: expect.stringContaining(path.basename(__filename)),
						},
					],
				},
				{
					criteria: [
						{
							name: 'path',
						},
					],
					behaviors: [
						{
							name: 'edgeWorker',
						},
					],
				},
			],
		});
	});
	test('Verify the raised error has correct line number', () => {
		/* This is the raw json file to be validated. Error line should be line #5 
		{

		"$schema":"../../schema/v2024-02-12.json",
		"name":"default",
		"behaviors":[{"name":"bla","options":{"originSni":"should_be_bool"}}]}
		 */
		const loader = (): string =>
			'{\n\n"$schema":"../../schema/v2024-02-12.json",\n"name":"default",\n"behaviors":[{"name":"bla","options":{"originSni":"should_be_bool"}}]}';
		const builder = new RuleBuilder(loader, undefined);
		const fn = function (cfg: RuleBuilder): RuleBuilder {
			cfg.importChildRule('test.json');
			return cfg;
		};

		try {
			fn(builder);
			fail('should throw an error');
		} catch (err) {
			expect(err).toBeInstanceOf(BadJsonError);
			const errMessage = (err as BadJsonError).toString();
			// Remove ANSI escape codes from the string
			const errWithoutAnsi = removeAnsiCodeFromStr(errMessage);

			// validation line number should be 5.
			expect(errWithoutAnsi).toContain(
				'> 5 | "behaviors":[{"name":"bla","options":{"originSni":"should_be_bool"}}]}',
			);
			expect(errWithoutAnsi).toContain('Unexpected value, should be equal to one of the allowed values');
		}
	});
	test('Verify error is raised when validation fails', () => {
		const loader = (): string =>
			'{"name":"default","behaviors":[{"name":"invalid","options":{"behavior":"invalid"}}]}';
		const builder = new RuleBuilder(loader, undefined);
		const fn = function (cfg: RuleBuilder): RuleBuilder {
			cfg.importChildRule('test.json');
			return cfg;
		};

		try {
			fn(builder);
			fail('should throw an error');
		} catch (err) {
			expect(err).toBeInstanceOf(BadJsonError);
			const errMessage = (err as BadJsonError).toString();
			// Remove ANSI escape codes from the string
			const errWithoutAnsi = removeAnsiCodeFromStr(errMessage);
			expect(errWithoutAnsi).toContain('Unexpected value, should be equal to one of the allowed values');
		}
	});
	test('Verify error is raised when required property is missing', () => {
		const loader = (): string =>
			'{"$schema":"../../schema/v2024-02-12.json","name":"default","behaviors":[{"name":"cpCode","options":{"value":{}}}]}';

		const builder = new RuleBuilder(loader, undefined);
		const fn = function (cfg: RuleBuilder): RuleBuilder {
			cfg.importChildRule('test.json');
			return cfg;
		};

		try {
			fn(builder);
			fail('should throw an error');
		} catch (err) {
			expect(err).toBeInstanceOf(BadJsonError);
			const errMessage = (err as BadJsonError).toString();
			expect(errMessage).toContain("must have required property 'id'");
		}
	});
});

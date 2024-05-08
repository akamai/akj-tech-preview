/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE.md
 */

import {CriteriaBuilder, Property} from '../src/types';
import {RuleBuilder, run} from '../src/papi/convert';

describe('Execution workflow', () => {
	test('Trivial insertion of commands should accumulate criteria/behaviors in the PAPI rule', () => {
		const builder = new RuleBuilder(undefined);
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
		const builder = new RuleBuilder(undefined);

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
		const builder = new RuleBuilder(undefined);

		const fn = function (cfg: RuleBuilder): RuleBuilder {
			cfg.addFromProperty('CRITERIA', 'd', {variableList: ['vList']}, {vList: 'totally invalid value'});
			return cfg;
		};

		expect(() => fn(builder)).toThrow('Expected the option vList to be an array of strings, but it was string');
	});

	test("PM variable detection doesn't overwrite previously seen vars", () => {
		const builder = new RuleBuilder(undefined);

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
		const builder = new RuleBuilder(undefined);

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

	test('.any() updates PM variable listings', () => {
		const builder = new RuleBuilder(undefined);

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

		run(fn);
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

		run(fn);
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

		const papi = run(fn);

		const json = papi.toPapiJson();

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

		const papi = run(fn);

		const json = papi.toPapiJson();

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

		const papi = run(fn);

		const json = papi.toPapiJson();

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

		const papi = run(fn);

		const json = papi.toPapiJson();

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

		const papi = run(fn);
		const json = papi.toPapiJson();
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

		const papi = run(fn);
		const json = papi.toPapiJson();
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

		const papi = run(fn);

		const json = papi.toPapiJson();

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

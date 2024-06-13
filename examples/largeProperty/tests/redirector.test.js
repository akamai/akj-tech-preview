const {Property, RuleBuilder} = require('pcdn_tech_preview');
const {setupRedirects, GEO_REDIRECT_PATTERN, WWW_REDIRECT_PATTERN} = require('../src/rules/redirector');

describe('Redirector Rules', () => {
	test('Dynamic Patterns Creates Rules', () => {
		let config = new Property(new RuleBuilder());

		const patterns = [
			{
				name: `${GEO_REDIRECT_PATTERN}ca`,
				id: 1,
				policyType: 'SHARED',
			},
			{
				name: `${GEO_REDIRECT_PATTERN}us`,
				id: 2,
				policyType: 'SHARED',
			},
			{
				name: `${GEO_REDIRECT_PATTERN}fa`,
				id: 3,
				policyType: 'SHARED',
			},
			{
				name: `${WWW_REDIRECT_PATTERN}spa`,
				id: 4,
				policyType: 'SHARED',
			},
		];

		setupRedirects(config, () => {
			// this is a trimmed down version of what cloudlets would return from their API.
			// see https://techdocs.akamai.com/cloudlets/reference/get-policies for the full objects but these keys/values are all that is needed.
			return patterns;
		});

		// Check the rulebuilder has the expected children added to it.
		expect(config.delegate.children.length).toBeGreaterThan(0);

		// this is getting into asserting a lot of low level stuff inside the representations of a property
		// but it shows how things are working and how to check they are built correctly.

		// assert that the first of the Geo Redirects has been created with the correct path, name etc
		const geoRedirectGroup = config.delegate.children[0];
		expect(geoRedirectGroup.papiAttributes.name).toBe('Geo Redirects');
		expect(geoRedirectGroup.children.length).toBe(3);
		const cloudletGeoommand = geoRedirectGroup.children[0].commands[0];
		expect(cloudletGeoommand.name).toBe('edgeRedirector');
		expect(cloudletGeoommand.options.cloudletSharedPolicy).toBe(1);
		const cloudletWWWGeo = geoRedirectGroup.children[0].matchers[0];
		expect(cloudletWWWGeo.name).toBe('path');
		expect(cloudletWWWGeo.options.values[0]).toBe('/ca/*');

		// assert that the www redirect has been created with the correct path, name etc
		const wwwRedirectGroup = config.delegate.children[1];
		expect(wwwRedirectGroup.papiAttributes.name).toBe('www redirects');
		const cloudletWWWCommand = wwwRedirectGroup.children[0].commands[0];
		expect(cloudletWWWCommand.name).toBe('edgeRedirector');
		expect(cloudletWWWCommand.options.cloudletSharedPolicy).toBe(4);
		const cloudletWWWMatcher = wwwRedirectGroup.children[0].matchers[0];
		expect(cloudletWWWMatcher.name).toBe('path');
		expect(cloudletWWWMatcher.options.values[0]).toBe('/spa/*');
	});
});

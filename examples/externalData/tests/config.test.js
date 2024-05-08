const {Property, RuleBuilder} = require('akj-tech-preview');
const {onConfig} = require('../src/config');

/**
 * Create an empty property to use with tests
 *
 * @param {string} name The name of the property. default value is `default`
 * @returns {Property} The empty property
 */
function createEmptyProperty(name = 'default') {
	const cfg = new RuleBuilder(undefined, '');
	cfg.papiAttributes.name = name;
	return new Property(cfg);
}

describe('onConfig Creates Realistic looking rules', () => {
	describe('Production Environment', () => {
		beforeAll(() => {
			process.env.ENVIRONMENT = 'prod';
		});
		test('Simple Example Testing CP Code is set as expected.', () => {
			let property = createEmptyProperty();

			// spy on the CP Code to ensure it is the expected production value.
			const setCPCodeSpy = jest.spyOn(Property.prototype, 'setCpCode');
			onConfig(property);

			expect(setCPCodeSpy).toHaveBeenCalledTimes(8);
			expect(setCPCodeSpy).toHaveBeenCalledWith({
				value: {
					id: 3456,
				},
			});

			setCPCodeSpy.mockRestore();
		});
		afterAll(() => {
			delete process.env.ENVIRONMENT;
		});
	});

	describe('Staging Environment', () => {
		beforeAll(() => {
			process.env.ENVIRONMENT = 'stag';
		});
		test('Simple Example Testing CP Code is set as expected.', () => {
			let property = createEmptyProperty();

			// spy on the CP Code to ensure it is the expected production value.
			const setCPCodeSpy = jest.spyOn(Property.prototype, 'setCpCode');
			onConfig(property);

			expect(setCPCodeSpy).toHaveBeenCalledTimes(6);
			expect(setCPCodeSpy).toHaveBeenCalledWith({
				value: {
					id: 2345,
				},
			});

			setCPCodeSpy.mockRestore();
		});
		afterAll(() => {
			delete process.env.ENVIRONMENT;
		});
	});

	describe('Dev Environment', () => {
		beforeAll(() => {
			process.env.ENVIRONMENT = 'stag';
		});
		test('Simple Example Testing CP Code is set as expected.', () => {
			let property = createEmptyProperty();

			// spy on the CP Code to ensure it is the expected production value.
			const setCPCodeSpy = jest.spyOn(Property.prototype, 'setCpCode');
			onConfig(property);

			expect(setCPCodeSpy).toHaveBeenCalledTimes(6);
			expect(setCPCodeSpy).toHaveBeenCalledWith({
				value: {
					id: 1234,
				},
			});

			setCPCodeSpy.mockRestore();
		});
		afterAll(() => {
			delete process.env.ENVIRONMENT;
		});
	});
});

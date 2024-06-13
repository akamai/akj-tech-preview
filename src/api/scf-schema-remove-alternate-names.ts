// Helper that removes alternate names from the SCF schema. Must be run from the repo root.

import fs from 'fs';

type ScfCriteriaOrBehaviour = {
	properties: {
		name: {
			enum: string[];
		};
	};
};

type ScfWithAlternateNames = {
	definitions: {
		behavior: {
			allOf: {
				properties: {
					name: {
						enum: string[];
					};
				};
			}[];
		};
		criteria: {
			allOf: {
				properties: {
					name: {
						enum: string[];
					};
				};
			}[];
		};
		catalog: {
			behaviors: {
				[key: string]: ScfCriteriaOrBehaviour;
			};
			criteria: {
				[key: string]: ScfCriteriaOrBehaviour;
			};
		};
	};
};

/**
 * Replaces the alternate names in the map of criteria/behaviors with the canonical names. Note that the change is made
 * in-place.
 *
 * @param {{[key: string]: ScfCriteriaOrBehaviour}} criteriaOrBehavior The item to update.
 */
function removeExtraNamesInPlace(criteriaOrBehavior: {[key: string]: ScfCriteriaOrBehaviour}) {
	for (const name in criteriaOrBehavior) {
		const enumToUpdate = criteriaOrBehavior[name].properties.name.enum;
		if (enumToUpdate.length > 1) {
			enumToUpdate.length = 0;
			enumToUpdate.push(name);
		}
	}
}

const schemaString = fs.readFileSync('schema/v2024-02-12-scf.json', 'utf8');

const schema: ScfWithAlternateNames = JSON.parse(schemaString);

removeExtraNamesInPlace(schema.definitions.catalog.behaviors);
const filteredBehaviors = schema.definitions.behavior.allOf[0].properties.name.enum.filter(
	behaviorName => behaviorName in schema.definitions.catalog.behaviors,
);
schema.definitions.behavior.allOf[0].properties.name.enum = filteredBehaviors;

removeExtraNamesInPlace(schema.definitions.catalog.criteria);
const filteredCriteria = schema.definitions.criteria.allOf[0].properties.name.enum.filter(
	criteriaName => criteriaName in schema.definitions.catalog.criteria,
);
schema.definitions.criteria.allOf[0].properties.name.enum = filteredCriteria;

// The user is meant to pipe this to a file, verify the output, and then copy it over the original.
process.stdout.write(JSON.stringify(schema, undefined, '    '));

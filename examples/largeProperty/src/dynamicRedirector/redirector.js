/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE
 */
//@ts-check

const EdgeGrid = require('akamai-edgegrid');
const path = require('path');
const os = require('os');
const {writeFile, mkdir} = require('fs/promises');

const DEFAULT_SHARED_POLICY_LOCATION = './temp/sharedPolicies.json';

/**
 * This exists as a workaround due to `onConfig` not being an async function at the time of writing this example. The
 * akamai-edgegrid library can be converted to easily return promises rather than using a callback (see `sendRequest`),
 * but there is no getting around async code inside sync code. To do this, this method is invoked by NodeJS in a script,
 * and the results are read by the onConfig file.
 */
(async () => {
	try {
		const policies = await getSharedPolicies();
		try {
			await writeSharedPolicies(policies);
		} catch (err) {
			console.log(`Failed to write the shared polices to disk due to: ${err}`);
			process.exit(1);
		}
	} catch (err) {
		console.log(`Failed to access the shared policies due to: ${err}`);
		process.exit(1);
	}
})();

/**
 * Write the shared policies to disk
 *
 * @param {object} data The data to write to the file*
 * @param {string} [location] The file location. Default is `'./temp/sharedPolicies.json'`
 */
async function writeSharedPolicies(data, location = DEFAULT_SHARED_POLICY_LOCATION) {
	await mkdir(path.dirname(location), {recursive: true});
	await writeFile(location, JSON.stringify(data, null, 4));
}

/**
 * @param {string | undefined} [accountSwitchKey] AccountSwitchKey The account switch key to use
 * @param {string} [edgeGridAuthPath] EdgeGridAuthPath The path to where the .edgerc file is located
 * @returns {Promise<object[]>} The list of Cloudlet shared policies
 */
async function getSharedPolicies(
	accountSwitchKey = process.env.ACCOUNT_SWITCH_KEY,
	edgeGridAuthPath = path.join(os.homedir(), '.edgerc'),
) {
	const edgeGrid = new EdgeGrid({
		path: edgeGridAuthPath,
	});

	const initialPath = `/cloudlets/v3/policies?page=0&size=100${accountSwitchKey ? '&accountSwitchKey=' + accountSwitchKey : ''}`;

	edgeGrid.auth({
		path: initialPath,
		method: 'GET',
	});

	let policies = [];

	// This is for example purposes
	// - It will only return the first 100 policies; if you have more, you will need to loop over the pages
	// - It isn't really going to error handle very well;  it assumes a 200 response
	try {
		const {response, body} = await sendRequest(edgeGrid);
		if (response.status != 200) {
			console.log(`Unexpected status when fetching status codes: ${response.status}]n`);
		} else {
			const returnedPolicies = JSON.parse(body);
			policies.push(...returnedPolicies.content);
		}
	} catch (err) {
		console.log(`An error occurred accessing the policies: ${err}`);
	}

	return policies;
}

/**
 * A utility function to wrap the edgegrid send command in a promise.
 *
 * @param {EdgeGrid} edgegrid The instance to send the request
 * @returns {Promise} A promise to resolve the call to edgegrid
 */
function sendRequest(edgegrid) {
	return new Promise((resolve, reject) => {
		edgegrid.send(function (error, response, body) {
			if (error) {
				reject(error);
			} else {
				resolve({response, body});
			}
		});
	});
}

module.exports = {
	DEFAULT_SHARED_POLICY_LOCATION,
	getSharedPolicies,
};

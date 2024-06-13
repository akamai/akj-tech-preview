/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE.md
 */

import {Catalog, PmCatalog, RuleFormatSchema} from '../papi/pmcatalog-tools';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Async load of the catalog file from disk.
 *
 * @param {string} catalogPath The path to the catalog file
 * @returns {Promise<Catalog>} A promise to parse the Catalog for a file on disk.
 */
export async function loadCatalog(catalogPath: string): Promise<Catalog> {
	const defn: PmCatalog = JSON.parse(await fs.promises.readFile(catalogPath, 'utf-8'));

	// Use the Rule Format specified in the PM catalog so we avoid skew.
	const pathToRuleFormat = path.join(path.dirname(catalogPath), `../schema/${defn.ruleFormat}.json`);
	let file;
	try {
		file = await fs.promises.readFile(pathToRuleFormat, 'utf-8');
	} catch (e) {
		throw new Error(`Failed to load rule format at ${pathToRuleFormat}`, {cause: e});
	}
	const schema: RuleFormatSchema = JSON.parse(file);

	const catalog = Catalog.loadFrom(defn, schema);
	return catalog;
}

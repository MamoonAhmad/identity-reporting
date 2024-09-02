import fs from "node:fs";

import { ERROR_CODES, throwError } from "../errors.js";
import { logger } from "../logger.js";
import { writeFileJSONPromised } from "./writeFileJSONPromised.js";
import { readJSONFilePromised } from "./readJSONFilePromised.js";


/**
 * This class is used for indexing the directory.
 * TestSuite and ExecutedFunction entities utilize this to index the files.
 * This class creates an index file inside the entity directory. 
 * Search and filters will utilize the index file.
*/
export class FileIndex {

    /**
     * 
     * @param {String} entity Entity label.
     * @param {String} filePath File path for the entity.
     * @param getContentFromRecordCallback Callback for retrieving fields to index.
     * @param {Int} maxEntries Max number of entries in the index. 0 means infinite.
     */
    constructor(entity, filePath, getContentFromRecordCallback, maxEntries = 0) {
        this.getContentFromRecordCallback = getContentFromRecordCallback;
        this.filePath = filePath;
        this.entity = entity;
        this.cache = null;
        this.locked = false;
        this.maxEntries = maxEntries
    }

    async initCache() {
        if (this.cache) {
            return;
        }
        if (fs.existsSync(this.filePath)) {
            try {
                logger.debug(`Initializing ${this.entity} cache.`)
                this.cache = await readJSONFilePromised(this.filePath)
                return
            } catch (e) {
                throwError(ERROR_CODES.EXTERNAL_ERROR, {
                    message: `Could not initialize ${this.entity} cache.`
                })
            }
        }
        logger.debug(`Index file for ${this.entity} does not exist. Initializing empty cache.`);
        this.cache = [];
    }

    // Add records to the index cache
    async addRecord(res) {
        await this.initCache();
        const arr = this.getContentFromRecordCallback(res);
        logger.debug(`Adding new record to ${this.entity} cache.`, arr);
        this.cache.push(arr);

        // Remove extra entries
        if (this.maxEntries > 0) {
            const entriesToSlice = this.cache.length - this.maxEntries;
            if (entriesToSlice > 0) {
                logger.debug(`Removing ${entriesToSlice} entries from ${this.entity} cache because of ${this.maxEntries} entries limit.`)
                this.cache = this.cache.slice(entriesToSlice)
            }
        }


        await this.writeToFile();
    }

    // update record inside the index cache
    async updateRecord(res) {
        await this.initCache();
        const arr = this.getContentFromRecordCallback(res);
        const [id] = arr;
        const index = this.cache.findIndex(i => i[0] === id);
        if (index < 0) {
            throwError(`Trying to update non existent entry (${id}) in ${this.entity} cache.`);
            return;
        }
        logger.debug(`Deleting entry (${id}) from ${this.entity} cache.`)
        this.cache.splice(index, 1, arr);
        await this.writeToFile();
    }
    // Delete record from the index cache
    async deleteRecord(res) {
        await this.initCache();
        const arr = this.getContentFromRecordCallback(res);
        const [id] = arr;
        const index = this.cache.findIndex(i => i[0] === id);
        if (index < 0) {
            logger.error(`Trying to delete non existent entry (${id}) from ${this.entity} cache.`);
            return;
        }
        logger.debug(`Deleting entry (${id}) from ${this.entity} cache.`)
        this.cache.splice(index, 1);
        await this.writeToFile();
    }

    /**
     * Write the cached data to index file.
     */
    async writeToFile() {
        try {
            logger.debug(`Updating ${this.entity} cache.`, this.cache);
            await writeFileJSONPromised(this.filePath, this.cache)
        } catch (e) {
            throwError(ERROR_CODES.EXTERNAL_ERROR, {
                message: `Could not update the ${this.entity} cache. ${e?.toString()}`
            })
        }
    }

    async filter(filterObject = []) {
        await this.initCache();

        return this.cache.filter(cacheEntry => {
            const [_, ...rest] = cacheEntry;
            return rest.every((value, i) => {
                const filter = filterObject[i];
                if (!filter) {
                    return true
                }
                if (filter.contains) {
                    return value?.includes(filter.contains);
                } else if (filter.equals) {
                    return value === filter.equals
                }
                return false;
            })
        }).map(i => i[0]);
    }
}
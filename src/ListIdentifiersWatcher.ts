import sqlite3 from 'sqlite3';
import log4js from 'log4js';
import { Watcher } from './Watcher.js';

const oai = require('oai-pmh');

export interface IListIdentifiersRunOptions {
    max_records?: number,               // The maximum of records to return
    max_records_not_deleted?: number    // The maximum of non deleted records to return
};

export class ListIdentifiersWatcher extends Watcher {
    databaseFile : string;              // The database cache file
    baseUrl : string;                   // The base URL of the repository
    options : any;                      // The OAI-PMH options
    runopts : IListIdentifiersRunOptions;

    constructor(
            logger: log4js.Logger,
            databaseFile: string, 
            baseUrl: string, 
            metadataPrefix: string, 
            options: any ,
            runopts?: IListIdentifiersRunOptions) {
        super(logger);

        this.databaseFile = databaseFile;
        this.baseUrl = baseUrl;
        this.options = options;
        this.options['metadataPrefix'] = metadataPrefix;

        if (runopts) {
            this.runopts = runopts;
        }
        else {
            this.runopts = {} as IListIdentifiersRunOptions;
        }
    }

    async watch() {
        const db = new sqlite3.Database(this.databaseFile);

        await this.create_table(db);

        try {
            const oaiPmh = new oai.OaiPmh(this.baseUrl);
            const identifierIterator = oaiPmh.listIdentifiers(this.options);

            let record_number = 0;
            let record_number_not_deleted = 0;

            for await (const identifier of identifierIterator) {

                if (this.runopts?.max_records && record_number >= this.runopts.max_records) {
                    break;
                }

                if (this.runopts?.max_records_not_deleted && record_number_not_deleted >= this.runopts.max_records_not_deleted) {
                    break;
                }

                const existingRow = await this.exists_record(db,identifier);
    
                if (identifier['$'] && identifier['$']['status']) {
                    // We are okay
                }
                else {
                    identifier['$'] = { status: 'exists'};
                }

                if (existingRow !== undefined) {
                    if (existingRow.datestamp !== identifier.datestamp) {
                        await this.update_record(db,identifier);

                        if (identifier['$'].status === 'deleted') {
                            this.emit('deleted',identifier);
                        }
                        else {
                            this.emit('update',identifier);
                            record_number_not_deleted++;
                        }

                        record_number++;
                    }
                    else {
                        this.emit('old',identifier);
                    }
                }
                else {
                    await this.insert_record(db,identifier);

                    if (identifier['$'].status === 'deleted') {
                        this.emit('deleted',identifier);
                    }
                    else {
                        this.emit('new',identifier);
                        record_number_not_deleted++;
                    }

                    record_number++;
                }
            }
        }
        catch (e: any) {
            if (e.code === "noRecordsMatch") {
                this.logger.info('no records match');
            }
            else {
                this.logger.error(e);
            }
        }

        db.close();
    }
}
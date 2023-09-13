import log4js from 'log4js';
import sqlite3 from 'sqlite3';
import { EventEmitter } from 'node:events';

export class Watcher extends EventEmitter {
    logger : log4js.Logger;

    constructor(logger: log4js.Logger) {
        super();
        this.logger = logger;
    }

    async create_table(db: sqlite3.Database) {
        this.logger.info(`(re)create table records`);

        db.run(`CREATE TABLE IF NOT EXISTS records (
            id TEXT PRIMARY KEY NOT NULL ,
            status TEXT NOT NULL ,
            datestamp TEXT 
        )`, (err) => {
            if (err) {
                this.logger.error(err);
                throw err;
            }
        });
    }

    async exists_record(db: sqlite3.Database, identifier: any) : Promise<any | undefined> {
        return new Promise( (resolve, reject) => {
            db.get("SELECT * from records where id = ?",identifier.identifier, (err,row) => {
                if (err) {
                    this.logger.info(`checking ${identifier.identifier} exists (no)`);
                    reject(undefined);
                }
                else {
                    this.logger.info(`checking ${identifier.identifier} exists (yes)`);
                    this.logger.debug(row);
                    resolve(row);
                }
            });
        });
    }

    async insert_record(db: sqlite3.Database, identifier: any) {
        let status    = 'new';

        if (identifier['$'] && identifier['$']['status']) {
            status = identifier['$']['status'];
        }

        this.logger.info(`inserting ${identifier.identifier} (${status})`);

        let stmt = db.prepare("INSERT INTO records VALUES(?, ?, ?)");
        
        let id        = identifier['identifier'];
        let datestamp = identifier['datestamp'];
    
        stmt.run(id,status,datestamp,
            (err: any) => {
                if (err) {
                    throw err
                }
            });
        stmt.finalize();
    }
    
    async update_record(db: sqlite3.Database, identifier: any) {
        let status    = 'new';

        if (identifier['$'] && identifier['$']['status']) {
            status = identifier['$']['status'];
        }

        this.logger.info(`updating ${identifier.identifier} (${status})`);

        let stmt = db.prepare("UPDATE records SET status = ? , datestamp = ? WHERE id = ?");
    
        let id        = identifier['identifier'];
        let datestamp = identifier['datestamp'];
    
        stmt.run(status,datestamp,id,
            (err: any) => {
                if (err) {
                    throw err
                }
            });
        stmt.finalize();
    }
}
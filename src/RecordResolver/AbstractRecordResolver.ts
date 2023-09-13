import { getLogger, Logger } from "log4js";

require('isomorphic-fetch');

export interface IFileType {
    id: string ,
    mediaType? : string ,
    access?: string,
    type: string[]
};

export interface IRecordType {
    id : string,
    title? : string ,
    year? : string ,
    doi? : string ,
    authors? : string[] ,
    affiliation? : string[] ,
    peer_reviewed? : boolean ,
    file? : IFileType[]
};

export abstract class AbstractRecordResolver {
    logger : Logger ;

    constructor() {
        this.logger = getLogger();
    }

    public abstract resolve(oai_id: string) : Promise<string>;

    public abstract metadata(url: string) : Promise<IRecordType | null>;

    public async contentType(url: string) : Promise<string | null> {
        return new Promise<string|null>(async (resolve,reject) => {
            try {
                const response = await fetch(url, { method: 'HEAD'});

                if (response.ok) {
                    resolve(response.headers.get("content-type"));
                }
                else {
                    reject(`failed HEAD ${url} got a ${response.status}`);
                }
            }
            catch(e) {
                reject(e);
            }
        });
    }
}
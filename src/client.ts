#!/usr/bin/env node

import log4js from 'log4js';
import { Harvester } from './Harvester.js';
import { program } from 'commander';

program.version('0.1.0')
       .argument('<baseurl>')
       .option('-c,--config <config>', 'components plugin file', './config.jsonld')
       .option('-d,--database <file>', 'database cache file', './cache.db')
       .option('-m,--metadataPrefix <prefix>', 'harvestable metadataPrefix', 'oai_dc')
       .option('-s,--setSpec <set>', 'harvestable set')
       .option('-f,--from <from>', 'harvesting offset as string')
       .option('-u,--until <until>', 'harvesting offset as string')
       .option('-t,--offset <number>', 'harvesting offset in days', parseInt)
       .option('-tt,--offset2 <number>', 'harvesting offset in days', parseInt)
       .option('-o,--outdir <directory>','output directory', './in')
       .option('--silent','do not produce output, only run the incremental harvester', false)
       .option('--max <number>','do not produce more than max number of records', parseInt)
       .option('--max-no-del <number>','do not produce more than max number of non-deleted records', parseInt)
       .option('--info','output debugging messages')
       .option('--debug','output more debugging messages')
       .option('--trace','output much more debugging messages');

program.parse(process.argv);

const opts   = program.opts();
const logger = log4js.getLogger();

if (opts.info) {
    logger.level = "info";
}

if (opts.debug) {
    logger.level = "debug";
}

if (opts.trace) {
    logger.level = "trace";
}

main();

async function main() {
    let baseUrl = program.args[0];

    let d = new Date();
    d.setDate(d.getDate() - (opts.offset || 1));
    let from = d.toISOString().replaceAll(/T.*$/g,'');

    let oai_options : any = { from : from };

    if (opts.offset2) {
        let d = new Date();
        d.setDate(d.getDate() - (opts.offset2));
        let until = d.toISOString().replaceAll(/T.*$/g,''); 

        oai_options.until = until;
    }

    if (opts.from) {
        oai_options.from = opts.from;
    }

    if (opts.until) {
        oai_options.until = opts.until;
    }

    if (opts.setSpec) {
        oai_options['set'] = opts.setSpec;
    }

    logger.info(`using oai_opts %s`, oai_options);

    const harvester = new Harvester(
                            logger,
                            opts.database,
                            baseUrl,
                            opts.metadataPrefix,
                            oai_options,
                            opts.outdir,
                            opts.config ,
                            {
                                silent: opts.silent ,
                                max_records: opts.max ,
                                max_records_not_deleted : opts.maxNoDel
                            }
                        );

    await harvester.harvest();
}
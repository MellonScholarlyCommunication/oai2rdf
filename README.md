# OAI2RDF

An [OAI-PMH](https://www.openarchives.org/pmh/) to RDF translator.

This project provides an implementation of an OAI-PMH harvester to generate RDF documents.

## Node

v16.13.0

## Install

```
yarn install
```

## Configuration

The code requires a JSON-LD configuration file with for each OAI-PMH endpoint a configuration
section.

```
{
    "@context": [
      "https://linkedsoftwaredependencies.org/bundles/npm/componentsjs/^5.0.0/components/context.jsonld",
      "https://linkedsoftwaredependencies.org/bundles/npm/oai3rdf/^0.0.0/components/context.jsonld"
    ],
    "@graph": [
      {
        "@id": "https://repository.ubn.ru.nl/oai/request",
        "@type": "GetRecordResolver",
        "baseUrl": "https://repository.ubn.ru.nl/oai/request",
        "recordUrlPrefix": "https://repository.ubn.ru.nl/handle/",
        "landingPagePrefix": "https://repository.ubn.ru.nl/handle/",
        "fileUrlPrefix": "https://repository.ubn.ru.nl//bitstream/handle"
      },
      {
        "@id": "https://pub.uni-bielefeld.de/oai",
        "@type": "GetRecordResolver",
        "baseUrl": "https://pub.uni-bielefeld.de/oai",
        "recordUrlPrefix": "oai:pub.uni-bielefeld.de:" ,
        "landingPagePrefix": "https://pub.uni-bielefeld.de/record/",
        "fileUrlPrefix": "https://pub.uni-bielefeld.de/download/"
      }
    ]
}
```

Fields:

- `@id` : the base url of the OAI-PMH endpoint
- `@type` : `GetRecordResolver`
- `baseUrl` : the base url of the OAI-PMH endpoint
- `recordUrlPrefix` : the prefix of the OAI-PMH record identifiers
- `landingPagePrefix` : the prefix of the repository landing page (we assume that the landing page of a record can be found by removing the `recordUrlPrefix` from a OAI-PMH record identifier and appending this truncated identifier to the `landingPagePrefix`)
- `fileUrlPrefix` : the prefix to recognize a full-text link in a OAI-PMH record

## Harvest

Harvest the first 10 records that are node deleted from an OAI-PMH endpoint into the `./in` directory

```
oai2rdf --info --from '2023-01-01' --until '2023-01-31' --max-no-del 10 --setSpec 'col_2066_119644' --outdir in https://repository.ubn.ru.nl/oai/request
```

To fetch all not deleted records, the command above needs to be executed multiple times until
no new records are produced.

## Sample produced RDF document

```
@prefix as: <https://www.w3.org/ns/activitystreams#>.
@prefix ietf: <http://www.iana.org/assignments/relation/>.
@prefix sorg: <https://schema.org/>.
@prefix ore: <http://www.openarchives.org/ore/terms/>.

_:n3-5 a sorg:AboutPage;
    ore:isDescribedBy <https://pub.uni-bielefeld.de/record/2982899>;
    as:summary "Robust Feature Selection and Robust Training to Cope with Hyperspectral Sensor Shifts";
    sorg:datePublished "2023";
    as:url <https://pub.uni-bielefeld.de/download/2982899/2982900>.
<https://pub.uni-bielefeld.de/download/2982899/2982900> as:mediaType "application/pdf";
    <http://purl.org/dc/terms/accessRights> "open";
    a as:Article, sorg:ScholarlyArticle.
```

## Options

##### -V | --version 

Output the version number.

##### -c | --config FILE

Specify the JSON-LD config file (default `./config.jsonld`).

##### -d | --database CACHE

Specify the cache file containing all known record identifiers (default `./cache.db`).

##### -m | --metadataPrefix PREFIX

Harvestable metadataPrefic (default `./oai_dc`)

##### -s | --setSpec SET

Harvestable set.

##### -f | --from DATE

Date offset.

##### -u | --until DATE

Date offset.

##### -t | --offset NUMBER

##### -tt | --offset2 NUMBER

Harvesting offset in number of days.

##### -o | --outdir DIRECTORY

Output directory.

##### --silent

Don't produce any output.

##### --max NUMBER

Do not produce more than NUMBER number of records.

##### --max-no-del NUMBER

Do not produce more than NUMBER number of not deleted records.

##### --info --debug --trace

Debugging flags.

## Project

This code is part of the [Mellon Scholarly Communication](https://knows.idlab.ugent.be/projects/mellon/) project.
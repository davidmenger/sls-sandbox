/*
 * @author David Menger
 */
'use strict';

const jsYaml = require('js-yaml');
const fs = require('fs');
const express = require('express');
const path = require('path');
const endpoint = require('./endpoint');

function replaceParams (pathString) {
    return pathString.replace(/\{([a-z0-9]+)\}/ig, ':$1');
}

function createEndpoint (app, funcName, fn, method, pathString) {
    app[method](`/${replaceParams(pathString)}`, endpoint(fn, funcName));
}

function extractHandler (fnPath) {
    const [file, ...fn] = fnPath.split('.');
    const fileRequire = path.posix.join('../../', file);
    const handler = module.require(fileRequire);
    return fn.reduce((res, key) => res[key], handler);
}

function yamlParser (configFile) {
    const contents = fs.readFileSync(configFile, 'utf8');
    const data = jsYaml.safeLoad(contents);

    const app = express();

    // process endpoints
    if (data.functions) {

        Object.keys(data.functions)
            .forEach((functionName) => {
                const lambda = data.functions[functionName];

                if (!Array.isArray(lambda.events)) {
                    return;
                }

                lambda.events.forEach((event) => {
                    if (!event.http) {
                        return;
                    }

                    const { http } = event;
                    const fn = extractHandler(lambda.handler);
                    createEndpoint(app, functionName, fn, http.method, http.path);
                });
            });
    }

    return app;
}

module.exports = yamlParser;

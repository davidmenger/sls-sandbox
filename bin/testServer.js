/*
 * @author David Menger
 */
'use strict';

const express = require('express');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const renderTemplates = require('../lib/renderTemplates');
const helpers = require('../lib/helpers');
const webpackConfig = require('../webpack.config');
const lambdaTester = require('../lib/lambdaTester');
const bodyParser = require('body-parser');

const distPath = path.join(__dirname, '..', 'dist');
const viewsPath = path.join(__dirname, '..', 'views');

const app = express();

if (config.environment === 'development') {
    const compiler = webpack(Object.assign(webpackConfig, {
        devtool: 'cheap-module-eval-source-map'
    }));

    app.use(webpackDevMiddleware(compiler, {
        publicPath: '/',
        stats: 'minimal'
    }));
}

app.use('/', express.static(distPath));

Object.assign(config, {
    development: true
});

fs.watch(viewsPath, { recursive: true }, (e, filename) => {
    let prom;
    if (filename.match(/^partials/)) {
        prom = renderTemplates
            .renderStaticFiles(config.statics, viewsPath, distPath, config, helpers)
            .then(() => console.log('Updated all templates')); // eslint-disable-line
    } else {
        const withoutExt = filename.replace(/\.hbs$/, '');
        const viewDef = Object.keys(config.statics)
            .map(key => config.statics[key])
            .find(def => def.view === withoutExt);

        if (!viewDef) {
            return;
        }

        prom = renderTemplates.renderStatic(viewDef, viewsPath, distPath, config, helpers)
            .then(() => console.log(`Updated template: ${viewDef.view}`)); // eslint-disable-line
    }

    prom.catch(e => console.error(e, e.stack)); // eslint-disable-line
});

const cfgFile = path.join(__dirname, '..', 'serverless.yml');

const api = lambdaTester.yamlParser(cfgFile, config.prefix);

app.use('/api', bodyParser.text({ type: 'application/json' }), api);

renderTemplates.renderStaticFiles(config.statics, viewsPath, distPath, config, helpers)
    .then(() => {
        app.listen(3000, () => {
            console.log('Example app listening on port 3000!'); // eslint-disable-line
        });
    })
    .catch((e) => {
        console.error(e, e.stack); // eslint-disable-line
        process.exit(1);
    });

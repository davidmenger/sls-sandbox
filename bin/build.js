#!/usr/bin/env node
'use strict';
/* eslint no-console: 0 */
/* eslint import/no-extraneous-dependencies: 0 */

let targetStage = 'development';

const args = process.argv.slice();

function abort (msg) {
    console.error('  %s', msg);
    process.exit(1);
}

let arg;

function required () {
    if (args.length) {
        return args.shift();
    }
    return abort(`${arg} requires an argument`);
}

// parse arguments

while (args.length) {
    arg = args.shift();
    switch (arg) {
        case '-s':
        case '--stage':
            targetStage = required();
            break;
        default:
            break;
    }
}

process.env.NODE_ENV = targetStage;

const webpack = require('webpack');
const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');
const MinifyPlugin = require('babel-minify-webpack-plugin');
const webpackConfig = require('../webpack.config');
const renderTemplates = require('../lib/renderTemplates');
const config = require('../config');
const helpers = require('../lib/helpers');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

// enable CSS compression
webpackConfig.module.rules[0].loader = ExtractTextPlugin.extract({
    fallback: 'style-loader',
    use: [
        {
            loader: 'css-loader',
            options: { minimize: false }
        },
        {
            loader: 'sass-loader',
            options: { outputStyle: 'compressed' }
        }
    ]
});

// add definer
const definer = new webpack.DefinePlugin({
    'process.env': {
        NODE_ENV: JSON.stringify('production')
    }
});
webpackConfig.plugins.push(definer);

// add babily
webpackConfig.plugins.push(new MinifyPlugin({
    evaluate: true,
    deadcode: true,
    infinity: true,
    mangle: false,
    numericLiterals: true,
    replace: true,
    simplify: false,
    mergeVars: true,
    booleans: true,
    regexpConstructors: true,
    removeUndefined: true,
    undefinedToVoid: true
}));

// add gzip
const gzip = new CompressionPlugin({
    asset: '[file].gz',
    algorithm: 'gzip',
    regExp: /\.(js|css)$/,
    threshold: 240,
    minRatio: 0.8
});
webpackConfig.plugins.push(gzip);


// returns a Compiler instance
const compiler = webpack(webpackConfig);

// setup templating

const distPath = path.join(__dirname, '..', 'dist');
const viewsPath = path.join(__dirname, '..', 'views');

console.log(`Building for stage: ${targetStage}`);

compiler.run((err) => {
    if (err) {
        console.error('Build failed', err);
        process.exit(1);
    } else {
        console.log('Build is done.');

        config.apiUrl = `${config.apiUrl || ''}`;
        config.pageUrl = `${config.pageUrl || ''}`;
        config.environment = targetStage;

        renderTemplates.renderStaticFiles(config.statics, viewsPath, distPath, config, helpers)
            .then(() => {
                console.log('Templates are rendered.');
            })
            .catch((e) => {
                console.error(e, e.stack); // eslint-disable-line
                process.exit(1);
            });
    }
});

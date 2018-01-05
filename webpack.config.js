'use strict';
/* eslint import/no-extraneous-dependencies: 0 */

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const { CommonsChunkPlugin } = webpack.optimize;

module.exports = {
    entry: {
        main: './public/main/main',
        head: './public/main/head'
        // private
        // admin: './public/admin/admin',
        // adminHead: './public/admin/adminHead',
        // adminCommons: ['babel-polyfill', 'jquery', 'js-cookie']
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].bundle.js',
        chunkFilename: '[id].chunk.js'
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.s[ca]ss$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: { minimize: false }
                        },
                        {
                            loader: 'sass-loader'
                        }
                    ]
                })
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: { minimize: false }
                        }
                    ]
                })
            },
            {
                test: /\.jsx?$/,
                // exclude just isomorph libraries
                exclude: /node_modules(\\|\/)(?!(prg-editor)(\\|\/)).*/i,
                loader: 'babel-loader',
                options: {
                    presets: [
                        'react',
                        ['env', {
                            targets: {
                                browsers: ['last 2 versions', 'safari >= 7']
                            }
                        }]
                    ],
                    cacheDirectory: true
                }
            },
            /* {
                test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                loader: 'file-loader',
                query: {
                    name: 'font/[name].[ext]',
                    publicPath: '/'
                }
            }, */
            {
                test: /\.(woff2?|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'base64-font-loader'
            },
            {
                test: /\.locale.yaml$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'locales/[path][name].json'
                        }
                    },
                    {
                        loader: 'yaml-loader'
                    }
                ]
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin({
            filename: 'styles/[name].css',
            disable: false,
            allChunks: true
        }),
        new CommonsChunkPlugin({
            name: 'adminCommons',
            filename: 'admin.commons.js',
            chunks: ['admin', 'adminHead']
        })
    ]
};

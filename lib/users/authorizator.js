/*
 * @author David Menger
 */
'use strict';

const jwt = require('jsonwebtoken');
const config = require('../../config');

function authorizator (event) {
    const headers = event.headers || {};
    const authorization = headers.authorization || headers.Authorization;

    if (!config.isProduction) {
        return Promise.resolve(authorization);
    }

    return new Promise((resolve, reject) => {
        jwt.verify(authorization, config.appSecret, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

module.exports = authorizator;

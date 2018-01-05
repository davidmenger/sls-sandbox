/*
 * @author David Menger
 */
'use strict';

const co = require('co');
const config = require('../../config');
const log = require('../log');
const { authorizator } = require('../users');

function error (message, code) {
    const err = new Error(message);
    err.status = code;
    return err;
}

error.notFound = () => error('Not found', 404);
error.forbidden = (message = 'Forbidden') => error(message, 403);

function response (data, callback, headers = null) {
    const res = {
        statusCode: 200,
        headers: { // Required for CORS support to work
            'Access-Control-Allow-Origin': config.cors,
            'Access-Control-Allow-Credentials': 'true',
            'Content-type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(data)
    };

    if (headers) {
        Object.assign(res.headers, headers);
    }

    log.sendAndClose();
    process.nextTick(() => callback(null, res));
}

function errorCallback (err, callback) {
    let e = err;

    if (Array.isArray(e)) {
        e = {
            status: e[0] && e[0].status,
            message: e.map(er => er.message)
        };
    }

    const statusCode = e.status || 500;

    if (statusCode === 500) {
        console.error(err); // eslint-disable-line no-console
    }

    if (statusCode >= 500) {
        log.error(e);
    } else {
        log.warn(e);
    }

    log.sendAndClose();

    const body = { error: e.message, code: statusCode };

    if (!config.isProduction && e.stack) {
        body.stack = e.stack;
    }

    process.nextTick(() => callback(null, {
        statusCode,
        headers: { // Required for CORS support to work
            'Access-Control-Allow-Origin': config.cors,
            'Access-Control-Allow-Credentials': 'true'
        },
        body: JSON.stringify(body)
    }));

}

function handler (fn, options = {}) {
    const wrapped = co.wrap(fn);
    return (event, context, callback) => {
        context.callbackWaitsForEmptyEventLoop = false; // eslint-disable-line no-param-reassign
        let promise;
        if (!options.unauthorized) {
            promise = authorizator(event);
        } else {
            promise = Promise.resolve();
        }
        // middlewares

        let lang = 'cz';

        if (event.headers && event.headers['Accept-Language']) {
            const lng = event.headers['Accept-Language'].match(/^[a-zA-Z]{2}/);
            switch (lng && `${lng[0]}`.toLowerCase()) {
                case 'sk':
                    lang = 'sk';
                    break;
                case 'cz':
                case 'cs':
                default:
                    lang = 'cz';
            }
        }

        Object.assign(event, { lang });

        // middlewares end
        promise.then(() => wrapped(event, context))
            .then(content => response(content, callback))
            .catch(err => errorCallback(err, callback));
    };
}

function isObjectID (input) {
    return !!`${input}`.match(/^[a-z0-9]{24}$/);
}

function collectionResponse (data, limit = null, meta = {}, map = i => i) {
    const responseData = Object.assign({
        data: [],
        count: 0,
        hasNext: limit === null
    }, meta);

    return data.reduce((res, item, index) => {
        if (limit === null || index < limit) {
            res.data.push(map(item));
            res.count++;
        } else {
            res.hasNext = true;
        }
        return res;
    }, responseData);
}

module.exports = {
    error,
    response,
    errorCallback,
    handler,
    collectionResponse,
    isObjectID
};

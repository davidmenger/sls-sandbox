/*
 * @author David Menger
 */
'use strict';

function createContext (functionName) {

    return {
        functionName,
        functionVersion: '1.0',
        invokedFunctionArn: '',
        memoryLimitInMB: 200,
        awsRequestId: Date.now(),
        identity: null,
        logGroupName: null,
        logStreamName: null,
        clientContext: {}
    };
}

function createEvent (req) {

    return {
        body: req.body,
        method: req.method,
        stage: process.env.NODE_ENV || 'development',
        headers: req.headers,
        query: req.query,
        path: req.path,
        identity: null,
        stageVariables: {},
        pathParameters: req.params
    };
}

function createCallback (res) {
    return (error, data) => {
        if (error) {
            res.status(error.statusCode || 500)
                .send(error.body || 'Server Error');
        } else {
            res.status(data.statusCode)
                .send(data.body);
        }
    };
}

function endpoint (handler, funcName) {

    return (req, res) => {
        const event = createEvent(req);
        const context = createContext(funcName);
        const callback = createCallback(res);

        handler(event, context, callback);
    };
}

module.exports = endpoint;

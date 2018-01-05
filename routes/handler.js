/*
 * @author David Menger
 */
'use strict';

const { handler } = require('../lib/handlerTools');

module.exports.hello = handler(function* () {
    return { hello: 1 };
});

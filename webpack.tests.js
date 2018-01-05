/*
 * @author David Menger
 */
'use strict';

const context = require.context('./test/public', true, /\.jsx?$/);

context.keys().forEach(context);

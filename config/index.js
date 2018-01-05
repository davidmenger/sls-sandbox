/*
 * @author David Menger
 */
'use strict';

const config = {

    isProduction: false,

    lang: 'en',

    title: {
        default: 'Okay API',
        suffix: ''
    },

    description: 'Okay Api',

    region: process.env.REGION || 'eu-central-1',

    environment: process.env.NODE_ENV || 'development',

    accountId: process.env.ACCOUNT_ID || '0',

    apiUrl: '/api',

    pageUrl: 'http://localhost:3000',

    prefix: process.env.PREFIX || '<prefix same as serverless>',

    bucket: process.env.BUCKET || null,

    appSecret: process.env.APP_SECRET || 'justdevelopmentrandomstring',

    cors: process.env.CORS || '*',

    /**
    // mongodb
    db: {
        url: 'mongodb://127.0.0.1:27017/okay-api',
        options: {
            poolSize: 5,
            connectTimeoutMS: 3000,
            socketTimeoutMS: 6000,
            autoReconnect: true,
            // loggerLevel: 'debug',
            reconnectTries: 300
        }
    },
    */

    statics: {
        index: {
            view: 'index',
            title: 'Okay API'
        },
        error: {
            view: 'error',
            title: 'Page not found'
        }
    },

    ravenUrl: process.env.RAVEN_URL || null,

    logzioToken: process.env.LOGZIO_TOKEN || null,

    gaCode: '',

    users: {
        adminGroups: ['botAdmin'],
        superGroup: 'superuser'
    },

    acl: {
        // permission: [group]
        admin: ['admin'],
        users: {
            view: ['admin'],
            edit: ['admin'],
            remove: ['admin']
        }
    },

    // group structure
    groups: {
        user: {
            admin: {}
        }
    },

    get groupList () {

        function listGroups (object) {
            const ret = [];
            Object.keys(object)
                .forEach((key) => {
                    ret.push(key);
                    ret.push(...listGroups(object[key]));
                });
            return ret;
        }

        return [
            this.users.superGroup,
            ...listGroups(this.groups)
        ];
    }
};

/**
 * [initialize description]
 *
 * @param {Object} cfg
 * @param {string} env
 */
function initialize (cfg, env = 'development') {
    try {
        const configuration = module.require(`./config.${env}`);

        // deeper object assign
        Object.keys(configuration)
            .forEach((key) => {
                if (typeof cfg[key] === 'object'
                    && typeof configuration[key] === 'object') {

                    Object.assign(cfg[key], configuration[key]);
                } else {
                    Object.assign(cfg, { [key]: configuration[key] });
                }
            });
    } catch (e) {
        /* eslint no-console: 0 */
        console.warn(`WARNING: no configuration for ENV: ${env}`);
    }

    return cfg;
}

initialize(config, process.env.NODE_ENV);

module.exports = config;


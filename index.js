'use strict';

const Hapi = require('@hapi/hapi');
const Joi = require('joi');
const hapiPgPromise = require('./plugins/hapi-pg-promise');
const Promise = require('bluebird');
const ProductsController = require('./controllers/products')
require('dotenv').config()
const pgPromisePlugin = {
    plugin: hapiPgPromise,
    options: {
        cn: `postgres://${process.env.db_user}:${process.env.db_password}@${process.env.db_host}:${process.env.db_port}/${process.env.db_name}`,
        settings: {
            promiseLib: Promise
        }
    }
};


const init = async () => {
    const server = Hapi.server({
        port: 3001,
        host: 'localhost',
        routes: {
            validate: {
              failAction: async (request, h, err) => {
                if (process.env.NODE_ENV === 'production') {
                  // In prod, log a limited error message and throw the default Bad Request error.
                  console.error('ValidationError:', err.message);
                  throw Boom.badRequest(`Invalid request payload input`);
                } else {
                  // During development, log and respond with the full error.
                  console.error(err);
                  throw err;
                }
              }
            },
            cors: {
                origin: ['http://localhost:3000'], // an array of origins or 'ignore'
            }
        }
    });
    await server.register(pgPromisePlugin);
    
    server.route({
        method: 'POST',
        path: '/api/products/import',
        handler: ProductsController.import_products,
        options: {
            validate: {
                payload: Joi.array().items(Joi.object({
                    name: Joi.string().min(1).max(250),
                    sku: Joi.string().min(5).max(250).required(),
                    image: Joi.string().min(1).max(250),
                    price: Joi.number(),
                    description: Joi.string().allow(null, ''),
                })).min(1).required()
            }
        }
    });

    server.route({
        method: 'POST',
        path: '/api/products/',
        handler: ProductsController.create_product,
        options: {
            validate: {
                payload: Joi.object({
                    name: Joi.string().min(1).max(250),
                    sku: Joi.string().min(5).max(250).required(),
                    image: Joi.string().min(1).max(250),
                    price: Joi.number(),
                    description: Joi.string().allow(null, ''),
                })
            }
        }
    });

    server.route({
        method: 'PUT',
        path: '/api/products/{id}',
        handler: ProductsController.update_product,
        options: {
            validate: {
                payload: Joi.object({
                    name: Joi.string().min(1).max(250),
                    sku: Joi.string().min(5).max(250).required(),
                    image: Joi.string().min(1).max(250),
                    price: Joi.number(),
                    description: Joi.string().allow(null, ''),
                })
            }
        }
    });

    server.route({
        method: 'DELETE',
        path: '/api/products/{id}',
        handler: ProductsController.delete_product,
    });

    server.route({
        method: 'GET',
        path: '/api/products',
        handler: ProductsController.list_product,
        options:{
            validate: {
                query: Joi.object({
                    limit: Joi.number().default(8).min(1).max(100),
                    page: Joi.number().default(1).positive()
                })
            },
        }
    });

    server.route({
        method: 'GET',
        path: '/api/products/{id}',
        handler: ProductsController.get_product,
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
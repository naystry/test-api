const handler = require('./handler');
const Joi = require('joi');

const routes = [
    {
        method: 'POST',
        path: '/register',
        options: {
            validate: {
                payload: Joi.object({
                    username: Joi.string().min(3).max(30).required(),
                    gender: Joi.string().valid('male', 'female').required(),
                    email: Joi.string().email().required(),
                    password: Joi.string().min(6).required()
                    
                })
            }
        },
        handler: handler.register
    },
    {
        method: 'POST',
        path: '/login',
        options: {
            validate: {
                payload: Joi.object({
                    username: Joi.string().required(),
                    password: Joi.string().required()
                })
            }
        },
        handler: handler.login
    },
    {
        method: 'DELETE',
        path: '/delete',
        options: {
            validate: {
                payload: Joi.object({
                    username: Joi.string().required(),
                    password: Joi.string().required()
                })
            }
        },
        handler: handler.deleteUser
    }
];

module.exports = routes;

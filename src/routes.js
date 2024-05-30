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
    },
    {
        method: 'PUT',
        path: '/edit',
        options: {
            validate: {
                payload: Joi.object({
                    username: Joi.string().required(),
                    newUsername: Joi.string().min(3).max(30).optional(),
                    newGender: Joi.string().valid('male', 'female').optional(),
                    newPassword: Joi.string().min(6).optional(),
                    newEmail: Joi.string().email().optional()
                })
            }
        },
        handler: handler.editUser
    }
];

module.exports = routes;

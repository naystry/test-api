const handler = require('./handler');
const Joi = require('joi');

const routes = [
    {
        path: '/register', // Path untuk register
        method: 'POST', // Method HTTP yang digunakan (POST untuk membuat data baru)
        handler: register // Handler untuk menangani permintaan register
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
    },
    {
        method: 'GET',
        path: '/user',
        options: {
            validate: {
                query: Joi.object({
                    username: Joi.string().required()
                })
            }
        },
        handler: handler.getUser
    }
];

module.exports = routes;

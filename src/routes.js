const { register, login, deleteUser, editUser, getUser } = require('./handler.js');
const Joi = require('joi');

const routes = [
    {
        path: '/test',
        method: 'GET',
        handler: (request, h) => {
            const response = h.response({
                status: 'success',
                message: 'testing',
            });
            response.code(200);
            return response;
        }
    },
    {
        path: '/register', // Path untuk register
        method: 'POST', // Method HTTP yang digunakan (POST untuk membuat data baru)
        handler: register 
    },
    {
        path: '/login', // Path untuk login
        method: 'POST', // Method HTTP yang digunakan (POST untuk membuat data baru)
        handler: login // Handler untuk menangani permintaan login
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
        handler: deleteUser
    },
    {
        method: 'PUT',
        path: '/editUser/{username}',
        handler: editUser
    },
    {
        path: '/users/{username}', // Path untuk mendapatkan data pengguna berdasarkan username
        method: 'GET', // Method HTTP yang digunakan (GET untuk membaca data)
        handler: getUser // Handler untuk menangani permintaan mendapatkan data pengguna
    }
];

module.exports = routes;

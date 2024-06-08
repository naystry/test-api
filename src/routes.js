const { register, login, deleteUser, editUser, getUser } = require('./handler.js');
//const Joi = require('joi');

const routes = [
    {
        method: 'GET',
        path: '/test',
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
        method: 'POST', // Method HTTP yang digunakan (POST untuk membuat data baru)
        path: '/register', // Path untuk register
        handler: register 
    },
    {
        method: 'POST', // Method HTTP yang digunakan (POST untuk membuat data baru)
        path: '/login', // Path untuk login
        handler: login // Handler untuk menangani permintaan login
    },
    {
        method: 'DELETE',
        path: '/user/{username}',
        handler: deleteUser
    },
    {
        method: 'PUT',
        path: '/editUser/{username}',
        handler: editUser
    },
    {
        method: 'GET', // Method HTTP yang digunakan (GET untuk membaca data)
        path: '/getUser/{username}', // Path untuk mendapatkan data pengguna berdasarkan username
        handler: getUser // Handler untuk menangani permintaan mendapatkan data pengguna
    }
];

module.exports = routes;

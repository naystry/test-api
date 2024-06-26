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
        path: '/updateUser/{username}',
        handler: editUser
    },
    {
        method: 'GET',
        path: '/getUser/{username}',
        handler: getUser,
    }
    // {
    //     path: '/predict',
    //     method: 'POST',
    //     handler: postPredictHandler,
    //     options: {
    //       payload: {
    
    //         allow: 'multipart/form-data',
    //         multipart: true,
    //         maxBytes: 1000000
    //       }
    //     }
    //   }
];

module.exports = routes;

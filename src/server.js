const Hapi = require('@hapi/hapi');
const routes = require('./routes.js');
//const loadModel = require('./services/loadModel');
//require('dotenv').config();


const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT,
        host: '0.0.0.0',
        routes: {
            cors: {
              origin: ['*'],
            },
        },
    });
    // const model = await loadModel();
    // server.app.model = model;
    server.route(routes);

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
});

init();

const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const { initDatabase } = require('./config');

const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    const connection = await initDatabase();
    server.app.connection = connection;

    server.route(routes);

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();

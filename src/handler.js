const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (request, h) => {
    const { username, gender, password, email } = request.payload;
    const connection = request.server.app.connection;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await connection.execute(
            'INSERT INTO users (username, gender, password, email) VALUES (?, ?, ?,?)',
            [username, gender, hashedPassword, email]
        );
        return h.response({ success: true, message: 'User registered successfully!' }).code(201);
    } catch (err) {
        return h.response({ success: false, message: 'Registration failed!' }).code(500);
    }
};

const login = async (request, h) => {
    const { username, password } = request.payload;
    const connection = request.server.app.connection;
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        if (rows.length === 0) {
            return h.response({ success: false, message: 'Invalid username or password!' }).code(401);
        }
        const user = rows[0];
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return h.response({ success: false, message: 'Invalid username or password!' }).code(401);
        }
        const token = jwt.sign({ id: user.id, username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });
        return h.response({ success: true, token }).code(200);
    } catch (err) {
        return h.response({ success: false, message: 'Login failed!' }).code(500);
    }
};

module.exports = { register, login };

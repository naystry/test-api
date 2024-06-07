const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('promise-mysql');

const createUnixSocketPool = async config => {
    return mysql.createPool({
      user: process.env.DB_USER, // e.g. 'my-db-user'
      password: process.env.DB_PASS, // e.g. 'my-db-password'
      database: process.env.DB_NAME, // e.g. 'my-database'
      socketPath: process.env.INSTANCE_UNIX_SOCKET, // e.g. '/cloudsql/project:region:instance'
    });
  };
  
  let pool;
  (async () => {
      pool = await createUnixSocketPool();
  })();

  const register = async (request, h) => {
    const { username, gender, email, password } = request.payload;
    try {
        const connection = request.server.app.connection;
        if (!connection) {
            throw new Error('Database connection is not available.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await connection.execute(
            'INSERT INTO users (username, gender, email, password) VALUES (?, ?, ?, ?)',
            [username, gender, email, hashedPassword]
        );
        return h.response({ success: true, message: 'User registered successfully!' }).code(201);
    } catch (err) {
        console.error('Error:', err);
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

const deleteUser = async (request, h) => {
    const { username, password } = request.payload;
    const connection = request.server.app.connection;
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        if (rows.length === 0) {
            return h.response({ success: false, message: 'User not found!' }).code(404);
        }
        const user = rows[0];
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return h.response({ success: false, message: 'Invalid password!' }).code(401);
        }
        await connection.execute(
            'DELETE FROM users WHERE username = ?',
            [username]
        );
        return h.response({ success: true, message: 'User deleted successfully!' }).code(200);
    } catch (err) {
        return h.response({ success: false, message: 'Deletion failed!' }).code(500);
    }
};

const editUser = async (request, h) => {
    const { username, newUsername, newGender, newPassword, newEmail } = request.payload;
    const connection = request.server.app.connection;
    try {
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        if (rows.length === 0) {
            return h.response({ success: false, message: 'User not found!' }).code(404);
        }

        const updates = {};
        if (newUsername) updates.username = newUsername;
        if (newGender) updates.gender = newGender;
        if (newPassword) updates.password = await bcrypt.hash(newPassword, 10);
        if (newEmail) updates.email = newEmail;

        const updateKeys = Object.keys(updates);
        const updateValues = Object.values(updates);

        if (updateKeys.length === 0) {
            return h.response({ success: false, message: 'No updates provided!' }).code(400);
        }

        const updateQuery = `UPDATE users SET ${updateKeys.map(key => `${key} = ?`).join(', ')} WHERE username = ?`;
        await connection.execute(
            updateQuery,
            [...updateValues, username]
        );

        return h.response({ success: true, message: 'User updated successfully!' }).code(200);
    } catch (err) {
        return h.response({ success: false, message: 'Update failed!' }).code(500);
    }
};

const getUser = async (request, h) => {
    const { username } = request.query;
    const connection = request.server.app.connection;
    try {
        const [rows] = await connection.execute(
            'SELECT username, gender, email FROM users WHERE username = ?',
            [username]
        );
        if (rows.length === 0) {
            return h.response({ success: false, message: 'User not found!' }).code(404);
        }
        const user = rows[0];
        return h.response({ success: true, user }).code(200);
    } catch (err) {
        return h.response({ success: false, message: 'Failed to fetch user data!' }).code(500);
    }
};


module.exports = { register, login, deleteUser, editUser, getUser };

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
        // Lakukan proses hashing pada password sebelum menyimpannya
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Lakukan query untuk memasukkan data pengguna baru ke dalam database
        const query = 'INSERT INTO users (username, gender, email, password) VALUES (?, ?, ?, ?)';
        const queryResult = await pool.query(query, [username, gender, email, hashedPassword]);

        // Buat respons jika registrasi berhasil
        const response = h.response({
            status: 'success',
            message: 'User berhasil terdaftar'
        });
        response.code(201); // Gunakan kode status 201 untuk registrasi berhasil
        return response;
    } catch (error) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal melakukan registrasi',
            error: error.message // Tambahkan pesan kesalahan untuk informasi lebih lanjut
        });
        response.code(500); // Gunakan kode status 500 untuk kesalahan server
        return response;
    }
};



const login = async (request, h) => {
    const { email, pass } = request.payload;

    try {
        const query = `SELECT * FROM users WHERE email = ${email}`;

        const user = await new Promise((resolve, reject) => {
            connection.query(query, [email], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows[0]);
                }
            });
        });

        if (!user) {
            const response = h.response({
                status: 'fail',
                message: 'Account invalid',
            });
            response.code(400);
            return response;
        }

        const isPassValid = await bcrypt.compare(pass, user.user_pass);

        if (!isPassValid) {
            const response = h.response({
                status: 'fail',
                message: 'Account invalid',
            });
            response.code(400);
            return response;
        }

       

        const response = h.response({
            status: 'success',
            message: 'Login successful'
           
        });
        response.code(200);
        return response;
    } catch (err) {
        const response = h.response({
            status: 'fail',
            message: err.message,
        });
        response.code(500);
        return response;
    }
};







const deleteUser = async (request, h) => {
    const { username } = request.params; // Ambil nilai username dari parameter URL
    try {
        // Lakukan query untuk menghapus data pengguna berdasarkan username
        const query = 'DELETE FROM users WHERE username = ?';
        const [result] = await pool.query(query, [username]);

        // Periksa apakah pengguna dengan username yang diberikan berhasil dihapus
        if (result.affectedRows === 0) {
            return h.response({
                status: 'fail',
                message: 'User not found'
            }).code(404);
        }

        // Jika pengguna berhasil dihapus, kembalikan respons sukses
        return h.response({
            status: 'success',
            message: 'User deleted successfully'
        }).code(200);
    } catch (error) {
        // Tangani kesalahan server
        return h.response({
            status: 'fail',
            message: 'Failed to delete user',
            error: error.message
        }).code(500);
    }
};

const editUser = async (request, h) => {
    const { username } = request.params;
    const { newUsername, newGender, newPassword, newEmail } = request.payload;

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
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

        const query = `UPDATE users SET ${updateKeys.map(key => `${key} = ?`).join(', ')} WHERE username = ?`;
        const queryParams = [...updateValues, username];
        
        await pool.query(query, queryParams);

        return h.response({ success: true, message: 'User updated successfully!' }).code(200);
    } catch (error) {
        return h.response({ success: false, message: 'Update failed!', error: error.message }).code(500);
    }
};



const getUser = async (request, h) => {
    const { username } = request.params; // Ambil nilai username dari parameter URL
    try {
        // Lakukan query untuk mendapatkan data pengguna berdasarkan username
        const query = 'SELECT username, gender, email FROM users WHERE username = ?';
        const [user] = await pool.query(query, [username]);

        // Periksa apakah pengguna dengan username yang diberikan ditemukan
        if (!user || !user.length) {
            const response = h.response({
                status: 'fail',
                message: 'Username tidak ditemukan'
            });
            response.code(404); // Gunakan kode status 404 untuk username tidak ditemukan
            return response;
        }

        // Jika username ditemukan, kembalikan data pengguna dalam respons
        const userData = {
            username: user[0].username,
            gender: user[0].gender,
            email: user[0].email
            // Jika kamu ingin menambahkan kolom-kolom lain, tambahkan di sini
        };

        const response = h.response({
            status: 'success',
            message: 'Data pengguna ditemukan',
            user: userData
        });
        response.code(200); // Gunakan kode status 200 untuk permintaan berhasil
        return response;
    } catch (error) {
        // Tangani kesalahan server
        const response = h.response({
            status: 'fail',
            message: 'Gagal mengambil data pengguna',
            error: error.message
        });
        response.code(500); // Gunakan kode status 500 untuk kesalahan server
        return response;
    }
};


module.exports = { register, login, deleteUser, editUser, getUser };

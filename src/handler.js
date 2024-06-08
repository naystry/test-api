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
    const { email, password } = request.payload;

    try {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [user] = await pool.query(query, [email]);

        if (!user) {
            console.log('User not found for email:', email); // Tambahkan ini untuk memastikan user ditemukan
            const response = h.response({
                status: 'fail',
                message: 'Account invalid',
            });
            response.code(400);
            return response;
        }

        console.log('User found:', user); // Tambahkan ini untuk memastikan user ditemukan
        console.log('Password:', password); // Tambahkan ini untuk memastikan password tidak undefined
        console.log('Hashed Password:', user.password); // Tambahkan ini untuk memastikan hashed password tidak undefined

        const isPassValid = await bcrypt.compare(password, user.password);

        if (!isPassValid) {
            console.log('Password mismatch for user:', email); // Tambahkan ini untuk memastikan password cocok
            const response = h.response({
                status: 'fail',
                message: 'Invalid password ',
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
        console.error('Error in login handler:', err);
        const response = h.response({
            status: 'fail',
            message: err.message,
        });
        response.code(500);
        return response;
    }
};


const deleteUser = async (request, h) => {
    const { username } = request.params; // Mengambil parameter userId dari URL

    try {
        // Lakukan query untuk menghapus pengguna berdasarkan ID
        const query = 'DELETE FROM users WHERE username = ?';
        const queryResult = await pool.query(query, [userId]);

        // Periksa apakah pengguna berhasil dihapus
        if (queryResult.affectedRows > 0) {
            // Jika berhasil, buat respons berhasil
            const response = h.response({
                status: 'success',
                message: 'User berhasil dihapus'
            });
            response.code(200); // Gunakan kode status 200 untuk berhasil
            return response;
        } else { 
            // Jika tidak ada pengguna yang dihapus (ID tidak ditemukan), kembalikan respons dengan kode status 404
            const response = h.response({
                status: 'fail',
                message: 'User tidak ditemukan'
            });
            response.code(404); // Gunakan kode status 404 untuk tidak ditemukan
            return response;
        }
    } catch (error) {
        // Tangani kesalahan jika terjadi
        const response = h.response({
            status: 'fail',
            message: 'Gagal menghapus user',
            error: error.message // Tambahkan pesan kesalahan untuk informasi lebih lanjut
        });
        response.code(500); // Gunakan kode status 500 untuk kesalahan server
        return response;
    }
};


const editUser = async (request, h) => {
    const { username } = request.params;
    const { newUsername, newGender, newPassword, newEmail } = request.payload;

    try {
        // Cek apakah user dengan username tersebut ada di database
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        
        if (rows.length === 0) {
            console.log('User not found:', username); // Log jika user tidak ditemukan
            return h.response({ success: false, message: 'User not found!' }).code(404);
        }

        // Menyiapkan objek update
        const updates = {};
        if (newUsername) updates.username = newUsername;
        if (newGender) updates.gender = newGender;
        if (newPassword) updates.password = await bcrypt.hash(newPassword, 10);
        if (newEmail) updates.email = newEmail;

        // Mengambil kunci dan nilai update
        const updateKeys = Object.keys(updates);
        const updateValues = Object.values(updates);

        if (updateKeys.length === 0) {
            console.log('No updates provided for user:', username); // Log jika tidak ada update yang diberikan
            return h.response({ success: false, message: 'No updates provided!' }).code(400);
        }

        // Menyusun query update
        const query = `UPDATE users SET ${updateKeys.map(key => `${key} = ?`).join(', ')} WHERE username = ?`;
        const queryParams = [...updateValues, username];
        
        console.log('Executing update query for user:', username, query, queryParams); // Log query dan parameter

        // Melakukan query update
        await pool.query(query, queryParams);

        console.log('User updated successfully:', username); // Log jika update berhasil
        return h.response({ success: true, message: 'User updated successfully!' }).code(200);
    } catch (error) {
        console.error('Error updating user:', username, error); // Log error jika terjadi kesalahan
        return h.response({ success: false, message: 'Update failed! invailid username', error: error.message }).code(500);
    }
};


const getUser = async (request, h) => {
    const { username } = request.params; // Ambil nilai username dari parameter URL

    try {
        // Lakukan query untuk mendapatkan data pengguna berdasarkan username
        const query = 'SELECT username, gender, email FROM users WHERE username = ?';
        const [user] = await pool.query(query, [username]);

        // Periksa apakah pengguna dengan username yang diberikan ditemukan
        if (!user || user.length === 0) {
            console.log('Username tidak ditemukan:', username); // Log jika username tidak ditemukan
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

        console.log('Data pengguna ditemukan:', userData); // Log data pengguna yang ditemukan
        const response = h.response({
            status: 'success',
            message: 'Data pengguna ditemukan',
            user: userData
        });
        response.code(200); // Gunakan kode status 200 untuk permintaan berhasil
        return response;
    } catch (error) {
        // Tangani kesalahan server
        console.error('Gagal mengambil data pengguna:', error); // Log jika terjadi kesalahan
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

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('promise-mysql');
//const predictClassification = require("./services/inferenceService");
// const tf = require('@tensorflow/tfjs-node');
// const path = require('path');
// const fs = require('fs');

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
            message: 'User created successfully'
        });
        response.code(201); // Gunakan kode status 201 untuk registrasi berhasil
        return response;
    } catch (error) {
        const response = h.response({
            status: 'fail',
            message: err.message
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
            //console.log('User not found for email:', email); // Tambahkan ini untuk memastikan user ditemukan
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
                message: 'Invalid password',
            });
            response.code(400);
            return response;
        }
        const response = h.response({
            status: 'success',
            message: 'Login successful!'
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


const deleteUser = async (request, h) => { //belum berhasil
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
                message: 'User deleted succsessful!'
            });
            response.code(200); // Gunakan kode status 200 untuk berhasil
            return response;
        } else { 
            // Jika tidak ada pengguna yang dihapus (ID tidak ditemukan), kembalikan respons dengan kode status 404
            const response = h.response({
                status: 'fail',
                message: 'User not found'
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
            //console.log('User not found:', username); // Log jika user tidak ditemukan
            return h.response({ status: 'fail', message: 'User not found!' }).code(404);
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
            //console.log('No updates provided for user:', username); // Log jika tidak ada update yang diberikan
            return h.response({ status: 'fail', message: 'No updates provided!' }).code(400);
        }

        // Menyusun query update
        const query = `UPDATE users SET ${updateKeys.map(key => `${key} = ?`).join(', ')} WHERE username = ?`;
        const queryParams = [...updateValues, username];
        
        //console.log('Executing update query for user:', username, query, queryParams); // Log query dan parameter

        // Melakukan query update
        await pool.query(query, queryParams);

        console.log('User updated successfully:', username); // Log jika update berhasil
        return h.response({ status: 'success', message: 'User updated successfully!' }).code(200);
    } catch (error) {
        console.error('Error updating user:', username, error); // Log error jika terjadi kesalahan
        return h.response({ status: 'fail', message: 'Invalid username', error: error.message }).code(500);
    }
};

const getUser = async (request, h) => {
    const { username } = request.params;
    try {
        // Query untuk mendapatkan data pengguna berdasarkan username
        const query = 'SELECT username, gender, email FROM users WHERE username = ?';
        const dataUser = await new Promise((resolve, reject) => {
            pool.query(query, [username], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows[0]);
                }
            });
        });

        if (!dataUser) {
            const response = h.response({
                status: 'fail',
                message: 'user is not found!',
            });
            response.code(400);
            return response;
        }
                const response = h.response({
                    status: 'success',
                    message: 'get user successful',
                    data: dataUser
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

// async function postPredictHandler(request, h) {
//     const { image } = request.payload;
//     const { model } = request.server.app;

//     const { label } = await predictClassification(model, image);

//     const id = crypto.randomUUID();
//     const createdAt = new Date().toISOString();
    
//     const data = {
//         "id": id,
//         "result": label,
//        // "suggestion": label == 'Cancer' ? 'Segera hubungi dokter' : 'None',
//         "createdAt": createdAt
//     }

//     //await storeData(id, data);

//     const response = h.response({
//         status: 'success',
//         message: 'Model is predicted successfully',
//         data
//     })
//     response.code(201);
//     return response;
// }
// let classificationModel;
// let recommendationModel;
// const skinToneModelURL = 'https://storage.googleapis.com/skintone-ml/model_klasifikasi.json'; // Ganti dengan URL publik
// const recommendationModelURL = 'https://storage.googleapis.com/skintone-ml/model_rekomendasi.json'; // Ganti dengan URL publik
// const loadModels = async () => {
//     classificationModel = await tf.loadLayersModel(skinToneModelURL);
//     recommendationModel = await tf.loadLayersModel(recommendationModelURL);
// };

// loadModels();

// const classifySkintone = async (request, h) => {
//     const { image } = request.payload;
//     const tensor = tf.node.decodeImage(Buffer.from(image, 'base64'));
//     const prediction = classificationModel.predict(tensor.expandDims(0));
//     const classIndex = prediction.argMax(-1).dataSync()[0];

//     //await pool.query('INSERT INTO classifications (image, class_index) VALUES (?, ?)', [image, classIndex]);

//     return h.response({ classIndex }).code(200);
// };

// const recommendPalette = async (request, h) => {
//     const { classIndex } = request.payload;
//     const inputTensor = tf.tensor([[classIndex]]);
//     const recommendation = recommendationModel.predict(inputTensor);
//     const colors = recommendation.dataSync();

//     //await pool.query('INSERT INTO recommendations (class_index, colors) VALUES (?, ?)', [classIndex, JSON.stringify(colors)]);

//     return h.response({ colors }).code(200);
// };



module.exports = { register, login, deleteUser, editUser, getUser}; //deleteUser belum di eksekusi

// const tf = require('@tensorflow/tfjs-node');
// //const InputError = require('../exceptions/InputError');
 
// async function predictClassification(model, image) {
//     try {
//         const tensor = tf.node
//             .decodeJpeg(image)
//             .resizeNearestNeighbor([224, 224])
//             .expandDims()
//             .toFloat() 

//         const prediction = model.predict(tensor);
//         const probabilities = await prediction.data();
//         const classes = ['dark','light','mid-dark','mid-light']; //ganti classes sesuai class MD
    
//         // Menentukan kelas dengan probabilitas tertinggi
//         const predictedClassIndex = probabilities[0] > 0.5 ? 0 : 1;
//         const label = classes[predictedClassIndex];

//         return { label };        
//     } catch (error) {
        
//     }
// }

// module.exports = predictClassification;
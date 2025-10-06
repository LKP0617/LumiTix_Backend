// const firebaseAdmin = require('firebase-admin');
const cloudinary = require('cloudinary').v2;
const config = require('../config/index')

// let firebaseApp = null;
// let isFirebaseEnabled = false;
// let bucket = null

// 取環境設定（避免直接 JSON.parse 出錯）
// let serviceAccount = null;
// try {
//   serviceAccount = config.get('secret.firebase.serviceAccount');
// } catch (err) {
//   console.warn('沒有設定Firebase serviceAccount');
// }

// const storageBucket = config.get('secret.firebase.storageBucket');

// if (serviceAccount && storageBucket) {
//   firebaseAdmin.initializeApp({
//     credential: firebaseAdmin.credential.cert(serviceAccount),
//     storageBucket,
//   });
//   bucket = firebaseAdmin.storage().bucket()
//   isFirebaseEnabled = true;
//   console.info('Firebase Admin已初始化');
// } else {
//   console.warn('Firebase Admin未初始化，確認環境變數');
// }

// module.exports = {
//   firebaseAdmin,
//   bucket,
//   isFirebaseEnabled,
// };

let isCloudinaryEnabled = false;

try {
  const cloudConfig = config.get('secret.cloudinary');

  if (cloudConfig && cloudConfig.cloud_name) {
    cloudinary.config({
      cloud_name: cloudConfig.cloud_name,
      api_key: cloudConfig.api_key,
      api_secret: cloudConfig.api_secret,
    });
    isCloudinaryEnabled = true;
    console.info('✅ Cloudinary 已初始化');
  } else {
    console.warn('⚠️ Cloudinary 未設定完整環境變數');
  }
} catch (err) {
  console.warn('⚠️ Cloudinary 初始化失敗：', err.message);
}

module.exports = {
  cloudinary,
  isCloudinaryEnabled,
};
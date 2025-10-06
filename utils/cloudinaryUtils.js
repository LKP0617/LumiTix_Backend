// const firebaseAdmin = require('firebase-admin');
const cloudinary = require('cloudinary').v2;
const config = require('../config/index')

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
// let serviceAccount = null;
// try {
//   if (process.env.FIREBASE_SERVICE_ACCOUNT) {
//     serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
//   }
// } catch (err) {
//   console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT 解析失敗，請確認格式正確');
// }

// module.exports = {
//   jwtSecret: process.env.JWT_SECRET || 'default-secret',
//   jwtExpiresDay: process.env.JWT_EXPIRES_DAY || '7d',
//   firebase: {
//     serviceAccount,
//     storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
//   }
// }

let serviceAccount = null;

try {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    serviceAccount = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    };
  }
} catch (err) {
  console.warn('⚠️ Cloudinary 環境變數設定錯誤，請確認 .env 格式');
}

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'default-secret',
  jwtExpiresDay: process.env.JWT_EXPIRES_DAY || '7d',
  cloudinary: serviceAccount,
};
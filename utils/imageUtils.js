
const path = require('path')
const logger = require('./logger')('imageUtils')
const appError = require('./appError')
const formidable = require('formidable')
const formidableErrors = require('formidable').errors;
const { imageSize } = require('image-size');
const fs = require('fs');
const { cloudinary, isCloudinaryEnabled } = require('./cloudinaryUtils');
// const { firebaseAdmin, bucket, isFirebaseEnabled } = require('./firebaseUtils')

const TEMP_FOLDER_NAME = 'temp'
const ERROR_STATUS_CODE = 400;
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = {
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true
}
const { IMAGE_TYPES } = require('../enums/index');

const checkImage = async (req, res, next) => {
    const form = formidable.formidable({
        multiple: false,
        maxFileSize: MAX_FILE_SIZE,
        filter: ({ mimetype }) => {
            return !!ALLOWED_FILE_TYPES[mimetype]
        }
    })

    let fields;
    let files;
    try {
        [fields, files] = await form.parse(req)
        if (!files?.image || !Array.isArray(files.image) || !files.image[0]?.filepath) {
            logger.warn('[checkImageFile] 上傳欄位填寫錯誤')
            return next(appError(ERROR_STATUS_CODE, '欄位填寫錯誤'));
        }
    } catch (error) {
        if (error.code === formidableErrors.biggerThanMaxFileSize) {
            logger.warn('[checkImageFile] 檔案大小超過限制5mb')
            next(appError(ERROR_STATUS_CODE, '檔案大小超過限制5mb'))
        }
        console.log(`[checkImageFile] ${error.message}`)
        next(appError(ERROR_STATUS_CODE, '欄位填寫錯誤'))
    }

    const reqImgType = fields.type?.[0] ? IMAGE_TYPES[fields.type[0].toUpperCase()] : null
    if (!reqImgType) {
        logger.warn('[checkImageFile] 上傳欄位填寫錯誤')
        next(appError(ERROR_STATUS_CODE, '欄位填寫錯誤'))
        return;
    }

    const imgBuffer = fs.readFileSync(files.image[0].filepath);
    const dimensions = imageSize(imgBuffer);
    //若為直式圖片回傳錯誤
    if (fields.type?.[0] === IMAGE_TYPES.COVER && dimensions.width < dimensions.height) {
        console.log(`[checkImageFile] 僅限上傳橫式圖片:高=${dimensions.height},寬=${dimensions.width}`)
        next(appError(ERROR_STATUS_CODE, '僅限上傳橫式圖片'))
    }

    req.imgType = reqImgType
    req.imgFile = files.image[0]
    next()
}

// const uploadImage = async (req) => {
//     try {
//         const userSerial = req.user.serialNo
//         const timestamp = new Date().toISOString()
//         const imgType = req.imgType
//         const ext = path.extname(req.imgFile.originalFilename); // 會包含 .，例如 .jpg、.png

//         const filename = `${imgType}-${timestamp}-${userSerial}${ext}`
//         const filePath = req.imgFile.filepath

//         const remoteTempPath = `${TEMP_FOLDER_NAME}/${filename}`

//         // 上傳到 Firebase Storage
//         await bucket.upload(filePath, { destination: remoteTempPath })

//         const [imageUrl] = await bucket.file(remoteTempPath).getSignedUrl({
//             action: 'read',
//             expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 暫存版-7天有效
//         })

//         return imageUrl
//     } catch (error) {
//         logger.error(`[uploadImage] ${error.message}`)
//         throw appError(ERROR_STATUS_CODE, '上傳圖片失敗')
//     }
// }

// 上傳圖片到 Cloudinary
const uploadImage = async (req) => {
    if (!isCloudinaryEnabled) throw appError(500, 'Cloudinary 未初始化');

    try {
        const userSerial = req.user.serialNo;
        const timestamp = new Date().toISOString();
        const imgType = req.imgType;
        const ext = path.extname(req.imgFile.originalFilename); // 會包含 .，例如 .jpg、.png

        const filename = `${imgType}-${timestamp}-${userSerial}${ext}`;
        const filePath = req.imgFile.filepath;

        // 🔹 上傳到 Cloudinary
        const result = await cloudinary.uploader.upload(filePath, {
            folder: `LumiTix/${imgType}`,
            public_id: filename,
            resource_type: 'image',
        });

        return result.secure_url;
    } catch (error) {
        logger.error(`[uploadImage] ${error.message}`);
        throw appError(ERROR_STATUS_CODE, '上傳圖片失敗');
    }
};

// const moveFinalImage = async (imgUrl, eventId) => {
//     try {
//         const filename = extractFilenameFromUrl(imgUrl); // 從 URL 中提取檔名
//         const tempPath = `${TEMP_FOLDER_NAME}/${filename}`;
//         const remoteFinalPath = `activities/${eventId}/${filename}`;

//         // 移動 Storage 圖片
//         await bucket.file(tempPath).move(remoteFinalPath)

//         // 取得新的圖片 URL
//         const [imageUrl] = await bucket.file(remoteFinalPath).getSignedUrl({
//             action: 'read',
//             expires: Date.now() + 1000 * 60 * 60 * 24 * 180, // 正式:180 天有效
//         })

//         return imageUrl
//     } catch (error) {
//         throw appError(ERROR_STATUS_CODE, '移動圖片失敗')
//     }
// }

// Cloudinary 不需要「移動檔案」，但可模擬命名規則
const moveFinalImage = async (imgUrl, eventId) => {
    try {
        // Cloudinary 的圖片可以用 URL 直接存入資料庫
        return imgUrl;
    } catch (error) {
        throw appError(ERROR_STATUS_CODE, '移動圖片失敗');
    }
};


//從 URL中提取檔名的函式
const extractFilenameFromUrl = (imgUrl) => {
    try {
        const url = new URL(imgUrl);
        const pathname = decodeURIComponent(url.pathname);
        const segments = pathname.split('/');
        return segments[segments.length - 1]; // 取得檔名
    } catch (err) {
        throw new Error('錯誤的圖片網址');
    }
}

//取得所有照片
// const getAllImages = async () => {
//     // 取得檔案列表
//     const [files] = await bucket.getFiles({ prefix: 'imagesTest/' })
//     // const imageList = files.map(file => file.name)

//     // 設定檔案的存取權限
//     const config = {
//         action: 'read',
//         expires: Date.now() + 24 * 60 * 60 * 1000, // 1 天後過
//     };

//     // 取得圖片名稱與下載連結
//     const imageList = await Promise.all(
//         files.map(async file => ({
//             name: file.name,
//             url: (await file.getSignedUrl(config))[0],
//         }))
//     );

//     return imageList
// }

module.exports = {
    checkImage,
    uploadImage,
    moveFinalImage
}
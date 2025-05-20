import upload from "./upload.js";
import { uploadToS3 } from "../utils/s3.js";
import { MAX_PRODUCT_IMAGES } from "../constants/limits.js";

// 여러 장 이미지 업로드 및 S3 저장 미들웨어
export const s3ImageUpload = [
  upload.array("images", MAX_PRODUCT_IMAGES), // 최대 5장
  async (req, res, next) => {
    try {
      const imageUrls = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const url = await uploadToS3(file);
          imageUrls.push(url);
        }
      }
      req.body.imageUrls = imageUrls;
      next();
    } catch (err) {
      next(err);
    }
  }
];

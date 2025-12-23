import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "../utils/s3Client.js";

const bucketName = "media";

export const upload = multer({
    storage: multerS3({
        s3,
        bucket: bucketName,
        acl: "public-read",
        key: (req, file, cb) => {
            const fileName = `${Date.now()}_${file.originalname}`;
            cb(null, fileName);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        }
    })
});

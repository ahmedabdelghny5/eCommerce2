import multer from "multer";

export const multerValidation = {
    image: ['image/png','image/gif', 'image/jpeg'],
    pdf: ['application/pdf']
}

export function myMulterCloud(customValidation) {
    if (!customValidation) {
        customValidation = customValidation.image
    }
    const storage = multer.diskStorage({})
    function fileFilter(req, file, cb) {
        if (customValidation.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb('invalid format', false)
        }
    }
    const upload = multer({ dest: "upload", fileFilter, storage })
    return upload
}


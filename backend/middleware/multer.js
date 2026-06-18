import multer from "multer";

// set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// initialize upload 
const upload = multer({
    storage:storage,
}).fields([
    { name: "frontImage", maxCount: 1 },
    { name: "audioFile", maxCount: 1 },
]);

export default upload;
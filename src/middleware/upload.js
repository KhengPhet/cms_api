import multer from "multer";
import fs from "fs";

const basePath = "uploads";
const postPath = "uploads/posts";

if (!fs.existsSync(basePath)) {
  fs.mkdirSync(basePath);
}
if (!fs.existsSync(postPath)) {
  fs.mkdirSync(postPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isPostUpload = req.baseUrl.includes("/posts");
    const dest = isPostUpload ? postPath : basePath;
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

export default upload;

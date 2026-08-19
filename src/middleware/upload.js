// import multer from "multer";
// import fs from "fs";

// const uploadPath = "uploads";

// // auto create folder
// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath);
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage });

// export default upload;


import multer from "multer";
import fs from "fs";

// folders
const basePath = "uploads";
const postPath = "uploads/posts";

// create folders if not exist
if (!fs.existsSync(basePath)) {
  fs.mkdirSync(basePath);
}
if (!fs.existsSync(postPath)) {
  fs.mkdirSync(postPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, postPath); // ✅ always uploads/posts
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

export default upload;
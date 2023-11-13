const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Make sure the uploads folder exists
const uploadPath = "public/uploads/";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Define storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Use path.extname to get the extension
  },
});

// Define allowed file types
const allowedImageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const allowedAudioTypes = ["audio/mpeg", "audio/wav", "audio/mp3"]; // 'audio/mpeg' is for .mp3 files

// Update fileFilter function to check based on the fieldname
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "image" && allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else if (
    file.fieldname === "audio" &&
    allowedAudioTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type."));
  }
};

// Multer upload using fields
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 100 }, // 100MB file limit
  fileFilter: fileFilter,
});

module.exports = {
  uploadSingle: (fieldName) => upload.single(fieldName),
  uploadFields: (fields) => upload.fields(fields),
};

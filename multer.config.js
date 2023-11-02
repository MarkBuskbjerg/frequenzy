const multer = require('multer');

// Make sure the uploads folder exists
const fs = require('fs');
const uploadPath = 'public/uploads/';

if (!fs.existsSync(uploadPath)) {
	fs.mkdirSync(uploadPath, { recursive: true });
}

// Set up file upload handling with Multer
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/uploads/'); // Ensure this directory exists
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + '-' + file.originalname);
	},
});

const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const fileFilter = (req, file, cb) => {
	if (allowedFileTypes.includes(file.mimetype)) {
		cb(null, true); // We accept the file
	} else {
		console.log('Rejected file:', file.originalname, 'Type:', file.mimetype);
		cb(null, false); // We reject the file
		cb(new Error('Invalid filetype. Only jpeg, jpg, png and webp are allowed'));
	}
};

const upload = multer({ storage: storage, limits: { fileSize: 1024 * 1024 * 5 /* 5MB file limit */ }, fileFilter: fileFilter });

module.exports = upload;

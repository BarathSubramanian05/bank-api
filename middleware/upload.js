import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "/uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

function fileFilter(req, file, cb) {
  const allowed = ["image/png", "image/jpeg"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only PNG/JPEG allowed"), false);
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 },
});

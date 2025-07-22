import multer from "multer";
import path from "path";

// Multipart form data --> not json data receive, we also recieve image
// Multer Setup (Where file store, what is the name of file , what is the path of file)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random() * 1e9}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueName);
  },
});

// get special method from multer
const handleMultipartData = multer({
  storage,
  limits: { fileSize: 1000000 * 100 }, // 5mb
}).fields([
  { name: "image", maxCount: 1 }, // "image" is the field name for the image file.
  { name: "pdf", maxCount: 1 }, // "pdf" is the field name for the PDF file.
]);


export default handleMultipartData;
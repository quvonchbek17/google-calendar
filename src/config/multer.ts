import { Request } from "express";
import multer from "multer"
import path from "path"
import { v4 } from "uuid"

// Define storage configuration
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: any) => {
    cb(null, path.join(process.cwd(), "uploads")); // Uploads directory
  },
  filename: (req, file, cb) => {
    file.fieldname = v4() + "." + file.originalname.split(".").at(-1)
    cb(null, `${file.fieldname}`); // Unique filename
  },
});

// Initialize multer with storage configuration
const upload = multer({ storage });

export { upload }
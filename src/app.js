import express from "express";
import connect from "./database/mongo.js";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { PostInfo } from "./controllers/project-controller.js";
import multer from "multer";
import streamifier from "streamifier";
import cloudinary from "cloudinary";
import { PostStartupInfo } from "./controllers/startup-controller.js";
import { PostHelpInfo } from "./controllers/help-controller.js";

dotenv.config();
connect();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Configuration (store files in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload Buffer to Cloudinary Function
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream((error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url); // Get the Cloudinary URL
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Route to Handle File Uploads


app.get("/", (req, res) => {
  return res.status(200).json({ message: "app works!" });
});

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

// Handle form submissions with file uploads
app.post(
  "/post",
  upload.fields([{ name: "additionalMedia" }, { name: "resume" }]),
  PostInfo
);

app.post(
  "/startup",
  upload.fields([{ name: "projectPresentation" }]),
  PostStartupInfo
);

app.post("/help", upload.single("additionalHelpMedia"), async (req, res) => {
  try {
    let fileUrl = null;
    
    if (req.file) {
      fileUrl = await uploadToCloudinary(req.file.buffer); // Upload file to Cloudinary
    }

    const formData = {
      tellUsHelp: req.body.tellUsHelp,
      additionalHelpMedia: fileUrl, // Store Cloudinary file URL
    };

    // Call your controller to handle DB storage
    const response = await PostHelpInfo(formData);
    
    res.status(201).json({ message: "Form submitted successfully!", fileUrl });
  } catch (error) {
    console.error("❌ Error uploading file:", error);
    res.status(500).json({ message: "Upload failed" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

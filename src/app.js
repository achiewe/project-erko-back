import express from "express";
import connect from "./database/mongo.js";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { PostInfo } from "./controllers/project-controller.js";
import multer from "multer";
import { PostStartupInfo } from "./controllers/startup-controller.js";
import { PostHelpInfo } from "./controllers/help-controller.js";

dotenv.config();
connect();

const app = express();
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", process.env.CORS_METHODS || "GET,POST,PUT,DELETE");
  res.header("Access-Control-Allow-Headers", process.env.CORS_HEADERS || "Content-Type,Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  next();
});
console.log("🚀 CORS ORIGIN:", process.env.CORS_ORIGIN);
console.log("🚀 CORS METHODS:", process.env.CORS_METHODS);
console.log("🚀 CORS HEADERS:", process.env.CORS_HEADERS);
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

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

app.post(
  "/help",
  upload.fields([{ name: "additionalHelpMedia" }]),
  PostHelpInfo
);

app.listen(process.env.PORT || 4000);

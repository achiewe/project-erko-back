import express from "express";
import connect from "./database/mongo.js";
import dotenv from "dotenv";
import cors from "cors";
import { PostInfo } from "./controllers/project-controller.js";
import multer from "multer";

dotenv.config();
connect();

const app = express();

app.use(cors());
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

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});

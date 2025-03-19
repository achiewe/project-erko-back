import FormSubmission from "../models/formSubmission.js";
import nodemailer from "nodemailer";
import cloudinary from "cloudinary";
import streamifier from "streamifier";

// Cloudinary Configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload files to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      { folder: "job_submissions" }, // Organize in a folder
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url); // Return file URL
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// comment
export const PostInfo = async (req, res) => {
  try {
    const { name, email, phone, telegram, instagram, about, resonate } = req.body;
    const privacy = req.body.privacy === "true"; // Convert string to boolean

    let additionalMediaUrl = null;
    let resumeUrl = null;

    let additionalMediaBuffer = null;
    let additionalMediaName = null;
    let resumeBuffer = null;
    let resumeName = null;

    // If additional media file exists, store its buffer and name
    if (req.files?.additionalMedia) {
      const file = req.files.additionalMedia[0];
      additionalMediaBuffer = file.buffer;
      additionalMediaName = file.originalname;
      additionalMediaUrl = await uploadToCloudinary(file.buffer);
    }

    // If resume file exists, store its buffer and name
    if (req.files?.resume) {
      const file = req.files.resume[0];
      resumeBuffer = file.buffer;
      resumeName = file.originalname;
      resumeUrl = await uploadToCloudinary(file.buffer);
    }

    // Save to MongoDB
    const newSubmission = new FormSubmission({
      name,
      email,
      phone,
      telegram,
      instagram,
      about,
      resonate,
      privacy,
      additionalMedia: additionalMediaUrl,
      resume: resumeUrl,
    });

    await newSubmission.save();

    // Pass file buffers and names to email function
    await sendEmailNotification(newSubmission, additionalMediaBuffer, additionalMediaName, resumeBuffer, resumeName);

    res.status(201).json({ message: "Form submitted successfully!", additionalMediaUrl, resumeUrl });
  } catch (error) {
    console.error("❌ Error processing form:", error);
    res.status(500).json({ message: "Info cannot be posted" });
  }
};

// Send Email Notification
const sendEmailNotification = async (userInfo, additionalMediaBuffer, additionalMediaName, resumeBuffer, resumeName) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

     // Get emails from .env
     const recipients = [process.env.EMAIL_TO1, process.env.EMAIL_TO2];
     
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipients,
      subject: "New Form Submission",
      text: `A new form has been submitted:
        - Name: ${userInfo.name}
        - Email: ${userInfo.email}
        - Phone: ${userInfo.phone}
        - Telegram: ${userInfo.telegram}
        - Instagram: ${userInfo.instagram}
        - About: ${userInfo.about}
        - Resonate: ${userInfo.resonate}
        - Privacy: ${userInfo.privacy}`,
      attachments: [],
    };

    // Attach additional media file if present
    if (additionalMediaBuffer) {
      mailOptions.attachments.push({
        filename: additionalMediaName || "additionalMedia",
        content: additionalMediaBuffer,
      });
    }

    // Attach resume file if present
    if (resumeBuffer) {
      mailOptions.attachments.push({
        filename: resumeName || "resume.pdf",
        content: resumeBuffer,
      });
    }

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully with attachments!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};


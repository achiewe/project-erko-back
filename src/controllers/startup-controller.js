import StartupFormSubmission from "../models/startupFormSubmission.js";
import nodemailer from "nodemailer";
import cloudinary from "cloudinary";
import streamifier from "streamifier";

// Cloudinary Configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload function
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      { folder: "startup_submissions" }, // Organize in a folder
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const PostStartupInfo = async (req, res) => {
  try {
    const { fullName, email, phone, country, aboutYourStartup, whyYou } = req.body;
    
    let projectPresentationUrl = null;
    let fileBuffer = null;
    let fileName = null;

    if (req.files?.projectPresentation) {
      const file = req.files.projectPresentation[0];
      fileBuffer = file.buffer;
      fileName = file.originalname;
      projectPresentationUrl = await uploadToCloudinary(fileBuffer);
    }

    // Save to MongoDB
    const newSubmission = new StartupFormSubmission({
      fullName,
      email,
      phone,
      country,
      aboutYourStartup,
      whyYou,
      projectPresentation: projectPresentationUrl,
    });

    await newSubmission.save();

    // Pass file buffer and name to email function
    await sendStartupEmailNotification(newSubmission, fileBuffer, fileName);

    res.status(201).json({ message: "Form submitted successfully!", projectPresentationUrl });
  } catch (error) {
    console.error("❌ Error processing startup form:", error);
    res.status(500).json({ message: "Info cannot be posted" });
  }
};


// Send Email Notification
const sendStartupEmailNotification = async (userInfo, fileBuffer, fileName) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: "New Startup Form Submission",
      text: `A new Startup form has been submitted:
        - Name: ${userInfo.fullName}
        - Email: ${userInfo.email}
        - Phone: ${userInfo.phone}
        - Country: ${userInfo.country}
        - About: ${userInfo.aboutYourStartup}
        - Why You: ${userInfo.whyYou}`,
      attachments: fileBuffer
        ? [
            {
              filename: fileName || "projectPresentation.pdf", // Set default name if missing
              content: fileBuffer, // Attach the actual file content
            },
          ]
        : [],
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully with attachment!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

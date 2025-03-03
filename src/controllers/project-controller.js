import FormSubmission from "../models/formSubmission.js";
import nodemailer from "nodemailer";

export const PostInfo = async (req, res) => {
  try {
    const { name, email, phone, telegram, instagram, about, resonate } =
      req.body;

    const privacy = req.body.privacy === "true"; // Convert string to boolean

    const additionalMedia = req.files?.additionalMedia
      ? req.files.additionalMedia[0].path
      : null;
    const resume = req.files?.resume ? req.files.resume[0].path : null;

    // Save the form submission to MongoDB
    const newSubmission = new FormSubmission({
      name,
      email,
      phone,
      telegram,
      instagram,
      about,
      resonate,
      privacy,
      additionalMedia,
      resume,
    });

    await newSubmission.save();

    await sendEmailNotification(newSubmission);

    res.status(201).json({ message: "Form submitted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Info cannot be posted" });
  }
};

// Email notification function
const sendEmailNotification = async (userInfo) => {
  try {
    // 1️⃣ Create a transporter to send the email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password
      },
    });

    // 2️⃣ Prepare email content
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender email
      to: process.env.EMAIL_TO, // Receiver email
      subject: "New Form Submission", // Email subject
      text: `A new form has been submitted by: 
      Name: ${userInfo.name} 
      Email: ${userInfo.email} 
      Phone: ${userInfo.phone} 
      Telegram: ${userInfo.telegram} 
      Instagram: ${userInfo.instagram} 
      About: ${userInfo.about} 
      Do you resonate with Erkos aesthetics?: ${userInfo.resonate} 
      Privacy: ${userInfo.privacy}`,
      attachments: [], // Empty array for attachments
    };

    // 3️⃣ Check if `additionalMedia` exists, then attach it
    if (userInfo.additionalMedia) {
      mailOptions.attachments.push({
        filename: userInfo.additionalMedia.split("/").pop(), // Extract file name
        path: userInfo.additionalMedia, // File path
      });
    }

    // 4️⃣ Check if `resume` exists, then attach it
    if (userInfo.resume) {
      mailOptions.attachments.push({
        filename: userInfo.resume.split("/").pop(), // Extract file name
        path: userInfo.resume, // File path
      });
    }

    // 5️⃣ Send the email with the attachments
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully with attachments!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

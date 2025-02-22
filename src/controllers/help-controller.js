import HelpFormSubmission from "../models/helpFormSubmission.js";
import nodemailer from "nodemailer";

export const PostHelpInfo = async (req, res) => {
  try {
    const { tellUsHelp } = req.body;
    const additionalHelpMedia = req.files?.additionalHelpMedia
      ? req.files.additionalHelpMedia[0].path
      : null; // Handle file if it exists

    // Save the form submission to MongoDB
    const newSubmission = new HelpFormSubmission({
      tellUsHelp,
      additionalHelpMedia,
    });

    await newSubmission.save();

    await sendHelpEmailNotification(newSubmission);

    res.status(201).json({ message: "Form submitted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Info cannot be posted" });
  }
};

// Email notification function
const sendHelpEmailNotification = async (userInfo) => {
  try {
    // Create a transporter to send the email
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
      subject: "New Help Form Submission",
      text: `A new Help form has been submitted with the following details: 
         Description of help requested: ${userInfo.tellUsHelp}`,
      attachments: [],
    };

    if (userInfo.additionalHelpMedia) {
      mailOptions.attachments.push({
        filename: userInfo.additionalHelpMedia.split("/").pop(),
        path: userInfo.additionalHelpMedia,
      });
    }

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully with attachments!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

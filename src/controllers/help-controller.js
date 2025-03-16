import HelpFormSubmission from "../models/helpFormSubmission.js";
import nodemailer from "nodemailer";

export const PostHelpInfo = async (formData) => {
  try {
    const newSubmission = new HelpFormSubmission({
      tellUsHelp: formData.tellUsHelp,
      additionalHelpMedia: formData.additionalHelpMedia, // Store Cloudinary URL
    });

    await newSubmission.save();
    await sendHelpEmailNotification(newSubmission);

    return { message: "Form submitted successfully!" };
  } catch (error) {
    console.error("❌ Error saving form data:", error);
    throw new Error("Info cannot be posted");
  }
};

// Email notification function
const sendHelpEmailNotification = async (userInfo) => {
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
      subject: "New Help Form Submission",
      text: `A new Help form has been submitted:
        - Description: ${userInfo.tellUsHelp}
        - File: ${userInfo.additionalHelpMedia}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

import HelpFormSubmission from "../models/helpFormSubmission.js";
import nodemailer from "nodemailer";

export const PostHelpInfo = async (formData, file) => {
  try {
    const newSubmission = new HelpFormSubmission({
      tellUsHelp: formData.tellUsHelp,
      additionalHelpMedia: formData.additionalHelpMedia, // Store Cloudinary URL
    });

    await newSubmission.save();

    // Pass file details to email function
    await sendHelpEmailNotification(newSubmission, file);

    return { message: "Form submitted successfully!" };
  } catch (error) {
    console.error("❌ Error saving form data:", error);
    throw new Error("Info cannot be posted");
  }
};

// Email notification function
const sendHelpEmailNotification = async (userInfo, file) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Define the email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: "New Help Form Submission",
      text: `A new Help form has been submitted:
        - Description: ${userInfo.tellUsHelp}`,
      attachments: file
        ? [
            {
              filename: file.originalname, // Keep original file name
              content: file.buffer, // Attach the file content
            },
          ]
        : [], // If no file, do not attach anything
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully with attachment!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};


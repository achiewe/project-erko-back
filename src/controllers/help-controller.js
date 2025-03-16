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

    // Create email body with a clickable link
    let emailBody = `
      A new Help form has been submitted:\n
      - Description: ${userInfo.tellUsHelp}\n
    `;

    const attachments = [];

    // If there is an uploaded file, add a link or attach it
    if (userInfo.additionalHelpMedia) {
      emailBody += `- File: <a href="${userInfo.additionalHelpMedia}" target="_blank">Download File</a>\n`;

      // Attach file for direct download
      attachments.push({
        filename: userInfo.additionalHelpMedia.split("/").pop(), // Extract filename from URL
        path: userInfo.additionalHelpMedia, // Cloudinary URL
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: "New Help Form Submission",
      html: emailBody, // Use HTML format for clickable links
      attachments,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully with attachments!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};
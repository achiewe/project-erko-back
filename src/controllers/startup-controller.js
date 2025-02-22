import StartupFormSubmission from "../models/startupFormSubmission.js";
import nodemailer from "nodemailer";

export const PostStartupInfo = async (req, res) => {
  try {
    const { fullName, email, phone, country, aboutYourStartup, whyYou } =
      req.body;
    const projectPresentation = req.files?.projectPresentation
      ? req.files.projectPresentation[0].path
      : null; // Handle file if it exists

    // Save the form submission to MongoDB
    const newSubmission = new StartupFormSubmission({
      fullName,
      email,
      phone,
      country,
      aboutYourStartup,
      whyYou,
      projectPresentation,
    });

    await newSubmission.save();

    await sendStartupEmailNotification(newSubmission);

    res.status(201).json({ message: "Form submitted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Info cannot be posted" });
  }
};

// Email notification function
const sendStartupEmailNotification = async (userInfo) => {
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
      subject: "New Startup Form Submission",
      text: `A new Startup form has been submitted by: 
        Name: ${userInfo.fullName} 
        Email: ${userInfo.email} 
        Phone: ${userInfo.phone} 
        Country: ${userInfo.country} 
        About: ${userInfo.aboutYourStartup} 
        Why You: ${userInfo.whyYou}`,
      attachments: [],
    };

    if (userInfo.projectPresentation) {
      mailOptions.attachments.push({
        filename: userInfo.projectPresentation.split("/").pop(),
        path: userInfo.projectPresentation,
      });
    }

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully with attachments!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

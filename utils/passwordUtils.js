const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Function to generate a random password
function generatePassword() {
  // Generate a random 8-character password
  return crypto.randomBytes(4).toString("hex");
}

// Function to send password reset email
async function sendPasswordEmail(email, password) {
  // Create a Nodemailer transporter using SMTP transport
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: process.env.EMAIL_ADDRESS, // Use environment variable for email address
      pass: process.env.EMAIL_PASSWORD, // Use environment variable for password
    },
  });

  // Email message options
  const mailOptions = {
    from: process.env.EMAIL_ADDRESS, // Sender address
    to: email, // Recipient address
    subject: "Password Reset", // Subject line
    text: `Your new password is: ${password}`, // Email body
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully");
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
}

module.exports = {
  generatePassword,
  sendPasswordEmail,
};

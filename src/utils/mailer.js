const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME, // ví dụ: 'yourname@gmail.com'
    pass: process.env.EMAIL_PASSWORD, // app password
  },
});

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: `Hotel Booking <${process.env.EMAIL_USERNAME}>`,
      to,
      subject,
      text,
      html,
    });
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;
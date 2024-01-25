const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      logger:true
    });

    // define options
    const mailOptions = {
      from: 'deveshisingh7b@gmail.com',
      to: options.email,
      subject: options.subject,
      text: options.message,
      // You can use `html` property for HTML content
    };

    // send it
    await transporter.sendMail(mailOptions);

    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Rethrow the error to handle it at a higher level if needed
  }
};

module.exports = sendEmail;

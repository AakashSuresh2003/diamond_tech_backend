const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/submit-form', async (req, res) => {
  const { name, email, phone, city, message, address, stoneProcessing, woodProcessing, laserMachines } = req.body;
  const requestId = `REQ-${Math.floor(Math.random() * 1000000)}`;

  const mailOptionsToTeam = {
    from: process.env.SMTP_USER,
    to: process.env.YOUR_EMAIL,
    subject: `New Inquiry from ${name}`,
    text: `
      New Inquiry Received:
      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      City: ${city}
      Address: ${address}
      Message: ${message}
      Stone Processing: ${stoneProcessing ? 'Yes' : 'No'}
      Wood Processing: ${woodProcessing ? 'Yes' : 'No'}
      Laser Machines: ${laserMachines ? 'Yes' : 'No'}
      Request ID: ${requestId}
    `,
  };

  const mailOptionsToUser = {
    from: process.env.SMTP_USER,
    to: email,
    subject: `We have received your request`,
    text: `
      Dear ${name},

      We have received your inquiry. Your request ID is: ${requestId}. We will get back to you shortly.

      Best regards,
      Your Team
    `,
  };

  try {
    await Promise.all([
      transporter.sendMail(mailOptionsToTeam),
      transporter.sendMail(mailOptionsToUser),
    ]);

    res.status(200).send({ success: true, message: 'Inquiry submitted successfully' });
  } catch (err) {
    console.log('Error sending emails:', err);
    res.status(500).send({ success: false, message: 'Failed to send emails' });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

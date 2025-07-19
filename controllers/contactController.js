// controllers/contactController.js
const ContactMessage = require('../models/ContactMessage');
const sendEmail = require('../utils/sendEmail');

exports.createContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const contactMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message
    });

    // Send email notification to admin
    const emailMessage = `New contact message received!\n\nFrom: ${name} <${email}>\nSubject: ${subject}\n\nMessage:\n${message}`;

    try {
      await sendEmail({
        email: process.env.MAIL_FROM,
        subject: `New Contact Message: ${subject}`,
        message: emailMessage
      });
    } catch (emailErr) {
      console.error('Error sending email:', emailErr);
    }

    res.status(201).json({
      success: true,
      data: contactMessage
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

exports.getAllContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

exports.getContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

exports.deleteContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.status(204).json({
      success: true,
      data: null
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};
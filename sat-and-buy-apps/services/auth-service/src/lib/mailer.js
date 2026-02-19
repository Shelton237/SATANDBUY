"use strict";

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "465", 10),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const fromAddress =
  process.env.EMAIL_FROM || process.env.EMAIL_USER || "no-reply@satandbuy.local";

async function send({ to, subject, html }) {
  if (!to) {
    throw new Error("Destinataire requis pour l'envoi d'email.");
  }
  await transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    html,
  });
}

module.exports = {
  send,
};

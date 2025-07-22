import nodemailer from "nodemailer";
import {SMTP_HOST, SMTP_PORT, MAIL_USER, MAIL_PASSWORD, ADMIN_MAIL} from "../config/index.js";

// brevo website
async function sendMail({ to, from=ADMIN_MAIL, subject, text, html }) {
  console.log(`
    to  : ${to},
    from : ${from},
    text : ${text}
  `);
  let transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}

export default sendMail;

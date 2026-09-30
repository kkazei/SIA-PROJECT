import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const isConsoleMailer = process.env.EMAIL_MODE === "console" ||
  (process.env.NODE_ENV !== "production" && !process.env.SMTP_HOST && !process.env.EMAIL_USER);

const smtpOptions = process.env.SMTP_HOST
  ? {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    }
  : {
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    };

export const transporter = isConsoleMailer ? null : nodemailer.createTransport(smtpOptions);

// Default sender information
export const sender = {
  email: process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER,
  name: "RentFlow"
};

// Email sending function
export const sendEmail = async (to, subject, html) => {
  try {
    if (isConsoleMailer) {
      const verificationCode = html.match(/\b\d{6}\b/)?.[0];
      console.log(`[console mailer] ${subject} -> ${to}${verificationCode ? ` | verification code: ${verificationCode}` : ""}`);
      return { success: true, messageId: "console-mailer" };
    }

    if (!sender.email) {
      throw new Error("Email is not configured. Set SMTP_HOST/SMTP_USER/SMTP_PASSWORD or EMAIL_USER/EMAIL_APP_PASSWORD.");
    }

    const mailOptions = {
      from: `"${sender.name}" <${sender.email}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};


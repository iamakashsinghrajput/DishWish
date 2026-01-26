import nodemailer from 'nodemailer';

const emailServerHost = process.env.EMAIL_SERVER_HOST;
const emailServerPort = parseInt(process.env.EMAIL_SERVER_PORT || '587', 10);
const emailSecure = process.env.EMAIL_SECURE === 'true';
const emailUsername = process.env.EMAIL_USERNAME;
const emailPassword = process.env.EMAIL_PASSWORD;
const emailFrom = process.env.EMAIL_FROM;

let transporter: nodemailer.Transporter | null = null;

if (emailServerHost && emailUsername && emailPassword && emailFrom) {
  transporter = nodemailer.createTransport({
    host: emailServerHost,
    port: emailServerPort,
    secure: emailSecure,
    auth: {
      user: emailUsername,
      pass: emailPassword,
    },
    // connectionTimeout: 5 * 60 * 1000, // 5 min
    // greetingTimeout: 5 * 60 * 1000,
    // socketTimeout: 5 * 60 * 1000,
    // tls: {
    //     // do not fail on invalid certs if using self-signed certificates in development
    //     rejectUnauthorized: process.env.NODE_ENV === 'production' 
    // }
  });

  if (process.env.NODE_ENV === 'development') {
    transporter.verify(function (error) {
      if (error) {
        console.error("Mailer verification error:", error);
      } else {
        console.log("Mail server is ready to take our messages");
      }
    });
  }

} else {
  console.warn(
    "Email server environment variables are not fully configured. " +
    "Email sending will be disabled. Please check EMAIL_SERVER_HOST, " +
    "EMAIL_SERVER_PORT, EMAIL_SECURE, EMAIL_USERNAME, EMAIL_PASSWORD, and EMAIL_FROM."
  );
}

interface MailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html: string;
  replyTo?: string;
  // attachments?: { filename: string; content: Buffer | string; contentType?: string }[];
}

export const sendMail = async ({ to, subject, text, html, replyTo }: MailOptions): Promise<nodemailer.SentMessageInfo | null> => {
  if (!transporter) {
    const errorMessage = "Email service is not configured. Cannot send email.";
    console.error(errorMessage);
    // throw new Error(errorMessage);
    return null;
  }

  const mailData: nodemailer.SendMailOptions = {
    from: emailFrom!,
    to: to,
    subject: subject,
    text: text,
    html: html,
  };

  if (replyTo) {
    mailData.replyTo = replyTo;
  }

  try {
    // console.log(`Attempting to send email to: ${to}, subject: ${subject}`);
    const info = await transporter.sendMail(mailData);
    // console.log('Message sent: %s', info.messageId);
    // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
const nodemailer = require("nodemailer");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_CONTACT_TO_EMAIL = "gabriel@nelmech.co.za";
const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 5000;
const MAX_SERVICE_LENGTH = 120;

function getBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

function getText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getSingleLineText(value) {
  return getText(value).replace(/[\r\n]+/g, " ");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const body = getBody(req);
  const name = getSingleLineText(body.name);
  const email = getText(body.email);
  const message = getText(body.message);
  const service = getSingleLineText(body.service);

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "All fields are required" });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ success: false, error: "Invalid email address" });
  }

  if (
    name.length > MAX_NAME_LENGTH ||
    email.length > MAX_EMAIL_LENGTH ||
    message.length > MAX_MESSAGE_LENGTH ||
    service.length > MAX_SERVICE_LENGTH
  ) {
    return res.status(400).json({ success: false, error: "One or more fields are too long" });
  }

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    CONTACT_FROM_EMAIL,
    CONTACT_TO_EMAIL,
  } = process.env;

  const smtpPort = Number(SMTP_PORT);

  if (
    !SMTP_HOST ||
    !Number.isInteger(smtpPort) ||
    smtpPort < 1 ||
    smtpPort > 65535 ||
    !SMTP_USER ||
    !SMTP_PASS
  ) {
    return res.status(500).json({
      success: false,
      error: "Email service is not configured",
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    await transporter.sendMail({
      from: CONTACT_FROM_EMAIL || SMTP_USER,
      to: CONTACT_TO_EMAIL || DEFAULT_CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `New website contact from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        service ? `Service: ${service}` : "",
        "",
        "Message:",
        message,
      ].join("\n"),
    });

    return res.status(200).json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to send message. Please try again later.",
    });
  }
};

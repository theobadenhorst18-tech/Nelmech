const test = require("node:test");
const assert = require("node:assert/strict");
const nodemailer = require("nodemailer");
const handler = require("../api/contact");

const ENV_KEYS = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "CONTACT_FROM_EMAIL",
  "CONTACT_TO_EMAIL",
];

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    payload: undefined,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };
}

function setSmtpEnvironment() {
  process.env.SMTP_HOST = "smtp.example.com";
  process.env.SMTP_PORT = "465";
  process.env.SMTP_USER = "website@example.com";
  process.env.SMTP_PASS = "test-password";
  process.env.CONTACT_FROM_EMAIL = "forms@example.com";
  process.env.CONTACT_TO_EMAIL = "inbox@example.com";
}

test.beforeEach(() => {
  for (const key of ENV_KEYS) delete process.env[key];
});

test("rejects non-POST requests", async () => {
  const res = createResponse();
  await handler({ method: "GET" }, res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.Allow, "POST");
});

test("validates required fields and email addresses", async () => {
  const missingRes = createResponse();
  await handler({ method: "POST", body: {} }, missingRes);
  assert.equal(missingRes.statusCode, 400);
  assert.equal(missingRes.payload.error, "All fields are required");

  const invalidEmailRes = createResponse();
  await handler(
    { method: "POST", body: { name: "Test", email: "invalid", message: "Hello" } },
    invalidEmailRes,
  );
  assert.equal(invalidEmailRes.statusCode, 400);
  assert.equal(invalidEmailRes.payload.error, "Invalid email address");
});

test("reports missing SMTP configuration", async () => {
  const res = createResponse();
  await handler(
    { method: "POST", body: { name: "Test", email: "test@example.com", message: "Hello" } },
    res,
  );
  assert.equal(res.statusCode, 500);
  assert.equal(res.payload.error, "Email service is not configured");
});

test("sends a valid contact request to the configured recipient", async (t) => {
  setSmtpEnvironment();
  let transportOptions;
  let mailOptions;

  t.mock.method(nodemailer, "createTransport", (options) => {
    transportOptions = options;
    return {
      async sendMail(message) {
        mailOptions = message;
      },
    };
  });

  const res = createResponse();
  await handler(
    {
      method: "POST",
      body: JSON.stringify({
        name: "  Jane Example  ",
        email: "jane@example.com",
        message: "  Please call me.  ",
        service: "Mechanical Engineering",
      }),
    },
    res,
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.success, true);
  assert.equal(transportOptions.port, 465);
  assert.equal(transportOptions.secure, true);
  assert.equal(mailOptions.to, "inbox@example.com");
  assert.equal(mailOptions.replyTo, "jane@example.com");
  assert.match(mailOptions.text, /Service: Mechanical Engineering/);
  assert.match(mailOptions.text, /Please call me\./);
});

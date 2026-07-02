const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const clientScript = fs.readFileSync(path.resolve(__dirname, "../script.js"), "utf8");

function createHarness(fetchImplementation) {
  let submitHandler;
  let resetCount = 0;
  const status = { textContent: "" };
  const button = { disabled: false };
  const form = {
    data: {
      name: "Jane Example",
      email: "jane@example.com",
      message: "Please contact me.",
      service: "General enquiry",
    },
    addEventListener(event, handler) {
      if (event === "submit") submitHandler = handler;
    },
    querySelector(selector) {
      if (selector === ".contact-status") return status;
      if (selector === 'button[type="submit"]') return button;
      return null;
    },
    reset() {
      resetCount += 1;
    },
  };
  const document = {
    addEventListener() {},
    querySelector() {
      return null;
    },
    querySelectorAll(selector) {
      return selector === ".contact-form" ? [form] : [];
    },
  };
  class TestFormData {
    constructor(target) {
      this.target = target;
    }

    get(name) {
      return this.target.data[name];
    }
  }
  const window = {};

  vm.runInNewContext(clientScript, {
    console: { log() {}, warn() {}, error() {} },
    document,
    fetch: fetchImplementation,
    FormData: TestFormData,
    setInterval() {},
    window,
  });
  window.NelmechUI.initContactForms();

  return {
    button,
    form,
    get resetCount() {
      return resetCount;
    },
    status,
    submit() {
      return submitHandler({ preventDefault() {} });
    },
  };
}

test("submits the contact payload and resets the form after success", async () => {
  let request;
  const harness = createHarness(async (url, options) => {
    request = { url, options };
    return {
      ok: true,
      async text() {
        return JSON.stringify({ success: true });
      },
    };
  });

  const submission = harness.submit();
  assert.equal(harness.button.disabled, true);
  await submission;

  assert.equal(request.url, "/api/contact");
  assert.equal(request.options.method, "POST");
  assert.deepEqual(JSON.parse(request.options.body), harness.form.data);
  assert.equal(harness.status.textContent, "Message sent successfully.");
  assert.equal(harness.resetCount, 1);
  assert.equal(harness.button.disabled, false);
});

test("shows API failures and re-enables the submit button", async () => {
  const harness = createHarness(async () => ({
    ok: false,
    async text() {
      return JSON.stringify({ success: false, error: "Email service is not configured" });
    },
  }));

  await harness.submit();

  assert.equal(harness.status.textContent, "Email service is not configured");
  assert.equal(harness.resetCount, 0);
  assert.equal(harness.button.disabled, false);
});

test("handles a non-JSON server failure without crashing", async () => {
  const harness = createHarness(async () => ({
    ok: false,
    async text() {
      return "Bad gateway";
    },
  }));

  await harness.submit();

  assert.equal(harness.status.textContent, "Message failed to send. Please try again.");
  assert.equal(harness.button.disabled, false);
});

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const pages = [
  ["index.html", "General enquiry"],
  ["electrical-installations.html", "Electrical Installations"],
  ["industrial-automation.html", "Industrial Automation"],
  ["maintenance-repairs.html", "Maintenance and Repairs"],
  ["mechanical-engineering.html", "Mechanical Engineering"],
];

for (const [filename, service] of pages) {
  test(`${filename} contains a wired contact form`, () => {
    const html = fs.readFileSync(path.resolve(__dirname, "..", filename), "utf8");

    assert.match(html, /<form[^>]*class="contact-form"/);
    assert.match(html, new RegExp(`name="service" value="${service}"`));
    assert.match(html, /name="name"[^>]*required/);
    assert.match(html, /name="email"[^>]*required/);
    assert.match(html, /name="message"[^>]*required/);
    assert.match(html, /class="contact-status"[^>]*aria-live="polite"/);
    assert.match(html, /<script src="script\.js"><\/script>/);
  });
}

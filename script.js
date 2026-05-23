const contactForms = document.querySelectorAll(".contact-form");

contactForms.forEach((contactForm) => {
  const statusEl = contactForm.querySelector(".contact-status");

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      service: String(formData.get("service") || "").trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      if (statusEl) {
        statusEl.textContent = "Please complete all fields.";
      }
      return;
    }

    if (statusEl) {
      statusEl.textContent = "Sending...";
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to send message");
      }

      if (statusEl) {
        statusEl.textContent = "Message sent successfully.";
      }
      contactForm.reset();
    } catch (error) {
      if (statusEl) {
        statusEl.textContent = "Message failed to send. Please try again.";
      }
      console.error("Contact submit error:", error);
    }
  });
});

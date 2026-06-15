console.log("Website loaded successfully");

function initMenus() {
  document.querySelectorAll(".menu-dropdown").forEach((menu) => {
    const button = menu.querySelector(".menu-button");

    if (!button) {
      return;
    }

    button.addEventListener("click", () => {
      menu.classList.toggle("open");
    });

    document.addEventListener("click", (event) => {
      if (!menu.contains(event.target)) {
        menu.classList.remove("open");
      }
    });
  });
}

function initGalleries() {
  document.querySelectorAll(".project-gallery").forEach((gallery) => {
    const track = gallery.querySelector(".project-gallery-track");
    const sets = gallery.querySelectorAll(".project-gallery-set");
    const prevButton = gallery.querySelector(".gallery-nav--prev");
    const nextButton = gallery.querySelector(".gallery-nav--next");

    if (!track || sets.length === 0 || !prevButton || !nextButton) {
      return;
    }

    let currentSet = 0;

    const updateGallery = () => {
      track.style.transform = `translateX(-${currentSet * 100}%)`;
      prevButton.disabled = currentSet === 0;
      nextButton.disabled = currentSet === sets.length - 1;
    };

    prevButton.addEventListener("click", () => {
      if (currentSet > 0) {
        currentSet -= 1;
        updateGallery();
      }
    });

    nextButton.addEventListener("click", () => {
      if (currentSet < sets.length - 1) {
        currentSet += 1;
        updateGallery();
      }
    });

    updateGallery();
  });
}

function initContactForms() {
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
        service: String(formData.get("service") || "").trim()
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
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
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
          statusEl.textContent =
            error instanceof Error ? error.message : "Message failed to send. Please try again.";
        }
        console.error("Contact submit error:", error);
      }
    });
  });
}

async function initHeroSlideshow() {
  const activeImage = document.querySelector(".hero .hero-bg--active");
  const nextImage = document.querySelector(".hero .hero-bg--next");

  if (!activeImage || !nextImage) {
    return;
  }

  const fallbackImages = [
    "hero/20240821_151055-1920.webp",
    "hero/20240821_151617-1920.webp",
    "hero/20250311_170830-1920 (1).webp",
    "hero/20250724_140315-1920.webp"
  ];
  let heroImages = fallbackImages;

  try {
    const response = await fetch("/api/hero-images");
    const result = await response.json();

    if (response.ok && result.success && Array.isArray(result.images) && result.images.length > 0) {
      heroImages = result.images;
    }
  } catch (error) {
    console.warn("Falling back to hardcoded hero image list.", error);
  }

  if (heroImages.length === 0) {
    return;
  }

  activeImage.src = heroImages[0];
  nextImage.src = heroImages[1 % heroImages.length];

  if (heroImages.length < 2) {
    return;
  }

  let currentIndex = 0;
  let showingActiveImage = true;

  setInterval(() => {
    const nextIndex = (currentIndex + 1) % heroImages.length;
    const visibleLayer = showingActiveImage ? activeImage : nextImage;
    const hiddenLayer = showingActiveImage ? nextImage : activeImage;

    hiddenLayer.src = heroImages[nextIndex];
    hiddenLayer.classList.add("hero-bg--active");
    visibleLayer.classList.remove("hero-bg--active");

    currentIndex = nextIndex;
    showingActiveImage = !showingActiveImage;
  }, 5000);
}

window.NelmechUI = {
  initMenus,
  initGalleries,
  initHeroSlideshow
};

document.addEventListener("DOMContentLoaded", () => {
  initMenus();
  initGalleries();
  initHeroSlideshow();
  initContactForms();
});

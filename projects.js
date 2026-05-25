function chunkInThrees(items) {
  const grouped = [];
  for (let i = 0; i < items.length; i += 3) {
    grouped.push(items.slice(i, i + 3));
  }
  return grouped;
}

function renderProjectsOnIndex() {
  const container = document.getElementById("projects-grid");
  if (!container) {
    return;
  }

  const projects = nelmechGetProjects();
  container.innerHTML = projects
    .map(
      (project) => `
      <a class="project-card-link" href="project.html?id=${project.id}">
        <article class="project-card">
          <div class="project-card__image-wrap">
            <img class="project-card__image" src="${project.coverImage}" alt="${project.title}" loading="lazy" decoding="async" />
          </div>
          <div class="project-card__body">
            <h3>${project.title}</h3>
            <p>${project.cardText}</p>
          </div>
        </article>
      </a>
    `
    )
    .join("");
}

function renderProjectDetailPage() {
  const root = document.getElementById("project-detail-root");
  if (!root) {
    return;
  }

  const projects = nelmechGetProjects();
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("id");
  const project = projects.find((item) => item.id === requestedId) || projects[0];

  if (!project) {
    root.innerHTML = "<p>No projects are available yet.</p>";
    return;
  }

  const galleryImages = Array.isArray(project.galleryImages) ? project.galleryImages : [];
  const imageSets = chunkInThrees(galleryImages.length ? galleryImages : [project.coverImage]);
  const embedUrl = nelmechYoutubeEmbedUrl(project.videoUrl);

  root.innerHTML = `
    <h1>${project.title}</h1>

    <div class="project-video">
      <h2>Project Video</h2>
      ${
        embedUrl
          ? `<iframe src="${embedUrl}" title="${project.title} Video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
          : "<p>No video added yet.</p>"
      }
    </div>

    <div class="project-gallery-section">
      <h2>Project Photos</h2>
      <div class="project-gallery">
        <div class="project-gallery-shell">
          <button class="gallery-nav gallery-nav--prev" type="button" aria-label="Previous photo set">&larr;</button>
          <div class="project-gallery-window">
            <div class="project-gallery-track">
              ${imageSets
                .map(
                  (set) => `
                    <div class="project-gallery-set">
                      ${set.map((image) => `<img src="${image}" alt="${project.title} photo" loading="lazy" />`).join("")}
                    </div>
                  `
                )
                .join("")}
            </div>
          </div>
          <button class="gallery-nav gallery-nav--next" type="button" aria-label="Next photo set">&rarr;</button>
        </div>
      </div>
    </div>

    <div class="project-description">
      <h2>Project Summary</h2>
      <p>${project.detailText}</p>
    </div>
  `;

  if (window.NelmechUI && typeof window.NelmechUI.initGalleries === "function") {
    window.NelmechUI.initGalleries();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderProjectsOnIndex();
  renderProjectDetailPage();
});

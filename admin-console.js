function readFilesAsDataUrls(fileList) {
  const files = Array.from(fileList || []);
  return Promise.all(
    files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
          reader.readAsDataURL(file);
        })
    )
  );
}

function requireAdminPassword() {
  const saved = nelmechGetAdminCredentials();
  if (!saved.email || !saved.password) {
    const setupEmail = (window.prompt("Set admin email (first-time setup):") || "").trim().toLowerCase();
    const setupPassword = window.prompt("Set admin password (first-time setup):") || "";
    if (!setupEmail || !setupPassword) {
      document.body.innerHTML = `
        <section class="section dark">
          <div class="admin-console">
            <h1>Setup Incomplete</h1>
            <p>Admin email and password are required.</p>
          </div>
        </section>
      `;
      return false;
    }
    nelmechSetAdminCredentials(setupEmail, setupPassword);
  }

  const emailInput = (window.prompt("Enter admin email:") || "").trim().toLowerCase();
  const passwordInput = window.prompt("Enter admin password:") || "";
  const creds = nelmechGetAdminCredentials();

  if (emailInput !== creds.email || passwordInput !== creds.password) {
    document.body.innerHTML = `
      <section class="section dark">
        <div class="admin-console">
          <h1>Access Denied</h1>
          <p>Incorrect email or password.</p>
        </div>
      </section>
    `;
    return false;
  }
  return true;
}

function setFormData(project) {
  document.getElementById("project-id").value = project?.id || "";
  document.getElementById("project-title").value = project?.title || "";
  document.getElementById("project-card-text").value = project?.cardText || "";
  document.getElementById("project-detail-text").value = project?.detailText || "";
  document.getElementById("project-video-url").value = project?.videoUrl || "";
  document.getElementById("project-model-url").value = project?.modelUrl || "";
  document.getElementById("project-model-poster").value = project?.modelPoster || "";
  document.getElementById("project-cover-image").value = "";
  document.getElementById("project-gallery-images").value = "";
}

function renderAdminProjectList() {
  const list = document.getElementById("admin-project-list");
  const projects = nelmechGetProjects();

  list.innerHTML = projects
    .map(
      (project) => `
        <article class="admin-project-card">
          <img src="${project.coverImage}" alt="${project.title}" />
          <div class="admin-project-content">
            <h3>${project.title}</h3>
            <p>${project.cardText}</p>
            <div class="admin-project-actions">
              <button type="button" data-action="edit" data-id="${project.id}">Edit</button>
              <button type="button" data-action="delete" data-id="${project.id}" class="danger-btn">Delete</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");

  list.querySelectorAll("button[data-action='edit']").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-id");
      const project = nelmechGetProjects().find((item) => item.id === id);
      setFormData(project);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  list.querySelectorAll("button[data-action='delete']").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-id");
      const existing = nelmechGetProjects();
      const project = existing.find((item) => item.id === id);
      if (!project) {
        return;
      }
      const shouldDelete = window.confirm(`Delete project "${project.title}"?`);
      if (!shouldDelete) {
        return;
      }
      const updated = existing.filter((item) => item.id !== id);
      nelmechSaveProjects(updated);
      renderAdminProjectList();
      setFormData(null);
    });
  });
}

async function onSubmitProjectForm(event) {
  event.preventDefault();

  const idInput = document.getElementById("project-id");
  const titleInput = document.getElementById("project-title");
  const cardInput = document.getElementById("project-card-text");
  const detailInput = document.getElementById("project-detail-text");
  const videoInput = document.getElementById("project-video-url");
  const modelUrlInput = document.getElementById("project-model-url");
  const modelPosterInput = document.getElementById("project-model-poster");
  const coverInput = document.getElementById("project-cover-image");
  const galleryInput = document.getElementById("project-gallery-images");

  const existingProjects = nelmechGetProjects();
  const editingId = idInput.value.trim();
  const editingProject = existingProjects.find((item) => item.id === editingId);

  const coverUpload = await readFilesAsDataUrls(coverInput.files);
  const galleryUploads = await readFilesAsDataUrls(galleryInput.files);

  const title = titleInput.value.trim();
  const nextId = editingId || nelmechSlugify(title) || `project-${Date.now()}`;

  const nextProject = {
    id: nextId,
    title,
    cardText: cardInput.value.trim(),
    detailText: detailInput.value.trim(),
    videoUrl: videoInput.value.trim(),
    modelUrl: modelUrlInput.value.trim(),
    modelPoster: modelPosterInput.value.trim(),
    coverImage: coverUpload[0] || (editingProject ? editingProject.coverImage : "Images/Welder.jpg"),
    galleryImages:
      galleryUploads.length > 0
        ? galleryUploads
        : editingProject && Array.isArray(editingProject.galleryImages) && editingProject.galleryImages.length > 0
        ? editingProject.galleryImages
        : [coverUpload[0] || "Images/Welder.jpg"]
  };

  const withoutCurrent = existingProjects.filter((item) => item.id !== editingId);
  withoutCurrent.push(nextProject);
  nelmechSaveProjects(withoutCurrent);

  setFormData(null);
  renderAdminProjectList();
}

document.addEventListener("DOMContentLoaded", () => {
  const allowed = requireAdminPassword();
  if (!allowed) {
    return;
  }

  const form = document.getElementById("project-form");
  const resetButton = document.getElementById("reset-form-btn");

  form.addEventListener("submit", onSubmitProjectForm);
  resetButton.addEventListener("click", () => setFormData(null));
  renderAdminProjectList();
});

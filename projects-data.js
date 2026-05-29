const NELMECH_PROJECTS_KEY = "nelmech_projects_v1";
const NELMECH_ADMIN_EMAIL_KEY = "nelmech_admin_email";
const NELMECH_ADMIN_PASSWORD_KEY = "nelmech_admin_password";

const NELMECH_DEFAULT_PROJECTS = [
  {
    id: "catuane-mozambique",
    title: "Catuane | Mozambique",
    cardText:
      "On farm drying facility, with remote access for online monitoring and fault finding, PLC controlled drying room with NIS sizing and bulk bagging.",
    detailText:
      "This Catuane project focused on building a reliable on-farm drying operation with a practical blend of mechanical and automation systems. The plant was designed to support consistent throughput while allowing remote monitoring for faster fault diagnosis and reduced downtime.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    modelUrl: "Images/projects/models/t-shape-temp.gltf",
    modelPoster: "Images/projects/catuane-mozambique.jpg",
    coverImage: "Images/projects/catuane-mozambique.jpg",
    galleryImages: [
      "Images/projects/catuane-mozambique.jpg",
      "Images/projects/white-river-food-processing.jpg",
      "Images/projects/white-river-cold-rooms.jpg",
      "Images/Industrial Automation.jpg",
      "Images/Maintenance and Installations.jpg",
      "Images/Electrical Installations.jpg"
    ]
  },
  {
    id: "white-river-cold-rooms",
    title: "White River Cold Rooms | South Africa",
    cardText:
      "Insulated Cold Rooms, we design, supply and install customized cool rooms for storage, temp controlled rooms and partitioning.",
    detailText:
      "The White River cold room project required a tailored design that balanced thermal performance, operational flow, and ease of maintenance. We delivered a customized insulated room solution for controlled storage and partitioned zones.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    modelUrl: "Images/projects/models/t-shape-temp.gltf",
    modelPoster: "Images/projects/white-river-cold-rooms.jpg",
    coverImage: "Images/projects/white-river-cold-rooms.jpg",
    galleryImages: [
      "Images/projects/white-river-cold-rooms.jpg",
      "Images/projects/white-river-food-processing.jpg",
      "Images/projects/catuane-mozambique.jpg",
      "Images/Mechanical Engineering.jpg",
      "Images/Electrical Installations.jpg",
      "Images/Maintenance and Installations.jpg"
    ]
  },
  {
    id: "white-river-food-processing",
    title: "White River Food Processing Plant | South Africa",
    cardText:
      "Food Processing Plant, low pressure air, pipework, stainless welding and installation.",
    detailText:
      "This food processing installation centered on robust stainless pipework, low-pressure air distribution, and clean mechanical execution suited to a production environment. The outcome is a cleaner, more reliable production setup with improved utility routing.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    modelUrl: "Images/projects/models/t-shape-temp.gltf",
    modelPoster: "Images/projects/white-river-food-processing.jpg",
    coverImage: "Images/projects/white-river-food-processing.jpg",
    galleryImages: [
      "Images/projects/white-river-food-processing.jpg",
      "Images/projects/white-river-cold-rooms.jpg",
      "Images/projects/catuane-mozambique.jpg",
      "Images/Industrial Automation.jpg",
      "Images/Mechanical Engineering.jpg",
      "Images/Electrical Installations.jpg"
    ]
  }
];

function nelmechSlugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nelmechGetProjects() {
  const raw = localStorage.getItem(NELMECH_PROJECTS_KEY);
  if (!raw) {
    return [...NELMECH_DEFAULT_PROJECTS];
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [...NELMECH_DEFAULT_PROJECTS];
    }
    const defaultsById = new Map(NELMECH_DEFAULT_PROJECTS.map((project) => [project.id, project]));
    return parsed.map((project) => {
      const fallback = defaultsById.get(project.id) || {};
      return {
        ...project,
        modelUrl: (project.modelUrl || fallback.modelUrl || "").trim(),
        modelPoster: (project.modelPoster || fallback.modelPoster || project.coverImage || "").trim()
      };
    });
  } catch (error) {
    return [...NELMECH_DEFAULT_PROJECTS];
  }
}

function nelmechSaveProjects(projects) {
  localStorage.setItem(NELMECH_PROJECTS_KEY, JSON.stringify(projects));
}

function nelmechYoutubeEmbedUrl(url) {
  if (!url) {
    return "";
  }
  const youtubeIdMatch =
    url.match(/[?&]v=([^&]+)/) ||
    url.match(/youtu\.be\/([^?&]+)/) ||
    url.match(/youtube\.com\/embed\/([^?&]+)/);
  const videoId = youtubeIdMatch ? youtubeIdMatch[1] : "";
  return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
}

function nelmechGetAdminCredentials() {
  return {
    email: (localStorage.getItem(NELMECH_ADMIN_EMAIL_KEY) || "").trim().toLowerCase(),
    password: localStorage.getItem(NELMECH_ADMIN_PASSWORD_KEY) || ""
  };
}

function nelmechSetAdminCredentials(email, password) {
  localStorage.setItem(NELMECH_ADMIN_EMAIL_KEY, (email || "").trim().toLowerCase());
  localStorage.setItem(NELMECH_ADMIN_PASSWORD_KEY, password || "");
}

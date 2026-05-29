const fs = require("fs");
const path = require("path");

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const heroDir = path.join(process.cwd(), "hero");
    const entries = await fs.promises.readdir(heroDir, { withFileTypes: true });

    const images = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((fileName) => ALLOWED_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
      .sort((a, b) => a.localeCompare(b))
      .map((fileName) => `hero/${fileName}`);

    return res.status(200).json({ success: true, images });
  } catch (error) {
    console.error("Hero images API error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to load hero images",
      images: []
    });
  }
};

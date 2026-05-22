// Set a custom thumbnail for a YouTube video.
// Usage: npm run thumbnail -- <videoId> <thumbnail.png>

import { createReadStream, existsSync } from "node:fs";
import { resolve } from "node:path";
import { getAuthenticatedYouTube } from "./auth.js";

const [videoId, imagePath] = process.argv.slice(2);

if (!videoId || !imagePath) {
  console.error("Usage: npm run thumbnail -- <videoId> <thumbnail.png>");
  process.exit(1);
}

const absPath = resolve(imagePath);
if (!existsSync(absPath)) {
  console.error(`Thumbnail not found: ${absPath}`);
  process.exit(1);
}

const youtube = await getAuthenticatedYouTube();

const response = await youtube.thumbnails.set({
  videoId,
  media: {
    body: createReadStream(absPath)
  }
});

console.log("Thumbnail updated.");
console.log(JSON.stringify(response.data, null, 2));

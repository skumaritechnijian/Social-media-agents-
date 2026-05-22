// Read video stats through the YouTube Data API.
// Usage: npm run stats -- <videoId>

import { getAuthenticatedYouTube } from "./auth.js";

async function stats(videoId: string) {
  const youtube = await getAuthenticatedYouTube();
  const response = await youtube.videos.list({
    part: ["snippet", "statistics", "status"],
    id: [videoId]
  });

  const video = response.data.items?.[0];
  if (!video) {
    throw new Error(`Video not found or inaccessible: ${videoId}`);
  }

  console.log(JSON.stringify({
    videoId,
    title: video.snippet?.title,
    channelTitle: video.snippet?.channelTitle,
    visibility: video.status?.privacyStatus,
    views: video.statistics?.viewCount,
    likes: video.statistics?.likeCount,
    comments: video.statistics?.commentCount
  }, null, 2));
}

const videoId = process.argv[2];
if (!videoId) {
  console.error("Usage: npm run stats -- <videoId>");
  process.exit(1);
}

stats(videoId).catch((err) => {
  console.error(err);
  process.exit(1);
});

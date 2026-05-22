// Update title / description / visibility of an existing video.
// Usage:
//   npm run update -- <videoId> --title "New title"
//   npm run update -- <videoId> --visibility public
//   npm run update -- <videoId> --description "New description"
//   npm run update -- <videoId> --description-file ./description.txt
//   npm run update -- <videoId> --tags "tag one,tag two"

import { getAuthenticatedYouTube } from "./auth.js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

interface Args {
  videoId: string;
  title?: string;
  description?: string;
  descriptionFile?: string;
  tags?: string[];
  visibility?: "public" | "unlisted" | "private";
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  if (!argv[0]) throw new Error("Missing videoId");
  const out: Args = { videoId: argv[0] };

  for (let i = 1; i < argv.length; i += 2) {
    const key = argv[i]?.replace(/^--/, "");
    const val = argv[i + 1];

    if (key === "title") out.title = val;
    else if (key === "description") out.description = val;
    else if (key === "description-file") out.descriptionFile = val;
    else if (key === "tags") {
      out.tags = (val ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    }
    else if (key === "visibility") {
      if (!["public", "unlisted", "private"].includes(val)) {
        throw new Error("Visibility must be public, unlisted, or private.");
      }
      out.visibility = val as Args["visibility"];
    }
  }

  return out;
}

async function update(args: Args) {
  if (args.descriptionFile) {
    args.description = readFileSync(resolve(args.descriptionFile), "utf8");
  }

  const youtube = await getAuthenticatedYouTube();

  const existing = await youtube.videos.list({
    part: ["snippet", "status"],
    id: [args.videoId]
  });

  const video = existing.data.items?.[0];
  if (!video?.snippet || !video.status) {
    throw new Error(`Video not found or inaccessible: ${args.videoId}`);
  }

  const response = await youtube.videos.update({
    part: ["snippet", "status"],
    requestBody: {
      id: args.videoId,
      snippet: {
        ...video.snippet,
        title: args.title ?? video.snippet.title ?? "",
        description: args.description ?? video.snippet.description ?? "",
        tags: args.tags ?? video.snippet.tags ?? []
      },
      status: {
        ...video.status,
        privacyStatus: args.visibility ?? video.status.privacyStatus
      }
    }
  });

  console.log("Updated.");
  console.log(JSON.stringify({
    id: response.data.id,
    title: response.data.snippet?.title,
    privacyStatus: response.data.status?.privacyStatus
  }, null, 2));
}

update(parseArgs()).catch((err) => {
  console.error(err);
  process.exit(1);
});

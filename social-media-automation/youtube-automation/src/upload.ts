// Upload a video to YouTube as PRIVATE by default.
// Usage:
//   npm run upload -- ./video.mp4 "My Title" "My description"
//   npm run upload -- ./video.mp4 --title "My Title" --description "My description" --tags "tag one,tag two"
//   npm run upload -- ./video.mp4 --title "My Title" --description-file ./description.txt --tags "tag one,tag two"

import { createReadStream, existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getAuthenticatedYouTube } from "./auth.js";

interface UploadArgs {
  file: string;
  title: string;
  description: string;
  descriptionFile?: string;
  tags: string[];
  visibility: "private" | "unlisted" | "public";
}

function parseArgs(): UploadArgs {
  const argv = process.argv.slice(2);

  if (!argv[0]) {
    throw new Error('Usage: npm run upload -- <file> "Title" ["Description"]');
  }

  const hasFlags = argv.some((arg) => arg.startsWith("--"));

  if (!hasFlags) {
    const [file, title, description = ""] = argv;
    if (!file || !title) {
      throw new Error('Usage: npm run upload -- <file> "Title" ["Description"]');
    }

    return {
      file,
      title,
      description,
      tags: [],
      visibility: "private"
    };
  }

  const out: UploadArgs = {
    file: argv[0],
    title: "",
    description: "",
    tags: [],
    visibility: "private"
  };

  for (let i = 1; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];

    if (key === "--title") {
      out.title = value ?? "";
      i += 1;
    } else if (key === "--description") {
      out.description = value ?? "";
      i += 1;
    } else if (key === "--description-file") {
      out.descriptionFile = value ?? "";
      i += 1;
    } else if (key === "--tags") {
      out.tags = (value ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      i += 1;
    } else if (key === "--visibility") {
      if (!["private", "unlisted", "public"].includes(value ?? "")) {
        throw new Error("Visibility must be private, unlisted, or public.");
      }
      out.visibility = value as UploadArgs["visibility"];
      i += 1;
    }
  }

  if (!out.title) {
    throw new Error("Missing --title.");
  }

  return out;
}

async function upload(args: UploadArgs) {
  const { file: filePath, title, tags, visibility } = args;
  const description = args.descriptionFile
    ? readFileSync(resolve(args.descriptionFile), "utf8")
    : args.description;
  const absPath = resolve(filePath);
  if (!existsSync(absPath)) {
    throw new Error(`File not found: ${absPath}`);
  }

  const youtube = await getAuthenticatedYouTube();

  const response = await youtube.videos.insert({
    part: ["snippet", "status"],
    notifySubscribers: false,
    requestBody: {
      snippet: {
        title,
        description,
        tags
      },
      status: {
        privacyStatus: visibility,
        selfDeclaredMadeForKids: false
      }
    },
    media: {
      body: createReadStream(absPath)
    }
  });

  const videoId = response.data.id;
  console.log(`Uploaded as ${visibility.toUpperCase()}.`);
  if (videoId) {
    console.log(`Video ID: ${videoId}`);
    console.log(`URL: https://www.youtube.com/watch?v=${videoId}`);
  }
}

upload(parseArgs()).catch((err) => {
  console.error(err);
  process.exit(1);
});

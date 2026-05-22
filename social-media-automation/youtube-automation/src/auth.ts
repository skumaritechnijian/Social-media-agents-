import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { google, youtube_v3 } from "googleapis";
import open from "open";

const CREDENTIALS_PATH = resolve("auth", "client_secret.json");
const TOKEN_PATH = resolve("auth", "youtube-token.json");
const REDIRECT_PORT = 53682;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/oauth2callback`;

const SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtube.readonly"
];

type InstalledCredentials = {
  installed?: {
    client_id: string;
    client_secret: string;
    redirect_uris?: string[];
  };
  web?: {
    client_id: string;
    client_secret: string;
    redirect_uris?: string[];
  };
};

function ensureAuthDir() {
  mkdirSync(dirname(CREDENTIALS_PATH), { recursive: true });
}

function loadCredentials() {
  ensureAuthDir();

  if (!existsSync(CREDENTIALS_PATH)) {
    throw new Error(
      `Missing OAuth credentials at ${CREDENTIALS_PATH}. Download an OAuth client JSON from Google Cloud Console and save it there.`
    );
  }

  const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, "utf8")) as InstalledCredentials;
  const client = credentials.installed ?? credentials.web;

  if (!client?.client_id || !client.client_secret) {
    throw new Error("Invalid client_secret.json. Expected installed.client_id/client_secret or web.client_id/client_secret.");
  }

  return client;
}

export function getOAuthClient() {
  const client = loadCredentials();
  return new google.auth.OAuth2(client.client_id, client.client_secret, REDIRECT_URI);
}

export async function login() {
  const oauth2Client = getOAuthClient();
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES
  });

  console.log("Opening Google OAuth consent in your default browser...");
  console.log(authUrl);

  const code = await waitForOAuthCode(authUrl);
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  ensureAuthDir();
  writeFileSync(TOKEN_PATH, `${JSON.stringify(tokens, null, 2)}\n`, "utf8");
  console.log(`YouTube OAuth token saved to ${TOKEN_PATH}`);
}

export async function getAuthenticatedYouTube(): Promise<youtube_v3.Youtube> {
  const oauth2Client = getOAuthClient();

  if (!existsSync(TOKEN_PATH)) {
    throw new Error("Missing auth/youtube-token.json. Run `npm run login` first.");
  }

  const tokens = JSON.parse(readFileSync(TOKEN_PATH, "utf8"));
  oauth2Client.setCredentials(tokens);

  oauth2Client.on("tokens", (newTokens) => {
    const merged = { ...tokens, ...newTokens };
    writeFileSync(TOKEN_PATH, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  });

  return google.youtube({ version: "v3", auth: oauth2Client });
}

function waitForOAuthCode(authUrl: string) {
  return new Promise<string>((resolvePromise, reject) => {
    const server = createServer((req, res) => {
      try {
        const url = new URL(req.url ?? "/", REDIRECT_URI);

        if (url.pathname !== "/oauth2callback") {
          res.writeHead(404);
          res.end("Not found");
          return;
        }

        const error = url.searchParams.get("error");
        if (error) {
          res.writeHead(400, { "content-type": "text/plain" });
          res.end(`OAuth failed: ${error}`);
          reject(new Error(`OAuth failed: ${error}`));
          server.close();
          return;
        }

        const code = url.searchParams.get("code");
        if (!code) {
          res.writeHead(400, { "content-type": "text/plain" });
          res.end("Missing code.");
          reject(new Error("OAuth callback did not include a code."));
          server.close();
          return;
        }

        res.writeHead(200, { "content-type": "text/html" });
        res.end("<h1>YouTube login complete</h1><p>You can close this tab and return to the terminal.</p>");
        resolvePromise(code);
        server.close();
      } catch (err) {
        reject(err);
        server.close();
      }
    });

    server.listen(REDIRECT_PORT, "localhost", async () => {
      await open(authUrl).catch(() => {
        console.log("Could not open browser automatically. Copy the URL above into your browser.");
      });
    });
  });
}

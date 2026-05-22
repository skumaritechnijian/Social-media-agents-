import { login } from "./auth.js";

login().catch((err) => {
  console.error(err);
  process.exit(1);
});

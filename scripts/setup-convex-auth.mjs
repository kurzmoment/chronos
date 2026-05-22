#!/usr/bin/env node
/**
 * Generates JWT keys and sets Convex Auth environment variables.
 * Run: node scripts/setup-convex-auth.mjs
 */
import { execSync } from "child_process";
import { exportJWK, exportPKCS8, generateKeyPair } from "jose";

async function setEnvVar(name, value) {
  const escaped = value.replace(/"/g, '\\"');
  execSync(`npx convex env set -- ${name} "${escaped}"`, {
    stdio: "inherit",
  });
}

async function main() {
  const siteUrl =
    process.env.SITE_URL ||
    process.argv.find((a) => a.startsWith("http")) ||
    "http://localhost:3000";

  console.log("Generating JWT key pair…");
  const keys = await generateKeyPair("RS256");
  const privateKey = await exportPKCS8(keys.privateKey);
  const publicKey = await exportJWK(keys.publicKey);
  const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });
  const jwtPrivateKey = privateKey.trimEnd().replace(/\n/g, " ");

  console.log("Setting Convex environment variables on the linked deployment…");
  console.log("(Check CONVEX_DEPLOYMENT in .env.local — dev vs prod/develop)\n");
  await setEnvVar("JWT_PRIVATE_KEY", jwtPrivateKey);
  await setEnvVar("JWKS", jwks);
  await setEnvVar("SITE_URL", siteUrl);
  // CONVEX_SITE_URL is set automatically by Convex (HTTP actions URL).

  console.log(`\nDone. SITE_URL=${siteUrl}`);
  console.log("Restart `npm run dev` and try sign-in again.");
  console.log(
    "Cloud: SITE_URL=https://your-frontend.example npm run setup:auth"
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

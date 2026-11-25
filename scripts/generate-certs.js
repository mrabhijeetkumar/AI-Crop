#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const certsDir = path.resolve(process.cwd(), ".certs");
const certPath = path.join(certsDir, "localhost.pem");
const keyPath = path.join(certsDir, "localhost-key.pem");

if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

function hasCommand(cmd) {
  try {
    execSync(`which ${cmd}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

console.log("\n🔒 AI Crop Profit - Local HTTPS Certificate Generator");
console.log("======================================================");

if (hasCommand("mkcert")) {
  console.log("✔ Found 'mkcert' on system. Generating locally trusted CA certificate...");
  try {
    execSync(
      `mkcert -key-file "${keyPath}" -cert-file "${certPath}" localhost 127.0.0.1 0.0.0.0 ::1`,
      { stdio: "inherit" }
    );
    // Secure permissions on private key
    fs.chmodSync(keyPath, 0o600);
    console.log(`\n✅ Locally trusted development certificates successfully created in .certs/`);
    console.log(`- Cert: ${certPath}`);
    console.log(`- Key:  ${keyPath} (mode 0600)`);
    console.log(`\nRestart your dev server with 'npm run dev' to access https://localhost:8000`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to generate certificates using mkcert:", err.message);
  }
} else {
  console.log("ℹ️  'mkcert' is not currently installed.");
  console.log("Generating fallback development certificate using OpenSSL...");

  try {
    execSync(
      `openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj "/CN=localhost" ` +
        `-keyout "${keyPath}" -out "${certPath}" -days 365 ` +
        `-addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:0.0.0.0,IP:::1"`,
      { stdio: "inherit" }
    );
    fs.chmodSync(keyPath, 0o600);
    console.log(`\n✅ Development certificates generated in .certs/`);
    console.log(`- Cert: ${certPath}`);
    console.log(`- Key:  ${keyPath} (mode 0600)`);
    console.log("\n💡 To make Chrome trust this certificate with a 100% green padlock without any warning:");
    console.log("   Run the following commands in your macOS terminal:");
    console.log("     brew install mkcert");
    console.log("     mkcert -install");
    console.log("     npm run cert:mkcert\n");
  } catch (err) {
    console.error("❌ Failed to generate fallback certificate with OpenSSL:", err.message);
    process.exit(1);
  }
}

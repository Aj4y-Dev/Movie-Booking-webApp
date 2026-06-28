import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import dotenv from "dotenv";
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const loadKey = (filename: string): string => {
  const keyPath = path.join(__dirname, "../keys", filename);

  if (!fs.existsSync(keyPath)) {
    throw new Error(
      `Key file not found: ${filename} — run: openssl genrsa -out src/keys/private.pem 2048`,
    );
  }

  return fs.readFileSync(keyPath, "utf8");
};

export const privateKey = loadKey("private.pem");
export const publicKey = loadKey("public.pem");

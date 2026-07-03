import fs from "fs";
import path from "path";

const loadKey = (filename: string): string => {
  const keyPath = path.join(process.cwd(), "src", "keys", filename);

  if (!fs.existsSync(keyPath)) {
    throw new Error(`Key file not found: ${filename}`);
  }

  return fs.readFileSync(keyPath, "utf8");
};

export const privateKey = loadKey("private.pem");
export const publicKey = loadKey("public.pem");

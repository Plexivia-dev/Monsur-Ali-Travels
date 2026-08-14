import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readJson = (fileName) => {
  try {
    const filePath = path.resolve(__dirname, fileName);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
  } catch (error) {
    console.error(`Failed to load config: ${fileName}`, error);
  }
  return {};
};

const coreConfig = readJson("config.core.json");
const clientConfig = readJson("config.client.json");

export const config = {
  ...coreConfig,
  ...clientConfig
};

import { generateApiKey as apik } from "generate-api-key";

function generateApiKey(): string {
  const key = apik({ method: "base62" });
  return key as string;
}

export default generateApiKey;

const axios = require("axios");

const BUNNYCDN_API_KEY = process.env.BUNNYCDN_API_KEY;
const BUNNYCDN_STORAGE_ZONE = process.env.BUNNYCDN_STORAGE_ZONE;
const BUNNYCDN_REGION = process.env.BUNNYCDN_REGION;
const BASE_URL = `https://${BUNNYCDN_REGION}.storage.bunnycdn.com/${BUNNYCDN_STORAGE_ZONE}`;

const bunnyCDNClient = axios.create({
  baseURL: BASE_URL,
  headers: { AccessKey: BUNNYCDN_API_KEY },
});

// Example function to upload a file
async function uploadFile(filePath, fileContent) {
  try {
    const response = await bunnyCDNClient.put(filePath, fileContent);
    return response.data;
  } catch (error) {
    console.error("Error uploading to BunnyCDN:", error);
    throw error;
  }
}

module.exports = {
  BASE_URL,
  uploadFile,
  // ... other functions like deleteFile, getFile, etc.
};

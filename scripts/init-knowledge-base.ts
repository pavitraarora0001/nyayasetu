
import { GoogleAIFileManager } from "@google/generative-ai/server";
import dotenv from "dotenv";
import path from "path";

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error("❌ Error: GEMINI_API_KEY not found in .env");
    process.exit(1);
}

const fileManager = new GoogleAIFileManager(API_KEY);

async function uploadConstitution() {
    const filePath = path.resolve(process.cwd(), "constitution of India.pdf");
    console.log(`📤 Uploading: ${filePath}...`);

    try {
        const uploadResponse = await fileManager.uploadFile(filePath, {
            mimeType: "application/pdf",
            displayName: "Constitution of India (Global Knowledge Base)"
        });

        console.log(`✅ Upload Success!`);
        console.log(`---------------------------------------------------`);
        console.log(`FILE URI: ${uploadResponse.file.uri}`);
        console.log(`---------------------------------------------------`);
        console.log(`\n👇 ACTION REQUIRED:`);
        console.log(`Add this line to your .env file to enable global access:`);
        console.log(`LEGAL_PDF_URI=${uploadResponse.file.uri}`);

    } catch (error) {
        console.error("❌ Upload Failed:", error);
    }
}

uploadConstitution();

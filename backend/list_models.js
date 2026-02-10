import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function listModels() {
    try {
        const modelList = await genAI.listModels();
        console.log("Available models:");
        modelList.models.forEach(m => {
            console.log(`- ${m.name}: ${m.supportedGenerationMethods}`);
        });
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();

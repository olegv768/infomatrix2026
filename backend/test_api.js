import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function test() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const result = await model.generateContent("Say hello");
        const response = await result.response;
        console.log(response.text());
    } catch (error) {
        console.error("Test failed:", error);
    }
}

test();

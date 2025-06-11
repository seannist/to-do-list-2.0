import { Mistral } from "@mistralai/mistralai";
import fs from 'fs';

// Base64 Image Analysis
async function encodeImage(imagePath: string): Promise<string | null> {
    try {
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');
        return base64Image;
    } catch (error) {
        console.error(`Error encoding image: ${error}`);
        return null;
    }
}

export async function analyzeBase64Image(imagePath: string): Promise<string | null> {
    try {
        const base64Image = await encodeImage(imagePath);
        if (!base64Image) {
            throw new Error('Failed to encode image');
        }

        const apiKey = process.env.MISTRAL_API_KEY;
        if (!apiKey) {
            throw new Error('MISTRAL_API_KEY is not set in environment variables');
        }

        const client = new Mistral({ apiKey });

        const chatResponse = await client.chat.complete({
            model: "pixtral-12b",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "What's in this image?" },
                        {
                            type: "image_url",
                            imageUrl: `data:image/jpeg;base64,${base64Image}`,
                        },
                    ],
                },
            ],
        });

        const content = chatResponse.choices[0]?.message?.content;
        return typeof content === 'string' ? content : null;
    } catch (error) {
        console.error(`Error analyzing base64 image: ${error}`);
        return null;
    }
}

// URL Image Analysis
export async function analyzeImageUrl(imageUrl: string): Promise<string | null> {
    try {
        const apiKey = process.env.MISTRAL_API_KEY;
        if (!apiKey) {
            throw new Error('MISTRAL_API_KEY is not set in environment variables');
        }

        const client = new Mistral({ apiKey });

        const chatResponse = await client.chat.complete({
            model: "pixtral-12b",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "What's in this image?" },
                        {
                            type: "image_url",
                            imageUrl: imageUrl,
                        },
                    ],
                },
            ],
        });

        const content = chatResponse.choices[0]?.message?.content;
        return typeof content === 'string' ? content : null;
    } catch (error) {
        console.error(`Error analyzing image URL: ${error}`);
        return null;
    }
} 
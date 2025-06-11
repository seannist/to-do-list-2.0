import fs from 'fs';
import { Mistral } from '@mistralai/mistralai';

async function encodeImage(imagePath: string): Promise<string | null> {
    try {
        // Read the image file as a buffer
        const imageBuffer = fs.readFileSync(imagePath);

        // Convert the buffer to a Base64-encoded string
        const base64Image = imageBuffer.toString('base64');
        return base64Image;
    } catch (error) {
        console.error(`Error encoding image: ${error}`);
        return null;
    }
}

export async function analyzeImage(imagePath: string): Promise<string | null> {
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

        return chatResponse.choices[0]?.message?.content || null;
    } catch (error) {
        console.error(`Error analyzing image: ${error}`);
        return null;
    }
} 
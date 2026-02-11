import { GoogleGenAI } from "@google/genai";
import { CARS } from "../constants";

let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (!aiClient) {
    const apiKey = process.env.API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
};

export const getCarRecommendation = async (userQuery: string): Promise<string> => {
  const client = getClient();
  if (!client) {
    return "I'm currently offline (API Key missing). Please explore our fleet manually!";
  }

  const carContext = CARS.map(c => 
    `${c.name} (${c.category}): $${c.pricePerDay}/day. Features: ${c.features.join(', ')}. Range: ${c.range}.`
  ).join('\n');

  const prompt = `
    You are Aero, an AI assistant for a futuristic car rental agency called AeroDrive.
    Here is our current fleet:
    ${carContext}

    User Query: "${userQuery}"

    Rules:
    1. Recommend the best car based on the user's needs.
    2. Be concise, futuristic, and professional.
    3. Use a tone that implies high-tech luxury.
    4. If the user asks about something unrelated, politely steer them back to cars.
    5. Do not use markdown formatting like bold or italics, just plain text is fine for the chat bubble.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-lite-preview',
      contents: prompt,
    });
    return response.text || "I'm processing a vast amount of data... try again in a moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Communication systems disrupted. Please try again later.";
  }
};

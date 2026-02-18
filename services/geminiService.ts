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

  const systemInstruction = `
    You are Aero, an AI assistant for a futuristic car rental agency called Atellas Fleet.
    Here is our current fleet:
    ${carContext}

    Rules:
    1. Recommend the best car based on the user's needs.
    2. Be concise, futuristic, and professional.
    3. Use a tone that implies high-tech luxury (e.g., "Processing request", "Optimal choice identified").
    4. If the user asks about something unrelated, politely steer them back to cars.
    5. Do not use markdown formatting like bold or italics, just plain text.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    return response.text || "I'm processing a vast amount of data... try again in a moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Communication systems disrupted. Please try again later.";
  }
};
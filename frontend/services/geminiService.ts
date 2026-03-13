import { GoogleGenerativeAI } from "@google/generative-ai";
import { CARS } from "../constants";

let aiClient: GoogleGenerativeAI | null = null;

const getClient = () => {
  if (!aiClient) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenerativeAI(apiKey);
    } else {
      console.warn("VITE_GEMINI_API_KEY is not defined");
    }
  }
  return aiClient;
};

export const getCarRecommendation = async (userQuery: string): Promise<string> => {
  const client = getClient();
  if (!client) {
    return "Je suis actuellement hors ligne (Clé API manquante). Veuillez explorer notre flotte manuellement !";
  }

  const carContext = CARS.map(c => 
    `${c.name} (${c.category}): $${c.pricePerDay}/jour. Caractéristiques: ${c.features.join(', ')}. Autonomie: ${c.range}.`
  ).join('\n');

  const systemInstruction = `
    Vous êtes Aero, un assistant IA pour une agence de location de voitures futuriste appelée Atellas Fleet.
    Voici notre flotte actuelle :
    ${carContext}

    Règles :
    1. Recommandez la meilleure voiture en fonction des besoins de l'utilisateur.
    2. Soyez concis, futuriste et professionnel.
    3. Utilisez un ton qui implique le luxe high-tech (par exemple, "Traitement de la demande", "Choix optimal identifié").
    4. Si l'utilisateur pose une question sans rapport, ramenez-le poliment vers les voitures.
    5. N'utilisez pas de formatage markdown comme le gras ou l'italique, juste du texte brut.
    6. Répondez toujours en français.
  `;

  try {
    const model = client.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        systemInstruction: systemInstruction 
    });
    
    const result = await model.generateContent(userQuery);
    const response = await result.response;
    return response.text() || "Je traite une grande quantité de données... réessayez dans un instant.";
  } catch (error) {
    console.error("Gemini API Error Details:", error);
    return "Systèmes de communication perturbés. Veuillez réessayer plus tard.";
  }
};

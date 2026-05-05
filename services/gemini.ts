import { GoogleGenAI } from "@google/genai";

// A chave da API é carregada do arquivo .env (VITE_GEMINI_API_KEY)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

const client = new GoogleGenAI({
  apiKey: API_KEY,
});

/**
 * Envia um prompt para o Gemini e retorna um stream de texto.
 * Utilizado para gerar descrições de imóveis de alto luxo.
 */
export async function* sendMessageStream(prompt: string, history: any[] = []) {
  try {
    if (!API_KEY) {
      throw new Error("VITE_GEMINI_API_KEY não configurada no arquivo .env");
    }

    const response = await client.models.generateContentStream({
      model: "gemini-2.0-flash", // Modelo ultra-rápido para descrições
      contents: [
        ...history,
        { role: "user", parts: [{ text: prompt }] }
      ]
    });

    for await (const chunk of response.stream) {
      const text = chunk.text();
      if (text) {
        yield { text };
      }
    }
  } catch (error: any) {
    console.error("Erro na IA (Gemini):", error);
    yield { 
      text: `\n[Erro IA]: ${error.message || "Falha na conexão com o serviço Gemini."}` 
    };
  }
}

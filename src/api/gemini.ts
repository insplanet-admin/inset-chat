import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

const askGemini = async (
  modelName: string,
  messages: any[],
  stream = true,
  options?: any,
): Promise<string> => {
  const systemInstruction = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n");

  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const config: any = {
    temperature: options?.temperature ?? 0.1,
  };

  if (systemInstruction) {
    config.systemInstruction = systemInstruction;
  }

  if (options?.format === "json") {
    config.responseMimeType = "application/json";
  }

  if (!stream) {
    const response = await genAI.models.generateContent({
      model: modelName,
      contents: contents,
      config: config,
    });
    return response.text || "";
  }

  const responseStream = await genAI.models.generateContentStream({
    model: modelName,
    contents: contents,
    config: config,
  });

  let rawResponse = "";

  for await (const chunk of responseStream) {
    rawResponse += chunk.text;

    // console.log(`[실시간]: ${chunk.text}`);
  }

  return rawResponse;
};

export { askGemini };

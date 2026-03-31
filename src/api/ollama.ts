const OLLAMA_URL = "http://localhost:11434";

export async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: import.meta.env.VITE_LLAMA_EMBEDDING_MODEL,
      prompt: text,
    }),
  });

  if (!response.ok)
    throw new Error(`Ollama Embedding Error: ${response.status}`);
  const result = await response.json();
  return result.embedding;
}

export async function askOllama(
  model: string,
  messages: any[],
  stream = true,
  options?: any,
): Promise<string> {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, stream, options }),
  });

  if (!response.ok) throw new Error(`Ollama Error: ${response.status}`);

  if (!stream) {
    const result = await response.json();
    return result.message.content;
  }

  if (!response.body) throw new Error("응답 Body가 없습니다.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let rawResponse = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    let lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.trim() === "") continue;
      try {
        const parsedChunk = JSON.parse(line);
        if (parsedChunk.message?.content) {
          rawResponse += parsedChunk.message.content;
        }
      } catch (e) {
        console.error("청크 파싱 에러:", e);
      }
    }
  }
  return rawResponse;
}

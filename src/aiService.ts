import { supabase } from "./utils";
// 문서 -> text library
import * as mammoth from "mammoth";
import * as XLSX from "xlsx";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface PostChatParams {
  id: string;
  message: string;
}
interface ChatResponse {
  text: string;
}
type ChatIntent = "search" | "chat";
const OLLAMA_URL = "http://localhost:11434";

const RESUME_JSON_SCHEMA = {
  name: "임재혁",
  birthDate: "1990.05.12 (만 34세)",
  jobTitle: "프론트엔드 개발자",
  gender: "남",
  totalExperience: "5년 9개월",
  skillRating: "중급",
  address: "서울특별시 강남구 테헤란로 123, 101동 202호",
  education: [
    {
      date: "2009.03 ~ 2013.02",
      school: "한국대학교",
      specialty: "컴퓨터공학과",
      state: "졸업",
    },
  ],
  experience: [
    {
      period: "2020.01 ~ 2023.12",
      company: "인스플래닛(주)",
      department: "개발그룹",
      position: "책임",
      task: "React 웹 서비스 개발",
    },
  ],
  abilities: [
    {
      desc: "프론트엔드 개발자로서 React와 Next.js를 활용한 웹 애플리케이션 구축에 능숙하며,",
    },
  ],
  skill: [
    {
      name: "React / Next.js",
      level: "상",
      note: "실무 3년, SSR 및 상태관리 능숙",
    },
  ],
  certificate: [
    { name: "정보처리기사", issuer: "한국산업인력공단", date: "2013.08" },
  ],
  lang: [{ name: "영어", test: "TOEIC", score: "850점", date: "2022.05" }],
  career: [
    {
      name: "제5회 핀테크 해커톤 챔피언십",
      award: "대상",
      host: "금융위원회",
      date: "2019.10",
    },
  ],
  project: [
    {
      date: "2022.06 ~ 2023.12",
      name: "차세대 자산관리 웹 플랫폼 구축",
      customer: "A은행",
      part: "프론트엔드 리드",
      responsibility: "Next.js 기반 아키텍처 설계",
    },
  ],
};

const RESUME_PARSER_PROMPT = `
[CRITICAL Instructions]
1. STRICT FACTUALITY: Extract ONLY the information present in the [Resume Content]. If missing, leave as "" or [].
2. NEVER TRANSLATE JSON KEYS: You MUST keep the exact English keys provided. The values must be in Korean.
3. 'abilities' ARRAY: The 'abilities' field MUST BE AN ARRAY OF OBJECTS: [{"desc": "sentence 1"}].

[JSON OUTPUT FORMAT REQUIRED]
\`\`\`json\n${JSON.stringify(RESUME_JSON_SCHEMA, null, 2)}\n\`\`\`
`;

/** Ollama embedding API */
async function getEmbedding(text: string): Promise<number[]> {
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

/** Ollama 채팅 생성기 (스트리밍 및 포맷 지원) */
async function askOllama(
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

  // 스트리밍을 사용하지 않을 때
  if (!stream) {
    const result = await response.json();
    return result.message.content;
  }

  // 스트리밍을 사용할 때 (버퍼링 로직)
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
          // 실시간 출력이 필요하면 아래 주석 해제
          // console.log(`[실시간]: ${parsedChunk.message.content}`);
        }
      } catch (e) {
        console.error("청크 파싱 에러:", e);
      }
    }
  }
  return rawResponse;
}

async function postChatToType({
  message,
}: PostChatParams): Promise<ChatIntent> {
  try {
    const messages = [
      {
        role: "system",
        content: `당신은 질문 의도를 분류하는 라우터 AI입니다. 
            인재(사람, 이력서, 후보자, 개발자) 검색은 "search", 날씨, 인사 등은 "chat"으로 분류하세요. 
            반드시 JSON 형식으로만 응답해야 합니다.`,
      },
      { role: "user", content: "리액트 3년차 프론트엔드 개발자 찾아줘" },
      { role: "assistant", content: `{"type": "search"}` },
      { role: "user", content: "오늘 날씨 어때요?" },
      { role: "assistant", content: `{"type": "chat"}` },
      { role: "user", content: message },
    ];

    const content = await askOllama(
      import.meta.env.VITE_LLAMA_TYPE_MODEL,
      messages,
      false,
    );

    try {
      const parsedData = JSON.parse(content);
      return parsedData.type === "search" ? "search" : "chat";
    } catch {
      return "chat";
    }
  } catch (error) {
    console.error("라우터 통신 에러:", error);
    return "chat";
  }
}

/** vectorDB 검색 후 AI */
async function postChatWithSupabase({
  message,
}: PostChatParams): Promise<ChatResponse> {
  try {
    const queryVector = await getEmbedding(message);

    const { data: matchedCandidates, error } = await supabase.rpc(
      "match_users",
      {
        query_embedding: queryVector,
        match_threshold: 0.4,
        match_count: 3,
      },
    );

    if (error) throw new Error(`Vector Search Error: ${error.message}`);

    if (!matchedCandidates || matchedCandidates.length === 0) {
      return { text: "검색 조건에 맞는 인재가 없습니다." };
    }

    const minimalCandidates = matchedCandidates.map((c: any) => ({
      id: c.id,
      name: c.name,
      skill: c.skills_summary || "",
      summary: c.parsed_data?.abilities?.[0]?.desc || c.job_title || "",
      email: c.parsed_data?.email || "정보 없음",
    }));

    const prompt = `Review the [Candidates] against the [Query]. Return a JSON array containing ALL these candidates with a 1-sentence "reason" in Korean explaining why they match.\n\n[Query]\n"${message}"\n\n[Candidates]\n${JSON.stringify(minimalCandidates)}`;

    const messages = [
      {
        role: "system",
        content:
          "You are an expert HR Assistant. You MUST output ONLY valid JSON array.",
      },
      { role: "user", content: prompt },
    ];

    const resultText = await askOllama(
      import.meta.env.VITE_LLAMA_TEXT_MODEL,
      messages,
      true,
    );
    return { text: resultText };
  } catch (error) {
    console.error("AI Vector Search error:", error);
    throw new Error("AI 처리 및 벡터 검색 중 오류가 발생했습니다.");
  }
}

/** 사용자의 질문 분석 후 답변 */
export async function postChat(params: PostChatParams): Promise<ChatResponse> {
  try {
    const intentType = await postChatToType(params);
    console.log(`Flow: ${intentType}`);

    if (intentType === "search") {
      return await postChatWithSupabase(params);
    } else {
      return { text: "사용자 검색만 부탁드립니다." };
    }
  } catch (error) {
    console.error("postChat Error:", error);
    throw new Error("대화 처리 중 오류가 발생했습니다.");
  }
}

/** file -> text Function */
async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  try {
    if (extension === "txt") return await file.text();

    if (extension === "pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText +=
          textContent.items.map((item: any) => item.str).join(" ") + "\n";
      }
      return fullText.trim();
    }

    if (extension === "docx") {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value.trim();
    }

    if (extension === "xlsx" || extension === "xls") {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      let fullText = "";
      workbook.SheetNames.forEach((sheetName) => {
        const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
        fullText += `\n--- Sheet: ${sheetName} ---\n${csv}\n`;
      });
      return fullText.trim();
    }

    if (extension === "hwp") {
      const arrayBuffer = await file.arrayBuffer();
      const HWP = await import("hwp.js");
      const getModel =
        (HWP as any).getHwpModel || (HWP as any).default?.getHwpModel;
      const hwpModel = getModel(new Uint8Array(arrayBuffer));
      let fullText = "";
      hwpModel.sections.forEach((s: any) =>
        s.paragraphs.forEach((p: any) => {
          p.texts?.forEach((t: any) => t.text && (fullText += t.text));
          fullText += "\n";
        }),
      );
      return fullText.trim();
    }

    throw new Error(`지원하지 않는 파일 형식: ${extension}`);
  } catch (error) {
    console.error("파일 파싱 에러:", error);
    return "";
  }
}

/** 이력서 분석 후 DB 저장. */
export async function parseAndSaveResume(file: File) {
  try {
    const extractedText = await extractTextFromFile(file);
    if (!extractedText)
      throw new Error("파일에서 텍스트를 추출할 수 없습니다.");

    const messages = [
      {
        role: "system",
        content: "You are a strict Resume Parser. Output ONLY valid JSON.",
      },
      {
        role: "user",
        content: `${RESUME_PARSER_PROMPT}\n\n[Resume Content]\n${extractedText}`,
      },
    ];

    const rawResponse = await askOllama(
      import.meta.env.VITE_LLAMA_TEXT_MODEL,
      messages,
      true,
      {
        num_ctx: 8192,
        temperature: 0.1,
        stop: ["<|endoftext|>", "<|im_start|>", "<|im_end|>", "Question:"],
      },
    );

    const startIndex = rawResponse.indexOf("{");
    const lastIndex = rawResponse.lastIndexOf("}");
    if (startIndex === -1 || lastIndex === -1)
      throw new Error("JSON 객체를 찾을 수 없습니다.");

    const cleanJsonString = rawResponse
      .substring(startIndex, lastIndex + 1)
      .replace(/[\u0000-\u0019]+/g, "");
    let parsedData = JSON.parse(cleanJsonString);

    if (Array.isArray(parsedData.abilities)) {
      parsedData.abilities = parsedData.abilities.map((item: any) =>
        typeof item === "string" ? { desc: item } : item,
      );
    }

    const skillString = (parsedData.skill || [])
      .map((s: any) => s.name)
      .join(", ");
    const abilityString = (parsedData.abilities || [])
      .map((a: any) => a.desc)
      .join(" ");
    const projectString = (parsedData.project || [])
      .map((p: any) => p.name)
      .join(", ");
    const textToEmbed =
      `직무: ${parsedData.jobTitle}\n기술스택: ${skillString}\n핵심역량: ${abilityString}\n주요경험: ${projectString}`.trim();

    const vector = await getEmbedding(textToEmbed);

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          name: parsedData.name?.replace(/\s+/g, "") || "이름없음",
          job_title: parsedData.jobTitle || "직무미상",
          skills_summary: skillString,
          parsed_data: parsedData,
          embedding: vector,
        },
      ])
      .select();

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error("이력서 처리 오류:", error);
    throw new Error("이력서 분석 또는 저장에 실패했습니다.");
  }
}

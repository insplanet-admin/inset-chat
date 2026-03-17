import { supabase, genAI } from "./utils";
import * as mammoth from "mammoth";
import * as XLSX from "xlsx";
import * as pdfjsLib from "pdfjs-dist";

import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface Candidate {
  name: string;
  skill: string | null;
  summary: string | null;
  email: string | null;
  phoneNumber: string | null;
}

interface PostChatParams {
  id: string;
  message: string;
}

interface ChatResponse {
  text: string;
}

export async function postChatToSLLM({
  message,
  history = [], // 이전 대화 기록을 담을 배열 (옵션)
}: {
  id: string;
  message: string;
  history?: any[];
}): Promise<ChatResponse> {
  try {
    // 1. Ollama API 호출
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: import.meta.env.VITE_LLAMA_TEXT_MODEL,
        messages: [
          // 시스템 프롬프트: 챗봇의 자아 설정
          {
            role: "system",
            content: "너는 사내 인트라넷의 친절한 AI 비서야.",
          },
          // (선택) 이전 대화 기록이 있다면 여기에 펼쳐줍니다.
          ...history,
          // 현재 사용자의 질문
          { role: "user", content: message },
        ],
        stream: false, // MVP 단계이므로 한꺼번에 받기
      }),
    });

    if (!response.ok) {
      throw new Error(
        "Ollama 서버와 연결할 수 없습니다. 서버가 켜져 있는지 확인해주세요.",
      );
    }

    const result = await response.json();
    const aiText = result.message.content;

    return { text: aiText };
  } catch (error) {
    console.error("sLLM Chat Error:", error);
    throw new Error("대화 처리 중 오류가 발생했습니다.");
  }
}

export async function postChatWithSupabase({
  message,
}: PostChatParams): Promise<ChatResponse> {
  try {
    // 1. 사용자 질문(message)을 벡터로 변환 (Ollama bge-m3 사용)
    console.log("사용자 질문:", message);
    const embedResponse = await fetch("http://localhost:11434/api/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: import.meta.env.VITE_LLAMA_EMBEDDING_MODEL,
        prompt: message,
      }),
    });

    console.log("Ollama 임베딩 응답:", embedResponse.ok);

    if (!embedResponse.ok) {
      throw new Error(`Ollama Embedding Error: ${embedResponse.status}`);
    }

    const embedResult = await embedResponse.json();
    const queryVector = embedResult.embedding;

    const { data: matchedCandidates, error } = await supabase.rpc(
      "match_resumes",
      {
        query_embedding: queryVector,
        match_threshold: 0.5,
        match_count: 3,
      },
    );

    if (error) {
      throw new Error(`Vector Search Error: ${error.message}`);
    }

    if (!matchedCandidates || matchedCandidates.length === 0) {
      return { text: "[]" };
    }

    const minimalCandidates = matchedCandidates.map((c) => ({
      name: c.name,
      skill: c.skill,
      summary: c.summary,
      email: c.email,
      phoneNumber: c.phoneNumber,
    }));

    const prompt = `
      Task: Review the [Candidates] against the [Query].
      Return a JSON array containing ALL these candidates.
      For each, write a 1-sentence "reason" in Korean explaining the match.

      [Query]
        "${message}"

      [Candidates]
        ${JSON.stringify(minimalCandidates)}
    `;

    const jsonSchema = {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          skill: { type: "string" },
          summary: { type: "string" },
          email: { type: "string" },
          phoneNumber: { type: "string" },
          reason: { type: "string" },
        },
        required: [
          "name",
          "skill",
          "summary",
          "email",
          "phoneNumber",
          "reason",
        ],
      },
    };

    const llamaResponse = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: import.meta.env.VITE_LLAMA_TEXT_MODEL,
        prompt: prompt,
        stream: false,
        format: jsonSchema,
        options: {
          temperature: 0.1,
          num_predict: 800,
        },
        keep_alive: 0,
      }),
    });

    if (!llamaResponse.ok) {
      throw new Error(`Ollama LLM Error: ${llamaResponse.status}`);
    }

    const llamaResult = await llamaResponse.json();

    // 로컬 LLM이 반환한 결과 텍스트 (JSON 형태의 문자열)
    const resultText = llamaResult.response;

    console.log("최종 분석 결과:", resultText);

    return { text: resultText };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    console.error("AI Vector Search error:", errorMessage);

    throw new Error("AI 처리 및 벡터 검색 중 오류가 발생했습니다.");
  }
}

/** 파일에서 텍스트를 추출하는 헬퍼 함수 */
export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  try {
    // 1. TXT 파일
    if (extension === "txt") {
      return await file.text();
    }

    // 2. PDF 파일 (이력서 파싱의 핵심!)
    else if (extension === "pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        // 각 줄의 텍스트를 모아서 하나의 문자열로 합칩니다.
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n";
      }
      return fullText.trim();
    }

    // 3. DOCX 파일 (Word)
    else if (extension === "docx") {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value.trim();
    }

    // 4. XLSX / XLS 파일 (Excel)
    else if (extension === "xlsx" || extension === "xls") {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      let fullText = "";

      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        // CSV 형태로 변환하면 AI가 표 구조를 훨씬 잘 이해합니다.
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        fullText += `\n--- Sheet: ${sheetName} ---\n${csv}\n`;
      });
      return fullText.trim();
    }

    // 5. HWP 파일 (한글)
    else if (extension === "hwp") {
      // 사용자님이 작성하신 훌륭한 로직을 안전하게 감쌌습니다.
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const HWP = await import("hwp.js");
      const getModel =
        (HWP as any).getHwpModel || (HWP as any).default?.getHwpModel;

      if (!getModel) throw new Error("hwp.js 로드 실패");

      const hwpModel = getModel(uint8Array);
      let fullText = "";

      hwpModel.sections.forEach((section: any) => {
        section.paragraphs.forEach((para: any) => {
          if (para.texts) {
            para.texts.forEach((t: any) => {
              if (t.text) fullText += t.text;
            });
          }
          if (para.controls) {
            para.controls.forEach((control: any) => {
              if (control.type === "table") {
                control.rows.forEach((row: any) => {
                  row.cells.forEach((cell: any) => {
                    cell.paragraphs.forEach((cellPara: any) => {
                      cellPara.texts.forEach((ct: any) => {
                        if (ct.text) fullText += ` [셀:${ct.text}] `;
                      });
                    });
                  });
                });
              }
            });
          }
          fullText += "\n";
        });
      });
      return fullText.trim();
    }

    // 6. 지원하지 않는 포맷
    else {
      throw new Error(`지원하지 않는 파일 형식입니다: ${extension}`);
    }
  } catch (error) {
    console.error(`${extension} 파일 파싱 중 에러 발생:`, error);
    // 에러가 나면 앱이 터지지 않도록 빈 문자열이나 에러 메시지를 반환합니다.
    return "";
  }
}

export async function parseAndSaveResume(file: File) {
  try {
    const extractedText = await extractTextFromFile(file);

    console.log("추출된 이력서 텍스트:", extractedText);

    if (!extractedText || extractedText.trim() === "") {
      throw new Error(
        "파일에서 텍스트를 읽을 수 없습니다. (빈 파일이거나 스캔된 이미지/지원하지 않는 형식일 수 있습니다.)",
      );
    }

    const jsonSchema = {
      type: "object",
      properties: {
        name: { type: "string" },
        skill: { type: "string" },
        summary: { type: "string" },
        email: { type: "string" },
        phonenumber: { type: "string" },
      },
      required: ["name", "skill", "summary", "email", "phonenumber"],
    };

    const prompt = `
[Role] You are a Resume Parser. Extract structured data from the resume.

[Target Columns & Instructions]
- name: Candidate's name.
- skill: Technical skills (comma-separated). IF YOU SEE certifications (e.g., "정보처리기사", "컴활"), INFER the software/tools (e.g., "Excel, Software Engineering") and include them.
- summary: 1-2 sentences professional summary in KOREAN. Generate one if missing.
- email: Email address.
- phoneNumber: Phone number (010-XXXX-XXXX).

[Resume Content]
${extractedText}

[Output]
Return ONLY a raw JSON object exactly like this example:
{
  "name": "홍길동",
  "skill": "React, Excel, Word",
  "summary": "프론트엔드 개발 및 데이터 분석 역량을 갖춘 인재입니다.",
  "email": "hong@example.com",
  "phoneNumber": "010-1234-5678"
}
`;

    const llamaResponse = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: import.meta.env.VITE_LLAMA_TEXT_MODEL,
        prompt: prompt,
        stream: false,
        format: jsonSchema,
        keep_alive: 0,
        options: {
          temperature: 0.1,
          num_predict: 1000,
        },
      }),
    });

    if (!llamaResponse.ok) {
      throw new Error(`Ollama LLM Error: ${llamaResponse.status}`);
    }

    const llamaResult = await llamaResponse.json();
    let rawText = llamaResult.response || "{}";

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      rawText = jsonMatch[0];
    }

    const parsedData = JSON.parse(rawText);

    console.log("ai가 추출한 데이터:", parsedData);

    // 2. 임베딩용 텍스트 생성
    const textToEmbed = `스킬: ${parsedData.skill || ""}. 요약: ${parsedData.summary || ""}`;

    // 3. Ollama (bge-m3) API 호출: 텍스트를 벡터로 변환 (1024차원)
    const embedResponse = await fetch("http://localhost:11434/api/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: import.meta.env.VITE_LLAMA_EMBEDDING_MODEL,
        prompt: textToEmbed,
        keep_alive: 0,
      }),
    });

    if (!embedResponse.ok) {
      throw new Error(`Ollama Embedding Error: ${embedResponse.status}`);
    }

    const embedResult = await embedResponse.json();
    const vector = embedResult.embedding; // 생성된 1024차원 벡터 배열

    // 4. Supabase DB에 저장 (테이블명 'resumes' 적용)
    const { data, error } = await supabase
      .from("resumes")
      .insert([
        {
          name: parsedData.name.replace(/\s+/g, ""),
          skill: parsedData.skill,
          summary: parsedData.summary,
          email: parsedData.email,
          phonenumber: parsedData.phonenumber,
          embedding: vector,
        },
      ])
      .select();

    if (error) throw new Error(error.message);

    console.log("DB에 저장완.");

    return data;
  } catch (error) {
    console.error("이력서 처리 중 오류:", error);
    throw new Error("이력서 분석 또는 저장에 실패했습니다.");
  }
}

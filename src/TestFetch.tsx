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

type ChatIntent = "search" | "chat";

async function postChatToType({
  message,
}: {
  message: string;
}): Promise<ChatIntent> {
  try {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: import.meta.env.VITE_LLAMA_TYPE_MODEL,
        messages: [
          {
            role: "system",
            // 주의: 시스템 프롬프트에 불필요한 들여쓰기(스페이스)를 없앴습니다.
            content: `당신은 질문 의도를 분류하는 라우터 AI입니다. 
              인재(사람, 이력서, 후보자, 개발자)를 검색하는 의도라면 "search", 그 외의 날씨, 인사, 일반 질문 등은 모두 "chat"으로 분류하세요. 
              반드시 오직 JSON 형식으로만 응답해야 합니다.`,
          },
          // AI가 패턴을 따라 할 수 있도록 '모범 답안(Few-shot)'을 쥐여줍니다.
          { role: "user", content: "리액트 3년차 프론트엔드 개발자 찾아줘" },
          { role: "assistant", content: `{"type": "search"}` },
          { role: "user", content: "오늘 날씨 어때요?" },
          { role: "assistant", content: `{"type": "chat"}` },
          { role: "user", content: "정보처리기사 자격증 있는 사람 있어?" },
          { role: "assistant", content: `{"type": "search"}` },
          { role: "user", content: message },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(
        "Ollama 서버와 연결할 수 없습니다. 서버가 켜져 있는지 확인해주세요.",
      );
    }

    const result = await response.json();

    const aiText = result.message.content;

    try {
      const parsedData = JSON.parse(aiText);

      if (parsedData.type === "search" || parsedData.type === "chat") {
        console.log(`라우터 질문: "${message}" 분류: ${parsedData.type}`);
        return parsedData.type;
      }

      return "chat";
    } catch (parseError) {
      console.error("라우터 파싱 실패. AI가 뱉은 원본:", aiText);
      return "chat";
    }
  } catch (error) {
    console.error("sLLM Chat Error:", error);
    throw new Error("대화 처리 중 오류가 발생했습니다.");
  }
}

async function postChatWithSupabase({
  message,
}: PostChatParams): Promise<ChatResponse> {
  try {
    const embedResponse = await fetch("http://localhost:11434/api/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: import.meta.env.VITE_LLAMA_EMBEDDING_MODEL,
        prompt: message,
      }),
    });

    if (!embedResponse.ok) {
      throw new Error(`Ollama Embedding Error: ${embedResponse.status}`);
    }

    const embedResult = await embedResponse.json();
    const queryVector = embedResult.embedding;

    const { data: matchedCandidates, error } = await supabase.rpc(
      "match_users",
      {
        query_embedding: queryVector,
        match_threshold: 0.4,
        match_count: 3,
      },
    );

    if (error) {
      throw new Error(`Vector Search Error: ${error.message}`);
    }

    // 조건에 맞는 사람이 없으면 빈 배열 반환
    if (!matchedCandidates || matchedCandidates.length === 0) {
      console.log("검색 조건에 맞는 인재가 없습니다.");
      return { text: "검색 조건에 맞는 인재가 없습니다." };
    }

    const minimalCandidates = matchedCandidates.map((c: any) => ({
      id: c.id,
      name: c.name,
      skill: c.skills_summary || "",
      summary: c.parsed_data?.abilities?.[0]?.desc || c.job_title || "",
      email: c.parsed_data?.email || "정보 없음",
      phoneNumber: c.parsed_data?.phoneNumber || "정보 없음",
    }));

    console.log("벡터 검색 결과:", minimalCandidates);

    const prompt = `
      [Role] You are an expert HR Assistant.
      [Task] Review the [Candidates] against the [Query].
      Return a JSON array containing ALL these candidates.
      For each candidate, write a 1-sentence "reason" in Korean explaining why their skills and experience match the user's query.

      [Query]
      "${message}"

      [Candidates]
      ${JSON.stringify(minimalCandidates)}
    `;

    const llamaResponse = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: import.meta.env.VITE_LLAMA_TEXT_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are an expert HR Assistant. You MUST output ONLY valid JSON array. Do not add any conversational text.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: false,
      }),
    });

    console.log("AI 분석 결과:", llamaResponse);

    if (!llamaResponse.ok) {
      throw new Error(`Ollama LLM Error: ${llamaResponse.status}`);
    }

    const llamaResult = await llamaResponse.json();

    console.log("LLM이 반환한 원본 데이터:", llamaResult);
    let resultText = llamaResult.message.content;

    console.log("최종 AI 분석 결과:", resultText);

    return { text: resultText };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    console.error("AI Vector Search error:", errorMessage);

    throw new Error("AI 처리 및 벡터 검색 중 오류가 발생했습니다.");
  }
}

export async function postChat(params: PostChatParams): Promise<ChatResponse> {
  try {
    const intentType = await postChatToType({ message: params.message });

    if (intentType == "search") {
      console.log("search flow");

      const searchResult = await postChatWithSupabase(params);
      return searchResult;
    } else {
      console.log("chat flow");
      return { text: "안됩니다." };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";

    throw new Error("post Chat Error");
  }
}

/** 파일에서 텍스트를 추출하는 헬퍼 함수 */
async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  try {
    // 1. TXT 파일
    if (extension === "txt") {
      return await file.text();
    }

    // 2. PDF 파일
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
      name: "임재혁",
      birthDate: "1990.05.12 (만 34세)",
      jobTitle: "프론트엔드 개발자",
      gender: "남",

      // 새로 채워진 기본 정보
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
        {
          date: "2006.03 ~ 2009.02",
          school: "서울제일고등학교",
          specialty: "이과",
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
        {
          period: "2018.03 ~ 2019.12",
          company: "테스트컴퍼니",
          department: "기획팀",
          position: "대리",
          task: "서비스 운영 및 유지보수",
        },
      ],

      abilities: [
        {
          desc: "프론트엔드 개발자로서 React와 Next.js를 활용한 웹 애플리케이션 구축에 능숙하며,",
        },
        { desc: "TypeScript를 사용하여 안정적인 코드 작성이 가능합니다." },
        {
          desc: "또한, Figma를 활용한 UI/UX 협업 경험이 있어 디자이너와 원활한 소통이 가능합니다.",
        },
        {
          desc: "다양한 프로젝트에서 프론트엔드 리드 역할을 수행하며, 아키텍처 설계부터 공통 컴포넌트 라이브러리 구축까지 폭넓은 경험을 보유하고 있습니다.",
        },
      ],

      skill: [
        {
          name: "React / Next.js",
          level: "상",
          note: "실무 3년, SSR 및 상태관리 능숙",
        },
        {
          name: "TypeScript",
          level: "상",
          note: "타입 안정성을 고려한 설계 가능",
        },
        {
          name: "Figma",
          level: "중",
          note: "기본 편집 및 UI/UX 디자이너와 협업 가능",
        },
      ],

      certificate: [
        { name: "정보처리기사", issuer: "한국산업인력공단", date: "2013.08" },
        {
          name: "SQL 개발자 (SQLD)",
          issuer: "한국데이터산업진흥원",
          date: "2015.12",
        },
      ],

      lang: [
        { name: "영어", test: "TOEIC", score: "850점", date: "2022.05" },
        { name: "영어", test: "OPIc", score: "IM2", date: "2021.11" },
      ],

      career: [
        {
          name: "제5회 핀테크 해커톤 챔피언십",
          award: "대상 (금융위원장상)",
          host: "금융위원회",
          date: "2019.10",
        },
        {
          name: "사내 우수 사원 표창",
          award: "혁신상",
          host: "인스플래닛(주)",
          date: "2021.12",
        },
      ],

      project: [
        {
          date: "2022.06 ~ 2023.12",
          name: "차세대 자산관리 웹 플랫폼 구축",
          customer: "A은행",
          part: "프론트엔드 리드",
          responsibility:
            "Next.js 기반 아키텍처 설계, 공통 UI 컴포넌트 라이브러리 구축",
        },
        {
          date: "2020.03 ~ 2021.11",
          name: "사내 인트라넷 고도화 및 마이그레이션",
          customer: "인스플래닛(주)",
          part: "프론트엔드 개발",
          responsibility:
            "기존 jQuery 코드를 React로 마이그레이션, 렌더링 성능 30% 개선",
        },
      ],
    };

    const prompt = `
      [CRITICAL Instructions]
      1. STRICT FACTUALITY: 
        - Extract ONLY the information present in the [Resume Content].
        - If missing, leave strings as "" and arrays as []. NEVER invent data.

      2. NEVER TRANSLATE JSON KEYS ( MOST IMPORTANT):
        - You MUST keep the exact English keys provided in the [JSON OUTPUT FORMAT]. 
        - DO NOT translate the keys into Korean (e.g., NEVER use "이름" instead of "name", NEVER use "직무" instead of "jobTitle").
        - The values must be in Korean, but the keys MUST remain in English.

      3. 'abilities' ARRAY STRICT RULE:
        - The 'abilities' field MUST BE AN ARRAY OF OBJECTS: [{"desc": "sentence 1"}].
        - Write 3-4 professional sentences in Korean summarizing core competencies.

      [JSON OUTPUT FORMAT REQUIRED]
      You MUST output ONLY a valid JSON object matching this exact structure with these EXACT ENGLISH KEYS:
      \`\`\`json
      ${JSON.stringify(jsonSchema, null, 2)}
      \`\`\`

      [Resume Content]
      ${extractedText}
    `;

    const llamaResponse = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: import.meta.env.VITE_LLAMA_TEXT_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a strict Resume Parser. Output ONLY valid JSON. NEVER translate JSON keys into other languages. ALWAYS use the exact English keys provided.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: true,
        options: {
          num_ctx: 8192,
          temperature: 0.1,
          stop: ["<|endoftext|>", "<|im_start|>", "<|im_end|>", "Question:"],
        },
      }),
    });

    if (!llamaResponse.ok) {
      throw new Error(`Ollama LLM Error: ${llamaResponse.status}`);
    }

    if (!llamaResponse.body) {
      throw new Error("응답 Body가 없습니다.");
    }

    const reader = llamaResponse.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let rawResponse = "";
    let buffer = "";

    console.log(" [디버깅] AI가 답변 생성을 시작했습니다! (실시간 수신 중...)");

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log("\n [디버깅] AI 답변 생성 완전 종료!");
        console.log("AI 최종 완성 데이터 문번 :", rawResponse);
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      let lines = buffer.split("\n");

      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim() === "") continue;

        try {
          const parsedChunk = JSON.parse(line);
          if (parsedChunk.message && parsedChunk.message.content) {
            const word = parsedChunk.message.content;
            rawResponse += word;

            // 실시간 콘솔 출력 (이제 에러 없이 한 글자씩 잘 찍힙니다!)
            console.log(` [실시간]: ${word}`);
          }
        } catch (e) {
          console.error("스트림 청크 파싱 에러:", e, "\n문제의 데이터:", line);
        }
      }
    }

    let parsedData;

    console.log(rawResponse);

    try {
      if (!rawResponse) throw new Error("AI 응답이 비어있습니다.");

      const startIndex = rawResponse.indexOf("{");
      const lastIndex = rawResponse.lastIndexOf("}");

      if (startIndex === -1 || lastIndex === -1) {
        throw new Error("응답에서 JSON 객체를 찾을 수 없습니다.");
      }

      let cleanJsonString = rawResponse.substring(startIndex, lastIndex + 1);

      cleanJsonString = cleanJsonString.replace(/[\u0000-\u0019]+/g, "");

      parsedData = JSON.parse(cleanJsonString);

      if (Array.isArray(parsedData.abilities)) {
        parsedData.abilities = parsedData.abilities.map((item: any) => {
          // 만약 그냥 텍스트(string)라면 { desc: "텍스트" } 형태로 포장해 줍니다.
          if (typeof item === "string") {
            return { desc: item };
          }
          return item;
        });
      }
    } catch (parseError) {
      console.error(
        " [JSON 파싱 에러] AI가 만든 원본 데이터가 문법에 어긋납니다.",
      );
      console.log(" 문제의 AI 출력 원본 \n", rawResponse);
      throw new Error("AI가 유효하지 않은 JSON 형식을 반환했습니다.");
    }

    parsedData.hasAbility =
      Array.isArray(parsedData.abilities) && parsedData.abilities.length > 0;
    parsedData.hasSkill =
      Array.isArray(parsedData.skill) && parsedData.skill.length > 0;
    parsedData.hasCertificate =
      Array.isArray(parsedData.certificate) &&
      parsedData.certificate.length > 0;
    parsedData.hasLang =
      Array.isArray(parsedData.lang) && parsedData.lang.length > 0;
    parsedData.hasCareer =
      Array.isArray(parsedData.career) && parsedData.career.length > 0;

    console.log("ai가 추출한 데이터:", parsedData);

    console.log("벡터 임베딩 생성 시작...");

    const skillString = parsedData.skill.map((s: any) => s.name).join(", ");
    const abilityString = parsedData.abilities
      .map((a: any) => a.desc)
      .join(" ");
    const projectString = parsedData.project.map((p: any) => p.name).join(", ");

    const textToEmbed =
      `직무: ${parsedData.jobTitle} (${parsedData.totalExperience})\n기술스택: ${skillString}\n핵심역량: ${abilityString}\n주요경험: ${projectString}`.trim();

    const embedResponse = await fetch("http://localhost:11434/api/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: import.meta.env.VITE_LLAMA_EMBEDDING_MODEL,
        prompt: textToEmbed,
      }),
    });

    if (!embedResponse.ok) {
      throw new Error(`Ollama Embedding Error: ${embedResponse.status}`);
    }

    const embedResult = await embedResponse.json();
    const vector = embedResult.embedding;

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          name: parsedData.name
            ? parsedData.name.replace(/\s+/g, "")
            : "이름없음",
          job_title: parsedData.jobTitle || "직무미상",
          skills_summary: skillString,
          parsed_data: parsedData,
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

// 사용 x -> DB에 값을 넣었을때 한번에 Embeddding 하여 추가.
export async function updateMissingEmbeddings() {
  try {
    console.log("임베딩이 없는 데이터(null) 조회 중...");

    // 1. DB에서 embedding 컬럼이 비어있는 유저의 id와 parsed_data만 가져옵니다.
    const { data: users, error } = await supabase
      .from("users")
      .select("id, parsed_data")
      .is("embedding", null);

    if (error) throw error;

    if (!users || users.length === 0) {
      console.log(
        " 모든 유저의 임베딩이 이미 존재합니다. (업데이트할 항목 없음)",
      );
      return;
    }

    console.log(
      `총 ${users.length}건의 임베딩 생성을 시작합니다... (Ollama 실행 필요)`,
    );

    // 2. 가져온 유저 목록을 하나씩 돌면서 임베딩을 생성하고 업데이트합니다.
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const parsedData = user.parsed_data;

      // [안전장치] 혹시라도 배열이 없는 경우를 대비해 ( || [] ) 처리
      const skillString = (parsedData.skill || [])
        .map((s: any) => s.name)
        .join(", ");
      const abilityString = (parsedData.abilities || [])
        .map((a: any) => a.desc)
        .join(" ");
      const projectString = (parsedData.project || [])
        .map((p: any) => p.name)
        .join(", ");

      // 사용자님이 작성하신 완벽한 텍스트 조합 로직
      const textToEmbed =
        `직무: ${parsedData.jobTitle} (${parsedData.totalExperience})\n기술스택: ${skillString}\n핵심역량: ${abilityString}\n주요경험: ${projectString}`.trim();

      // 3. Ollama에게 임베딩 벡터 생성 요청
      const embedResponse = await fetch(
        "http://localhost:11434/api/embeddings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: import.meta.env.VITE_LLAMA_EMBEDDING_MODEL, // bge-m3 모델
            prompt: textToEmbed,
            keep_alive: 0,
          }),
        },
      );

      if (!embedResponse.ok) {
        throw new Error(`Ollama API 에러: ${embedResponse.status}`);
      }

      const embedResult = await embedResponse.json();
      const vector = embedResult.embedding;

      // 4. 생성된 벡터를 Supabase의 해당 유저 row에 업데이트(Update)
      const { error: updateError } = await supabase
        .from("users")
        .update({ embedding: vector })
        .eq("id", user.id); //  핵심: 현재 돌고 있는 유저의 id에만 쏙 넣습니다.

      if (updateError) throw updateError;

      console.log(
        ` [${i + 1}/${users.length}] ${parsedData.name} (${parsedData.jobTitle}) 임베딩 업데이트 완료!`,
      );
    }

    console.log(" 모든 데이터의 임베딩 업데이트가 성공적으로 끝났습니다!");
    alert("임베딩 생성 및 DB 업데이트가 완료되었습니다.");
  } catch (error) {
    console.error("임베딩 업데이트 중 오류 발생:", error);
    alert("임베딩 업데이트 중 오류가 발생했습니다. 콘솔을 확인해주세요.");
  }
}

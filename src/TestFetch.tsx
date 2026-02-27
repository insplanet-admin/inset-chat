import { supabase, genAI } from "./utils";

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

export async function postChatWithSupabase({
  message,
}: PostChatParams): Promise<ChatResponse> {
  try {
    // 1. 사용자 질문(message)을 벡터로 변환 (이력서 저장 시 사용한 모델과 동일해야 함)
    const embedResponse = await genAI.models.embedContent({
     model: "gemini-embedding-001",
      contents: message,
    });
    const queryVector = embedResponse.embeddings[0].values;

    // 2. Supabase RPC(match_users) 호출하여 유사한 후보자만 1차 필터링
    const { data: matchedCandidates, error } = await supabase.rpc(
      "match_users",
      {
        query_embedding: queryVector,
        match_threshold: 0.5, // 최소 일치율 (데이터에 따라 0.3 ~ 0.7 사이로 조정)
        match_count: 3,       // LLM에게 넘길 최대 후보자 수 (예: 상위 5명)
      }
    );

    if (error) {
      throw new Error(`Vector Search Error: ${error.message}`);
    }

    // 3. 조건에 맞는 후보자가 없을 경우 빠른 처리 (LLM 호출 비용 절약)
    if (!matchedCandidates || matchedCandidates.length === 0) {
      return { text: "[]" }; // 또는 "조건에 맞는 후보자가 없습니다." 등 상황에 맞게 처리
    }

    // 4. 추려진 후보자를 바탕으로 Gemini에게 최종 분석 및 '이유(reason)' 작성 요청
const prompt = `
      [Role Definition]
      You are an **Extremely Strict Technical Recruiter**. You output data STRICTLY in JSON format.

      [Task Description]
      1. Analyze the [User Query] to understand the exact technical requirements and role.
      2. Review the [Matched Candidates List].
      3. **STRICT FILTERING (CRITICAL):** - ONLY select candidates who are a **STRONG MATCH** for the user's query.
         - If a candidate's skills do not strongly align with the requested role (e.g., HR skills for a Developer role), **DROP THEM IMMEDIATELY**.
         - **Do NOT force a match.** It is much better to return an empty array [] than to recommend an irrelevant candidate.
      4. For the truly matched candidates, construct a specific "reason" in Korean.
      
      [User Query]
      "${message}"

      [Matched Candidates List]
      ${JSON.stringify(matchedCandidates)}

      [Output Constraint]
      - Return ONLY a JSON Array.
      - If NO candidates are a strong match, return exactly: []
      - Each object must contain: "name", "skill", "summary", "email", "phoneNumber", and "reason".
    `;

    // 5. 이전 단계에서 적용했던 JSON 강제 모드 사용
    const result = await genAI.models.generateContent({
      model: import.meta.env.VITE_GEMINI_MODEL, // (주의: 실제 운영시엔 백엔드 환경변수 권장)
      contents: prompt,
      config: {
        responseMimeType: "application/json", 
      }
    });

    console.log(result.text)

    return { text: result.text };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    console.error("AI Vector Search error:", errorMessage);

    throw new Error("AI 처리 및 벡터 검색 중 오류가 발생했습니다.");
  }
}

/**  파일을 Gemini가 이해하는 Base64로 변환하는 헬퍼 함수 */
async function fileToGenerativePart(file: File) {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>(
    (resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve({
          inlineData: {
            data: base64String,
            mimeType: file.type,
          },
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    },
  );
}

/** 이력서 파싱 및 DB 저장 함수 */
export async function parseAndSaveResume(file: File) {
  try {
    const filePart = await fileToGenerativePart(file);

    const prompt = `
      [Role]
      You are a Resume Parser. Your job is to extract structured data from the provided resume file.

      [Target Columns]
      Extract information into the following JSON keys strictly:
      - name: (string) Candidate's name.
      - skill: (string) Technical skills and tools separated by commas. 
        **CRITICAL INSTRUCTION FOR SKILLS: If the resume lists certifications (e.g., "컴퓨터활용능력 1급", "정보처리기사", "워드프로세서"), DO NOT just write the certification name. You MUST INFER and list the actual software/tools associated with it (e.g., "Excel, Access", "Database, Software Engineering", "MS Word"). Combine these inferred skills with any explicit skills.**
      - summary: (string) A brief professional summary (1-2 sentences) in Korean. 
        **CRITICAL: If the resume DOES NOT have an explicit summary, YOU MUST GENERATE ONE based on the candidate's skills and overall profile.**
      - email: (string) Email address.
      - phoneNumber: (string) Phone number (format: 010-XXXX-XXXX).

      [Constraint]
      1. Return ONLY raw JSON. No Markdown, no code blocks.
      2. If a field is missing, use null or an empty string.
      3. However, the 'summary' field MUST NOT be null. You must create one if it's missing.
      4. The 'skill' field MUST be a string.
      5. Translate summary to Korean if it's in English.
    `;

    const result = await genAI.models.generateContent({
      model: import.meta.env.VITE_GEMINI_MODEL,
      contents: [prompt, filePart],
      config: {
        responseMimeType: "application/json", 
      }
    });

    const parsedData = JSON.parse(result.text);
    console.log("AI가 추출한 데이터:", parsedData);

    // 임베딩용 텍스트 생성 
    const textToEmbed = `스킬: ${parsedData.skill || ""}. 요약: ${parsedData.summary || ""}`;

    const response = await genAI.models.embedContent({
      model: "gemini-embedding-001",
      contents: textToEmbed
    });

    const vector = response.embeddings[0].values
    
    const { data, error } = await supabase
      .from("user")
      .insert([
        {
          name: parsedData.name,
          skill: parsedData.skill,
          summary: parsedData.summary,
          email: parsedData.email,
          phoneNumber: parsedData.phoneNumber,
          embedding: vector
        },
      ])
      .select();

    if (error) throw new Error(error.message);

    return data;
  } catch (error) {
    console.error("이력서 처리 중 오류:", error);
    throw new Error("이력서 분석 또는 저장에 실패했습니다.");
  }
}

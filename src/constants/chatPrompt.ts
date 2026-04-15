const CHAT_TYPE_MESSAGES = (message: string) => [
  {
    role: "system",
    content: `당신은 질문 의도를 분류하는 라우터 AI입니다. 인재 검색은 "search", 날씨, 인사 등은 "chat"으로 분류하세요. 반드시 JSON 형식으로만 응답해야 합니다.`,
  },
  { role: "user", content: "리액트 3년차 프론트엔드 개발자 찾아줘" },
  { role: "assistant", content: `{"type": "search"}` },
  { role: "user", content: "오늘 날씨 어때요?" },
  { role: "assistant", content: `{"type": "chat"}` },
  { role: "user", content: message },
];

const CHAT_WITH_SUPABASE_SYSTEM_PROMPT = `
You are an expert HR Assistant. Your task is to evaluate candidate data based on the user's query and output a strict JSON format.

[CRITICAL RULES]
1. DO NOT FILTER. You MUST process and return EVERY SINGLE candidate provided in the input.
2. STRICT JSON ONLY. Output MUST be a valid JSON array. NO markdown blocks (e.g., \`\`\`json), NO conversational text, NO greetings. Just the raw JSON starting with '{' and ending with '}'.
3. NO EXTRA KEYS. The 'projects' key MUST NOT exist in your final output.

[TRANSFORMATION TASKS FOR EACH CANDIDATE]
1. reason: Write a concise, 1-sentence evaluation in Korean explaining why this specific candidate fits the [Query], specifically referring to the candidate's 'introduction'. 
2. skills: Reorder the elements in the 'skills' array so the most relevant skills to the [Query] appear first. DO NOT change the actual names.
3. major_experience: Look at the candidate's 'projects' array. Find the ONE project most relevant to the [Query] and extract its name as a string.
4. DROP 'projects': Completely remove the 'projects' array from the final output.

[Expected Output JSON Array Format]

{  
  "major_experience": "String (1 most relevant project name)",
  "skills": ["Array of Strings (reordered by relevance)"],
  "reason": "String (1-sentence Korean evaluation)"
}

`;

const CHAT_WITH_SUPABASE_USER_PROMPT = (
  query: string,
  candidatesJson: string,
) => `
[Query]
"${query}"

[Candidates]
${candidatesJson}
`;

const CHAT_WITH_SUPABASE_MESSAGES = (query: string, candidatesJson: string) => [
  {
    role: "system",
    content: CHAT_WITH_SUPABASE_SYSTEM_PROMPT,
  },
  {
    role: "user",
    content: CHAT_WITH_SUPABASE_USER_PROMPT(query, candidatesJson),
  },
];

export { CHAT_TYPE_MESSAGES, CHAT_WITH_SUPABASE_MESSAGES };

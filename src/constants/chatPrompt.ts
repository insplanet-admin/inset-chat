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

const CHAT_WITH_SUPABASE_PROMPT = (query: string, candidatesJson: string) => `
[CRITICAL INSTRUCTIONS]
You are an expert HR Assistant. 

CRITICAL RULE 1: DO NOT FILTER CANDIDATES. You MUST process and return EVERY SINGLE candidate from the [Candidates] array. If there are 4 candidates in the input, there MUST be exactly 4 candidates in the output array.
CRITICAL RULE 2: STRICT SCHEMA. Your output MUST be a valid JSON array matching the keys in the [Expected Output JSON Array Format]. The 'projects' key MUST NOT exist.

For EVERY candidate in the input, perform the following transformations:
1. ADD 'reason': Write a concise, 1-sentence evaluation in Korean explaining why this specific candidate fits the [Query].
2. REORDER 'details.skills': Reorder the elements in the 'skills' array so the most relevant skills to the [Query] appear first. DO NOT change, add, or delete the actual skill names.
3. EXTRACT 'details.major_experience': Look at the candidate's input 'projects' array. Find the ONE project most relevant to the [Query] and extract its name as a string for 'details.major_experience'.
4. DROP 'projects': Completely remove the 'projects' array. Output ONLY the exact keys shown in the [Expected Output JSON Array Format].

[Expected Output JSON Array Format]
[
  {
    "id": "String",
    "name": "String",
    "profile_image": "String",
    "is_kosa_verified": "Boolean",
    "basic_info": "Object",
    "details": {
      "final_education": "String",
      "qualifications": "String",
      "major_experience": "String (질문과 가장 관련된 프로젝트 이름 1개만 추출)",
      "skills": ["Array of Strings (가장 관련성 높은 순서대로 재배치)"],
      "internal_rating": "Number"
    },
    "introduction": "String",
    "reason": "String (사용자의 질문과 후보자의 역량을 비교한 1줄 추천 사유)"
  }
]

[Query]
"${query}"

[Candidates]
${candidatesJson}
`;

const CHAT_WITH_SUPABASE_MESSAGES = (query: string, candidatesJson: string) => [
  {
    role: "system",
    content:
      "You are an expert HR Assistant. You MUST output ONLY valid JSON array. No markdown blocks, no extra text, and NO extra keys like 'projects'.",
  },
  { role: "user", content: CHAT_WITH_SUPABASE_PROMPT(query, candidatesJson) },
];

export { CHAT_TYPE_MESSAGES, CHAT_WITH_SUPABASE_MESSAGES };

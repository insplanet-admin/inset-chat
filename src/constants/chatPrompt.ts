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
1. PRESERVE ORIGINAL DATA: You MUST return the EXACT same data provided in [Candidates]. Do NOT alter, delete, summarize, or modify ANY existing keys or values.
2. ADD 'reason' FIELD: Inject a new key called "reason" at the VERY TOP LEVEL of EACH candidate object.
3. REASON CONTENT: The "reason" MUST be a concise, 1-sentence evaluation in Korean explaining why this candidate is a good match for the user's [Query].

[Expected Output JSON Array Format]
[
  {
    "id": "...",
    "name": "...",
    "profile_image": "...",
    "is_kosa_verified": false,
    "basic_info": { ... },
    "details": { ... },
    "introduction": "...",
    "reason": "여기에 사용자의 질문과 후보자의 역량을 비교한 1줄 추천 사유를 작성하세요.",
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
      "You are an expert HR Assistant. You MUST output ONLY valid JSON array.",
  },
  { role: "user", content: CHAT_WITH_SUPABASE_PROMPT(query, candidatesJson) },
];

export { CHAT_TYPE_MESSAGES, CHAT_WITH_SUPABASE_MESSAGES };

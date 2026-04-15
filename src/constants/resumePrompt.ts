const RESUME_JSON_SCHEMA = {
  // ... (기존 스키마 내용 동일하게 유지) ...
  personal_info: {
    name: "",
    email: "",
    phone: "",
    birth_date: "",
    gender: "",
    address: "",
    profile_image_url: "",
  },
  professional_summary: {
    job_category: "",
    current_role: "",
    total_experience_months: 0,
    skill_grade: "",
    major_achievement: "",
    core_competencies: [],
    introduction: "",
  },
  evaluation: { one_line_review: "" },
  skills: [{ skill_name: "", proficiency_level: "", notes: "" }],
  work_experiences: [
    {
      start_date: "",
      end_date: "",
      company_name: "",
      department: "",
      job_title: "",
      responsibilities: "",
    },
  ],
  projects: [
    {
      start_date: "",
      end_date: "",
      project_name: "",
      client_company: "",
      role_and_tasks: "",
    },
  ],
  educations: [
    {
      start_date: "",
      end_date: "",
      school_name: "",
      major: "",
      graduation_status: "",
    },
  ],
  certifications: [],
  languages: [],
  awards: [],
};

const RESUME_PARSER_SYSTEM_PROMPT = `
You are a strict JSON data extraction API. You MUST output ONLY valid JSON.
Do NOT output markdown. Do NOT output plain text lists.

[CRITICAL RULES - AVOID HALLUCINATION]
1. ONLY JSON: Start your response exactly with '{' and end with '}'. No conversational text.
2. EXTRACT ALL EXISTING DATA: Extract every single project and work experience that ACTUALLY EXISTS in the text into the array. Do not skip any.
3. DO NOT INVENT DATA (NO HALLUCINATION): DO NOT create fake dates. DO NOT output "(내용 없음)". If there is no more data in the text, STOP generating array items immediately.
4. EXACT SCHEMA: Use the exact keys provided in the JSON TEMPLATE.
`;

const RESUME_PARSER_MESSAGES = (resumeContent: string) => [
  {
    role: "system",
    content: RESUME_PARSER_SYSTEM_PROMPT,
  },
  // 🚨 [가짜 질문] AI가 헷갈려하는 뭉개진 표 형태의 데이터 예시
  {
    role: "user",
    content: `[JSON TEMPLATE]
(Schema omitted for brevity)

[Resume Content]
이름: 홍길동
근무기간 회사명 부서명 직위 담당업무
2015.01 ~ 현재 네이버(주) 개발팀 대리 백엔드 개발
수행기간 프로젝트명 고객사 역할 비고
2018.01 ~ 2018.06 결제 시스템 구축 네이버 백엔드
2017.03 ~ 2017.12 로그인 시스템 구축 네이버 백엔드`,
  },
  // 🚨 [가짜 정답] 프로젝트가 여러 개일 때 어떻게 배열에 넣고 끝내는지(루프 종료) 확실히 보여줍니다.
  {
    role: "assistant",
    content: `{
  "personal_info": { "name": "홍길동", "email": "", "phone": "", "birth_date": "", "gender": "", "address": "", "profile_image_url": "" },
  "professional_summary": { "job_category": "개발", "current_role": "백엔드 개발자", "total_experience_months": 72, "skill_grade": "", "major_achievement": "", "core_competencies": ["백엔드 개발"], "introduction": "" },
  "evaluation": { "one_line_review": "네이버 출신 백엔드 개발자" },
  "skills": [],
  "work_experiences": [
    { "start_date": "2015-01", "end_date": "현재", "company_name": "네이버(주)", "department": "개발팀", "job_title": "대리", "responsibilities": "백엔드 개발" }
  ],
  "projects": [
    { "start_date": "2018-01", "end_date": "2018-06", "project_name": "결제 시스템 구축", "client_company": "네이버", "role_and_tasks": "백엔드" },
    { "start_date": "2017-03", "end_date": "2017-12", "project_name": "로그인 시스템 구축", "client_company": "네이버", "role_and_tasks": "백엔드" }
  ],
  "educations": [],
  "certifications": [],
  "languages": [],
  "awards": []
}`,
  },
  // 🚨 [진짜 질문] 실제 데이터를 주입
  {
    role: "user",
    content: `[JSON TEMPLATE]
${JSON.stringify(RESUME_JSON_SCHEMA, null, 2)}

[Resume Content]
${resumeContent}

Extract ALL projects, but DO NOT invent fake dates like "2019.03". Output ONLY JSON.`,
  },
];

export { RESUME_PARSER_MESSAGES };

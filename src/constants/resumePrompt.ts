const RESUME_JSON_SCHEMA = {
  personal_info: {
    name: "임재혁",
    email: "user@example.com",
    phone: "010-1234-5678",
    birth_date: "1990-05-12",
    gender: "남",
    address: "서울특별시 강남구 테헤란로 123",
    profile_image_url: "",
  },
  professional_summary: {
    job_category: "개발",
    current_role: "프론트엔드 개발자",
    total_experience_months: 69,
    skill_grade: "중급",
    major_achievement: "차세대 자산관리 플랫폼 구축 리드",
    core_competencies: [
      "React 기반 웹 프론트엔드 아키텍처 설계",
      "Next.js를 활용한 SSR 구현",
    ],
    introduction:
      "프론트엔드 개발자로서 React와 Next.js를 활용한 웹 애플리케이션 구축에 능숙하며...",
  },
  evaluation: {
    one_line_review:
      "React와 Next.js 생태계에 대한 깊은 이해도를 바탕으로, 금융 도메인의 대규모 웹 플랫폼 아키텍처 설계와 프로젝트 리딩 경험이 돋보이는 6년 차 프론트엔드 개발자입니다.",
  },
  skills: [
    {
      skill_name: "React",
      proficiency_level: "상",
      notes: "실무 3년, SSR 및 상태관리 능숙",
    },
  ],
  work_experiences: [
    {
      start_date: "2020-01",
      end_date: "2023-12",
      company_name: "인스플래닛(주)",
      department: "개발그룹",
      job_title: "책임",
      responsibilities: "React 웹 서비스 개발",
    },
  ],
  projects: [
    {
      start_date: "2022-06",
      end_date: "2023-12",
      project_name: "차세대 자산관리 웹 플랫폼 구축",
      client_company: "A은행",
      role_and_tasks: "프론트엔드 리드 / Next.js 기반 아키텍처 설계",
    },
  ],
  educations: [
    {
      start_date: "2009-03",
      end_date: "2013-02",
      school_name: "한국대학교",
      major: "컴퓨터공학과",
      graduation_status: "졸업",
    },
  ],
  certifications: [
    {
      certification_name: "정보처리기사",
      issuer: "한국산업인력공단",
      acquisition_date: "2013-08",
    },
  ],
  languages: [
    {
      language: "영어",
      test_name: "TOEIC",
      score: "850",
      acquisition_date: "2022-05",
    },
  ],
  awards: [
    {
      competition_name: "제5회 핀테크 해커톤 챔피언십",
      award_name: "대상",
      host_organization: "금융위원회",
      award_date: "2019-10",
    },
  ],
};

export const RESUME_PARSER_PROMPT = `
[CRITICAL Instructions]
1. FACTUALITY & LOGICAL INFERENCE: 
   - Basically, extract ONLY the information present in the [Resume Content].
   - **EXCEPTION (Skills)**: If the explicit 'Skills' section is missing or has fewer than 3 items, you MUST infer technical skills based on 'Projects', 'Work Experiences', and the inferred 'job_category'.
   - **Inference Guidelines by Role**:
     * Frontend / Web Platform Development: Infer "HTML", "CSS", "JavaScript".
     * Publisher ('퍼블리셔'): Infer "HTML", "CSS", "Web Accessibility (웹 접근성)", "UI/UX".
     * Backend / Server Development: Infer "SQL", "REST API", "Database Management".
   - Goal: Ensure at least 3-5 skills are listed. Do NOT hallucinate completely unrelated skills, but confidently include these "must-have" baseline technologies if the candidate's project experience implies them.

2. NEVER TRANSLATE JSON KEYS: You MUST keep the exact English keys provided in the schema. The values must be in Korean.

3. DATE FORMATTING: All dates MUST be converted to "YYYY-MM" format (e.g., 2023-01). If only the year is available, use "YYYY". For birth_date use "YYYY-MM-DD".

4. DATA CONVERSION & SYNTHESIS:
   - 'total_experience_months': MUST be calculated as an Integer based on work history (e.g., "5년 9개월" -> 69).
   - 'evaluation.one_line_review': Synthesize the candidate's core strengths, total experience, main tech stack, and notable achievements into a professional, concise 1-2 sentence summary in Korean.
   - 'skills[].notes': For inferred skills, mention "프로젝트 경험 기반 추론". For explicit skills, summarize relevant context.

5. ENUMERATED VALUES (STRICT SELECTION):
   - 'gender' MUST be exactly one of: ["남", "여"]. If unknown, leave as "".
   - 'job_category' MUST be exactly one of: ["개발", "기획", "디자인", "퍼블리셔"]. Infer the best fit from the resume content. If completely unrelated, leave as "".
   - 'skill_grade' MUST be exactly one of: ["상급", "중급", "하급"]. If unknown, leave as "".

[JSON OUTPUT FORMAT REQUIRED]
\`\`\`json
${JSON.stringify(RESUME_JSON_SCHEMA, null, 2)}
\`\`\`
`;
export { RESUME_JSON_SCHEMA };

import { getEmbedding } from "../apis/ollama";
import { decryptJSON, encryptJSON } from "./encrypt";
import { supabase } from "./supabase";

// 1. 10개의 랜덤 더미 이력서 데이터
const dummyResumes = [
  {
    personal_info: {
      name: "최안드",
      email: "android@example.com",
      phone: "010-1357-2468",
      birth_date: "1994-08-15",
      gender: "남",
      address: "서울시 금천구",
      profile_image_url: "",
    },
    professional_summary: {
      job_category: "개발",
      current_role: "안드로이드 개발자",
      total_experience_months: 48,
      skill_grade: "중급",
      major_achievement: "모바일 금융 앱 Kotlin 100% 마이그레이션",
      core_competencies: [
        "Kotlin 및 Jetpack Compose 기반 UI 개발",
        "Coroutines를 활용한 비동기 처리 및 Clean Architecture 적용",
      ],
      introduction:
        "안정적이고 유려한 모바일 경험을 제공하는 4년 차 안드로이드 네이티브 개발자입니다.",
    },
    evaluation: {
      internal_rating: 4.3,
      one_line_review:
        "최신 안드로이드 기술 스택(Compose, Coroutines)에 대한 이해도가 높고 클린 코드 작성을 지향함.",
    },
    skills: [
      {
        skill_name: "Kotlin / Jetpack Compose",
        proficiency_level: "상",
        notes: "MVVM 및 Clean Architecture",
      },
    ],
    work_experiences: [
      {
        start_date: "2020-03",
        end_date: "2024-03",
        company_name: "핀테크모바일",
        department: "앱개발팀",
        job_title: "대리",
        responsibilities: "송금 및 결제 도메인 안드로이드 앱 개발",
      },
    ],
    projects: [
      {
        start_date: "2022-01",
        end_date: "2022-10",
        project_name: "기존 Java 레거시 앱 Kotlin 전환",
        client_company: "자사",
        role_and_tasks: "주요 화면 Compose 전환 및 구조 개선",
      },
    ],
    educations: [
      {
        start_date: "2013-03",
        end_date: "2019-02",
        school_name: "광운대학교",
        major: "소프트웨어학부",
        graduation_status: "졸업",
      },
    ],
  },
];
// 2. 임베딩 + 암호화 + DB 일괄 삽입 함수
const seedDummyResumesToDB = async () => {
  console.log("더미 데이터 DB 삽입 시작...");

  try {
    const insertPromises = dummyResumes.map(async (parsedData) => {
      // 1. 임베딩(Vector) 생성을 위한 핵심 텍스트 조합
      const jobCategory = parsedData.professional_summary.job_category || "";
      const currentRole = parsedData.professional_summary.current_role || "";
      const skillString = parsedData.skills.map((s) => s.skill_name).join(", ");
      const competencyString =
        parsedData.professional_summary.core_competencies.join(" ");
      const projectString = parsedData.projects
        .map((p) => p.project_name)
        .join(", ");

      const textToEmbed =
        `직군: ${jobCategory}\n직무: ${currentRole}\n기술스택: ${skillString}\n핵심역량: ${competencyString}\n주요프로젝트: ${projectString}`.trim();

      // 2. bge-m3 임베딩 생성 (사용 중인 getEmbedding 함수 호출)
      const vector = await getEmbedding(textToEmbed);

      // 3. 민감 정보 암호화
      const originalName = parsedData.personal_info.name.replace(/\s+/g, "");
      const encryptedParsedData = encryptJSON(parsedData);

      // 4. Supabase DB Insert 객체 반환
      return {
        name: originalName,
        job_category: jobCategory,
        total_experience_months:
          parsedData.professional_summary.total_experience_months,
        resume_data: encryptedParsedData,
        embedding: vector,
      };
    });

    // 모든 더미 데이터의 임베딩과 암호화가 완료될 때까지 대기
    const rowsToInsert = await Promise.all(insertPromises);

    // Supabase 배열 Insert (Bulk Insert)
    const { data, error } = await supabase
      .from("resumes")
      .insert(rowsToInsert)
      .select();

    if (error) throw error;

    console.log(
      `성공적으로 ${data.length}개의 더미 데이터를 삽입했습니다!`,
      data,
    );
    alert("더미 데이터 삽입 완료!");
  } catch (error) {
    console.error("DB 삽입 중 오류 발생:", error);
    alert("데이터 삽입에 실패했습니다.");
  }
};

export { seedDummyResumesToDB };

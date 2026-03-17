import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

export async function generateWordResume() {
  // 1. 나중에 AI가 만들어줄 데이터의 형태 (지금은 가짜 데이터로 테스트)
  const mockData = {
    name: "임재혁",
    birthDate: "1990.05.12 (만 34세)",
    jobTitle: "프론트엔드 개발자",
    gender: "남",

    // 새로 채워진 기본 정보
    totalExperience: "5년 9개월",
    skillRating: "중급",
    address: "서울특별시 강남구 테헤란로 123, 101동 202호",

    // 학력 데이터 (최신순)
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

    // 기존 경력 데이터 유지
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

    //  기존 스킬 데이터에 추가
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

    //  자격증 데이터
    certificate: [
      { name: "정보처리기사", issuer: "한국산업인력공단", date: "2013.08" },
      {
        name: "SQL 개발자 (SQLD)",
        issuer: "한국데이터산업진흥원",
        date: "2015.12",
      },
    ],

    // 어학 데이터
    lang: [
      { name: "영어", test: "TOEIC", score: "850점", date: "2022.05" },
      { name: "영어", test: "OPIc", score: "IM2", date: "2021.11" },
    ],

    // 수상 경력 데이터
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

    //  프로젝트 수행 경력 데이터
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

    // 조건부 렌더링을 위한 boolean 플래그
    hasAbility: true,
    hasSkill: true,
    hasCertificate: false,
    hasLang: false,
    hasCareer: false,
  };

  try {
    // 2. public 폴더에 넣어둔 Word 템플릿 파일 불러오기
    const response = await fetch("/resume_template.docx");
    if (!response.ok) throw new Error("템플릿 파일을 찾을 수 없습니다.");

    const arrayBuffer = await response.arrayBuffer();

    // 3. PizZip과 Docxtemplater를 이용해 템플릿 로드
    const zip = new PizZip(arrayBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // 4. 템플릿의 {name}, {#experience} 부분에 가짜 데이터 덮어씌우기
    doc.render(mockData);

    // 5. 완성된 파일을 브라우저에서 다운로드 처리
    const blob = doc.getZip().generate({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    saveAs(blob, `이력서_${mockData.name}.docx`);
    console.log("✅ 이력서 다운로드 성공!");
  } catch (error) {
    console.error("❌ 이력서 생성 중 오류 발생:", error);
  }
}

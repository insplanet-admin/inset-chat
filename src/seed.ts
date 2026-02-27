// 환경 변수를 사용하기 위해 dotenv 패키지가 필요할 수 있습니다. (npm install dotenv)
// import "dotenv/config";
import { genAI, supabase } from "./utils";

// 2. 주신 더미 데이터 (50명)
const dummyData = [
  {
    name: "김철수",
    skill: "Python, Django, AWS",
    summary: "5년차 백엔드 개발자입니다. 대규모 트래픽 처리 경험이 있습니다.",
    email: "chulsoo.kim@example.com",
    phoneNumber: "010-1234-5678",
  },
  {
    name: "이영희",
    skill: "React, TypeScript, Next.js",
    summary: "UI/UX에 관심이 많은 3년차 프론트엔드 개발자입니다.",
    email: "younghee.lee@example.com",
    phoneNumber: "010-2345-6789",
  },
  {
    name: "박민수",
    skill: "Java, Spring Boot, MySQL",
    summary: "안정적인 서버 구축을 선호하는 백엔드 엔지니어입니다.",
    email: "minsu.park@example.com",
    phoneNumber: "010-3456-7890",
    embedding: ""
  },
  {
    name: "최지우",
    skill: "Figma, Adobe XD, Zeplin",
    summary: "사용자 중심의 디자인을 추구하는 UX 디자이너입니다.",
    email: "jiwoo.choi@example.com",
    phoneNumber: "010-4567-8901",
  },
  {
    name: "정우성",
    skill: "Python, PyTorch, TensorFlow",
    summary: "자연어 처리(NLP) 분야를 전문으로 하는 AI 개발자입니다.",
    email: "woosung.jung@example.com",
    phoneNumber: "010-5678-9012",
  },
  {
    name: "강하늘",
    skill: "Swift, iOS, Objective-C",
    summary: "앱스토어 1위 앱 개발 경험이 있는 iOS 개발자입니다.",
    email: "haneul.kang@example.com",
    phoneNumber: "010-6789-0123",
  },
  {
    name: "조여정",
    skill: "Kotlin, Android, Java",
    summary: "안드로이드 성능 최적화 경험이 풍부합니다.",
    email: "yeojeong.cho@example.com",
    phoneNumber: "010-7890-1234",
  },
  {
    name: "임재혁",
    skill: "FrontEnd, iOS, React Native",
    summary: "웹과 앱을 아우르는 하이브리드 개발자입니다.",
    email: "lim0202jh@gmail.com",
    phoneNumber: "010-8901-2345",
  },
  {
    name: "송중기",
    skill: "Node.js, Express, MongoDB",
    summary: "스타트업 초기 멤버로 빠르게 MVP를 개발한 경험이 있습니다.",
    email: "joongki.song@example.com",
    phoneNumber: "010-9012-3456",
  },
  {
    name: "한효주",
    skill: "Product Management, Jira, Slack",
    summary: "데이터 기반 의사결정을 중요시하는 PM입니다.",
    email: "hyojoo.han@example.com",
    phoneNumber: "010-0123-4567",
  },
  {
    name: "김고은",
    skill: "Vue.js, JavaScript, HTML/CSS",
    summary: "웹 접근성과 표준을 준수하는 퍼블리싱 능력이 있습니다.",
    email: "goeun.kim@example.com",
    phoneNumber: "010-1111-2222",
  },
  {
    name: "공유",
    skill: "C++, Unreal Engine, DirectX",
    summary: "AAA급 게임 개발 프로젝트에 참여한 클라이언트 개발자입니다.",
    email: "gong.yoo@example.com",
    phoneNumber: "010-2222-3333",
  },
  {
    name: "마동석",
    skill: "DevOps, Docker, Kubernetes, Jenkins",
    summary: "CI/CD 파이프라인 구축 및 서버 자동화 전문입니다.",
    email: "dongseok.ma@example.com",
    phoneNumber: "010-3333-4444",
  },
  {
    name: "손석구",
    skill: "Data Analysis, SQL, Tableau, Python",
    summary: "데이터에서 비즈니스 인사이트를 도출하는 데이터 분석가입니다.",
    email: "seokgu.son@example.com",
    phoneNumber: "010-4444-5555",
  },
  {
    name: "전지현",
    skill: "Marketing, SEO, Google Analytics",
    summary: "그로스 해킹 관점에서 제품 성장을 주도하는 마케터입니다.",
    email: "jihyun.jun@example.com",
    phoneNumber: "010-5555-6666",
  },
  {
    name: "이정재",
    skill: "Go, Microservices, gRPC",
    summary: "고성능 분산 시스템 설계 경험이 있는 서버 개발자입니다.",
    email: "jungjae.lee@example.com",
    phoneNumber: "010-6666-7777",
  },
  {
    name: "박서준",
    skill: "Flutter, Dart, Firebase",
    summary: "크로스 플랫폼 앱 개발로 효율성을 극대화합니다.",
    email: "seojun.park@example.com",
    phoneNumber: "010-7777-8888",
  },
  {
    name: "김태리",
    skill: "Machine Learning, Scikit-learn, Pandas",
    summary: "금융 데이터 분석 및 예측 모델링 경험이 있습니다.",
    email: "taeri.kim@example.com",
    phoneNumber: "010-8888-9999",
  },
  {
    name: "유연석",
    skill: "Unity, C#, Shader Graph",
    summary: "모바일 캐주얼 게임 개발 5년차입니다.",
    email: "yeonseok.yoo@example.com",
    phoneNumber: "010-9999-0000",
  },
  {
    name: "서현진",
    skill: "UX Research, Usability Testing, Prototyping",
    summary: "사용자의 숨겨진 니즈를 발굴하는 UX 리서처입니다.",
    email: "hyunjin.seo@example.com",
    phoneNumber: "010-1212-3434",
  },
  {
    name: "남주혁",
    skill: "Rust, WebAssembly, System Programming",
    summary: "안정성과 성능을 최우선으로 생각하는 시스템 엔지니어입니다.",
    email: "juhyuk.nam@example.com",
    phoneNumber: "010-2323-4545",
  },
  {
    name: "배수지",
    skill: "QA, Test Automation, Selenium",
    summary: "버그 없는 제품을 위한 꼼꼼한 테스팅 전문가입니다.",
    email: "suzy.bae@example.com",
    phoneNumber: "010-3434-5656",
  },
  {
    name: "차은우",
    skill: "Graphic Design, Photoshop, Illustrator",
    summary: "브랜딩 및 시각 디자인 전문 디자이너입니다.",
    email: "eunwoo.cha@example.com",
    phoneNumber: "010-4545-6767",
  },
  {
    name: "박보영",
    skill: "Content Writing, Copywriting, Blog",
    summary: "사용자의 마음을 움직이는 카피라이터입니다.",
    email: "boyoung.park@example.com",
    phoneNumber: "010-5656-7878",
  },
  {
    name: "이준호",
    skill: "Sales, B2B, CRM",
    summary: "IT 솔루션 영업 7년차 전문가입니다.",
    email: "junho.lee@example.com",
    phoneNumber: "010-6767-8989",
  },
  {
    name: "윤아",
    skill: "HR, Recruiting, Culture",
    summary: "좋은 조직 문화를 만드는 인사 담당자입니다.",
    email: "yoona.lim@example.com",
    phoneNumber: "010-7878-9090",
  },
  {
    name: "현빈",
    skill: "Security, Penetration Testing, Network",
    summary: "웹 취약점 점검 및 보안 컨설팅 경험이 있습니다.",
    email: "bin.hyun@example.com",
    phoneNumber: "010-8989-0101",
  },
  {
    name: "손예진",
    skill: "Translation, English, Japanese",
    summary: "IT 기술 문서 번역 및 로컬라이제이션 담당입니다.",
    email: "yejin.son@example.com",
    phoneNumber: "010-9090-1212",
  },
  {
    name: "조승우",
    skill: "Blockchain, Solidity, Smart Contract",
    summary: "이더리움 기반 DApp 개발 경험이 있습니다.",
    email: "seungwoo.cho@example.com",
    phoneNumber: "010-0101-2323",
  },
  {
    name: "김혜수",
    skill: "Project Management, PMP, Agile",
    summary: "애자일 코칭 및 스크럼 마스터 자격증 보유자입니다.",
    email: "hyesu.kim@example.com",
    phoneNumber: "010-1212-3434",
  },
  {
    name: "류준열",
    skill: "Video Editing, Premiere Pro, After Effects",
    summary: "유튜브 및 홍보 영상 제작 전문가입니다.",
    email: "junyeol.ryu@example.com",
    phoneNumber: "010-2323-4545",
  },
  {
    name: "이동욱",
    skill: "PHP, Laravel, MySQL",
    summary: "레거시 시스템 마이그레이션 경험이 많은 웹 개발자입니다.",
    email: "dongwook.lee@example.com",
    phoneNumber: "010-3434-5656",
  },
  {
    name: "유인나",
    skill: "Customer Support, Zendesk, Communication",
    summary: "고객 경험(CX) 개선을 위해 노력하는 CS 매니저입니다.",
    email: "inna.yoo@example.com",
    phoneNumber: "010-4545-6767",
  },
  {
    name: "지창욱",
    skill: "Hardware, IoT, Arduino, Raspberry Pi",
    summary: "임베디드 소프트웨어 및 IoT 기기 제어 개발자입니다.",
    email: "changwook.ji@example.com",
    phoneNumber: "010-5656-7878",
  },
  {
    name: "박민영",
    skill: "Finance, Accounting, SAP",
    summary: "IT 기업 회계 및 재무 관리 경력이 있습니다.",
    email: "minyoung.park@example.com",
    phoneNumber: "010-6767-8989",
  },
  {
    name: "이종석",
    skill: "Ruby, Ruby on Rails, PostgreSQL",
    summary: "빠른 프로토타이핑과 TDD를 선호하는 개발자입니다.",
    email: "jongsuk.lee@example.com",
    phoneNumber: "010-7878-9090",
  },
  {
    name: "신혜선",
    skill: "React, Redux, Webpack",
    summary: "프론트엔드 성능 최적화에 강점이 있습니다.",
    email: "hyesun.shin@example.com",
    phoneNumber: "010-8989-0101",
  },
  {
    name: "안효섭",
    skill: "Java, JPA, QueryDSL",
    summary: "엔터프라이즈 환경에서의 SI 개발 경험이 있습니다.",
    email: "hyoseop.ahn@example.com",
    phoneNumber: "010-9090-1212",
  },
  {
    name: "김지원",
    skill: "Scala, Akka, Functional Programming",
    summary: "함수형 프로그래밍에 깊은 관심이 있습니다.",
    email: "jiwon.kim@example.com",
    phoneNumber: "010-0101-2323",
  },
  {
    name: "송혜교",
    skill: "Fashion Design, Trend Analysis",
    summary: "패션 커머스 MD 출신 기획자입니다.",
    email: "hyekyo.song@example.com",
    phoneNumber: "010-1212-3434",
  },
  {
    name: "장기용",
    skill: "3D Modeling, Blender, Maya",
    summary: "게임 및 메타버스 3D 에셋 제작자입니다.",
    email: "kiyong.jang@example.com",
    phoneNumber: "010-2323-4545",
  },
  {
    name: "이성경",
    skill: "Musical, Vocal, Audio Engineering",
    summary: "오디오북 및 음성 합성 데이터 라벨링 경험이 있습니다.",
    email: "sungkyung.lee@example.com",
    phoneNumber: "010-3434-5656",
  },
  {
    name: "서강준",
    skill: "AI Researcher, Computer Vision, GAN",
    summary: "이미지 생성 모델 연구 논문 실적이 있습니다.",
    email: "kangjun.seo@example.com",
    phoneNumber: "010-4545-6767",
  },
  {
    name: "박신혜",
    skill: "Education, Curriculum Design",
    summary: "코딩 교육 커리큘럼 개발 및 강사 경력이 있습니다.",
    email: "shinhye.park@example.com",
    phoneNumber: "010-5656-7878",
  },
  {
    name: "변요한",
    skill: "Strategy, Business Development",
    summary: "신사업 발굴 및 사업 전략 수립 경험이 있습니다.",
    email: "yohan.byun@example.com",
    phoneNumber: "010-6767-8989",
  },
  {
    name: "김다미",
    skill: "React, GraphQL, Apollo",
    summary: "최신 웹 기술 트렌드를 빠르게 습득합니다.",
    email: "dami.kim@example.com",
    phoneNumber: "010-7878-9090",
  },
  {
    name: "최우식",
    skill: "Python, FastAPI, AsyncIO",
    summary: "비동기 처리를 통한 고성능 API 서버 개발을 좋아합니다.",
    email: "woosik.choi@example.com",
    phoneNumber: "010-8989-0101",
  },
  {
    name: "정해인",
    skill: "Svelte, SvelteKit, Vite",
    summary: "가볍고 빠른 웹 프레임워크를 선호합니다.",
    email: "haein.jung@example.com",
    phoneNumber: "010-9090-1212",
  },
  {
    name: "임시완",
    skill: "Elixir, Phoenix, Erlang",
    summary: "실시간 채팅 및 동시성 처리에 관심이 많습니다.",
    email: "siwan.im@example.com",
    phoneNumber: "010-0101-2323",
  },
  {
    name: "강동원",
    skill: "C, Linux Kernel, Driver",
    summary: "리눅스 커널 및 드라이버 개발 경력이 있습니다.",
    email: "dongwon.kang@example.com",
    phoneNumber: "010-1212-3434",
  },
];

export async function seedData() {
  console.log(" 데이터 삽입 시작...");

  for (const person of dummyData) {
    try {
      // 1. 의미를 가장 잘 담을 수 있도록 스킬과 요약을 합쳐서 텍스트를 만듭니다.
      const textToEmbed = `스킬: ${person.skill}. 요약: ${person.summary}`;

      // 2. Gemini API를 호출하여 숫자 배열(Vector)을 얻습니다.
      const response = await genAI.models.embedContent({
        model: "gemini-embedding-001",
        contents: textToEmbed,
      });

      // 결과값 구조가 조금 더 깔끔해졌습니다.
      const vector = response.embeddings[0].values;

      // 3. Supabase "user" 테이블에 삽입합니다.
      const { data, error } = await supabase.from("user").insert({
        name: person.name,
        skill: person.skill,
        summary: person.summary,
        email: person.email,
        phoneNumber: person.phoneNumber,
        embedding: vector, // 변환된 벡터 삽입
      });

      if (error) throw error;
      console.log(` ${person.name} 저장 완료`);
    } catch (err) {
      console.error(` ${person.name} 저장 실패:`, err.message);
    }
  }

  console.log("모든 데이터 삽입이 완료되었습니다!");
}


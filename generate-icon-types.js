// generate-icon-types.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES Module 환경에서 __dirname을 직접 만들어줍니다.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. 경로 설정
const ICONS_DIR = path.join(__dirname, "src/assets/icons");
const OUTPUT_DIR = path.join(__dirname, "src/components/common/Icon");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "icon-types.ts");
const SPRITE_OUTPUT_DIR = path.join(__dirname, "public");
const SPRITE_OUTPUT_FILE = path.join(SPRITE_OUTPUT_DIR, "sprite.svg");

try {
  // 만약 폴더가 없다면 에러를 뿜지 않고 알아서 생성해 줍니다
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  if (!fs.existsSync(SPRITE_OUTPUT_DIR)) {
    fs.mkdirSync(SPRITE_OUTPUT_DIR, { recursive: true });
  }

  // 폴더를 읽어서 .svg로 끝나는 파일만 필터링
  const files = fs
    .readdirSync(ICONS_DIR)
    .filter((file) => file.endsWith(".svg"));

  let iconNames = [];
  let symbols = ""; // 추가: <symbol> 태그들을 차곡차곡 모아둘 문자열

  // 추가: SVG 파일들을 하나씩 돌면서 이름도 뽑고, Sprite용 코드도 만듭니다.
  files.forEach((file) => {
    const name = file.replace(".svg", "");
    iconNames.push(name);

    // 개별 SVG 파일의 내용을 텍스트로 읽어옵니다.
    const svgContent = fs.readFileSync(path.join(ICONS_DIR, file), "utf-8");

    // 원본 SVG에서 viewBox 속성을 추출 (없으면 기본값 0 0 24 24 설정)
    const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 24 24";

    //  핵심 수정 부분: 시작/종료 태그를 지우고, fill과 stroke를 currentColor로 변환!
    const innerContent = svgContent
      .replace(/<svg[^>]*>/, "")
      .replace(/<\/svg>/, "")
      .replace(/fill="(?!(none))[^"]*"/g, 'fill="currentColor"') // fill 처리
      .replace(/stroke="(?!(none))[^"]*"/g, 'stroke="currentColor"') // stroke 처리
      .trim();

    // 알맹이를 <symbol> 태그로 예쁘게 감싸서 symbols 문자열에 추가합니다.
    symbols += `  <symbol id="icon-${name}" viewBox="${viewBox}">\n    ${innerContent}\n  </symbol>\n`;
  });

  // SVG 파일이 하나도 없을 경우의 처리
  if (iconNames.length === 0) {
    console.warn(
      "src/assets/icons 폴더에 SVG 파일이 하나도 없습니다! 임시 타입을 생성합니다.",
    );
    iconNames.push("empty-icon"); // 에러 방지용 임시 타입
  }

  // 2. 타입스크립트 코드 생성
  const typeDefinition = `// 이 파일은 스크립트에 의해 자동 생성됩니다. 직접 수정하지 마세요!
export type IconName =
  | '${iconNames.join("'\n  | '")}';
`;

  // 3. 파일 쓰기 (타입 파일)
  fs.writeFileSync(OUTPUT_FILE, typeDefinition);

  // 4. sprite.svg 파일 생성 및 쓰기
  const spriteContent = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">\n${symbols}</svg>`;
  fs.writeFileSync(SPRITE_OUTPUT_FILE, spriteContent);

  console.log(
    ` 성공: ${iconNames.length}개의 아이콘 타입과 sprite.svg 파일이 생성되었습니다!`,
  );
} catch (error) {
  console.error(" 아이콘 타입 및 Sprite 생성 중 에러 발생:", error);
}

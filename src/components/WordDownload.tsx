import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { supabase } from "../utils";

export async function generateWordResume(userId: string) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("parsed_data")
      .eq("id", userId)
      .single();

    if (error || !data) {
      throw new Error("DB에서 이력서를 찾을 수 없습니다.");
    }

    const resumeData = data.parsed_data;

    resumeData.hasAbility =
      Array.isArray(resumeData.abilities) && resumeData.abilities.length > 0;
    resumeData.hasSkill =
      Array.isArray(resumeData.skill) && resumeData.skill.length > 0;
    resumeData.hasCertificate =
      Array.isArray(resumeData.certificate) &&
      resumeData.certificate.length > 0;
    resumeData.hasLang =
      Array.isArray(resumeData.lang) && resumeData.lang.length > 0;
    resumeData.hasCareer =
      Array.isArray(resumeData.career) && resumeData.career.length > 0;

    console.log("템플릿에 데이터 주입 준비 완료:", resumeData);

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
    doc.render(resumeData);

    // 5. 완성된 파일을 브라우저에서 다운로드 처리
    const blob = doc.getZip().generate({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    saveAs(blob, `이력서_${resumeData.name}.docx`);
    console.log("이력서 다운로드 성공!");
  } catch (error) {
    console.error("이력서 생성 중 오류 발생:", error);
  }
}

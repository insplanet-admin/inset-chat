import { supabase } from "../utils/supabase";
import { encryptJSON } from "../utils/encrypt";
import { askOllama, getEmbedding } from "../api/ollama";
import { extractTextFromFile } from "../utils/fileParser";
import { RESUME_PARSER_PROMPT } from "../constatns/resumePrompt";

const parseAndSaveResume = async (file: File) => {
  try {
    const extractedText = await extractTextFromFile(file);
    if (!extractedText)
      throw new Error("파일에서 텍스트를 추출할 수 없습니다.");

    const messages = [
      {
        role: "system",
        content: "You are a strict Resume Parser. Output ONLY valid JSON.",
      },
      {
        role: "user",
        content: `${RESUME_PARSER_PROMPT}\n\n[Resume Content]\n${extractedText}`,
      },
    ];

    const rawResponse = await askOllama(
      import.meta.env.VITE_LLAMA_TEXT_MODEL,
      messages,
      true,
      {
        num_ctx: 8192,
        temperature: 0.1,
        stop: ["<|endoftext|>", "<|im_start|>", "<|im_end|>", "Question:"],
      },
    );

    const startIndex = rawResponse.indexOf("{");
    const lastIndex = rawResponse.lastIndexOf("}");
    if (startIndex === -1 || lastIndex === -1)
      throw new Error("JSON 객체를 찾을 수 없습니다.");

    const cleanJsonString = rawResponse
      .substring(startIndex, lastIndex + 1)
      .replace(/[\u0000-\u0019]+/g, "");
    let parsedData = JSON.parse(cleanJsonString);

    if (Array.isArray(parsedData.abilities)) {
      parsedData.abilities = parsedData.abilities.map((item: any) =>
        typeof item === "string" ? { desc: item } : item,
      );
    }

    const jobCategory =
      parsedData.professional_summary?.job_category || "직무미상";
    const currentRole = parsedData.professional_summary?.current_role || "";
    const skillString = Array.isArray(parsedData.skills)
      ? parsedData.skills.map((s: any) => s.skill_name).join(", ")
      : "";
    const competencyString = Array.isArray(
      parsedData.professional_summary?.core_competencies,
    )
      ? parsedData.professional_summary.core_competencies.join(" ")
      : "";
    const projectString = Array.isArray(parsedData.projects)
      ? parsedData.projects.map((p: any) => p.project_name).join(", ")
      : "";

    const textToEmbed =
      `직군: ${jobCategory}\n직무: ${currentRole}\n기술스택: ${skillString}\n핵심역량: ${competencyString}\n주요프로젝트: ${projectString}`.trim();
    const vector = await getEmbedding(textToEmbed);

    const originalName =
      parsedData.personal_info?.name?.replace(/\s+/g, "") || "이름없음";
    const encryptedParsedData = encryptJSON(parsedData);

    const { data, error } = await supabase
      .from("resumes")
      .insert([
        {
          name: originalName, // 이름도 암호화가 필요했다면 encryptJSON(originalName)으로 변경하세요.
          job_category: jobCategory,
          total_experience_months:
            parsedData.professional_summary?.total_experience_months || 0,
          resume_data: encryptedParsedData,
          embedding: vector,
        },
      ])
      .select();

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error("이력서 처리 오류:", error);
    throw new Error("이력서 분석 또는 저장에 실패했습니다.");
  }
};

export { parseAndSaveResume };

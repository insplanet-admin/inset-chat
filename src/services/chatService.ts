import { supabase } from "../utils/supabase";
import { decryptJSON } from "../utils/encrypt";
import { askOllama, getEmbedding } from "../api/ollama";
import { formatExperience } from "../utils/formatters";
import {
  CHAT_TYPE_MESSAGES,
  CHAT_WITH_SUPABASE_MESSAGES,
} from "../constatns/chatPrompt";

export interface PostChatParams {
  id: string;
  message: string;
  roomId: string;
}

export interface ChatResponse {
  text: string;
}

type ChatIntent = "search" | "chat";

const postChatToType = async ({
  message,
}: PostChatParams): Promise<ChatIntent> => {
  try {
    const content = await askOllama(
      import.meta.env.VITE_LLAMA_TYPE_MODEL,
      CHAT_TYPE_MESSAGES(message),
      false,
    );
    try {
      const parsedData = JSON.parse(content);
      return parsedData.type === "search" ? "search" : "chat";
    } catch {
      return "chat";
    }
  } catch (error) {
    console.error("라우터 통신 에러:", error);
    return "chat";
  }
};

const postChatWithSupabase = async ({
  message,
}: PostChatParams): Promise<ChatResponse> => {
  try {
    const queryVector = await getEmbedding(message);
    const { data: matchedCandidates, error } = await supabase.rpc(
      "match_resumes",
      {
        query_embedding: queryVector,
        match_threshold: 0.4,
        match_count: 3,
      },
    );

    if (error) throw new Error(`Vector Search Error: ${error.message}`);
    if (!matchedCandidates || matchedCandidates.length === 0) {
      return { text: "검색 조건에 맞는 인재가 없습니다." };
    }

    console.log("matchedCandidates : ", matchedCandidates);

    const minimalCandidates = matchedCandidates.map((c: any) => {
      let decryptedResumeData: any = {};
      try {
        if (typeof c.resume_data === "string") {
          decryptedResumeData = decryptJSON<any>(c.resume_data);
          console.log("string decryptedResumeData : ", decryptedResumeData);
        } else if (c.resume_data && c.resume_data.encrypted) {
          decryptedResumeData = decryptJSON<any>(c.resume_data);
          console.log("resumeData decryptedResumeData : ", decryptedResumeData);
        } else {
          decryptedResumeData = c.resume_data || {};
        }
      } catch (err) {
        decryptedResumeData = c.resume_data || {};
      }

      const rd = decryptedResumeData || {};

      const {
        personal_info = {},
        professional_summary = {},
        evaluation = {},
        educations = [],
        certifications = [],
        skills = [],
      } = rd;

      const birthYearStr = rd?.personal_info?.birth_date?.substring(0, 4);
      const birthYear = birthYearStr ? parseInt(birthYearStr, 10) : null;

      let finalEdu = "학력 정보 없음";
      if (Array.isArray(rd?.educations) && rd.educations.length > 0) {
        const edu = rd.educations[0];
        finalEdu =
          `${edu.school_name || ""} ${edu.major || ""} ${edu.graduation_status || ""}`.trim();
      }
      const qualifications = Array.isArray(certifications)
        ? certifications.map((cert: any) => cert.certification_name)
        : [];

      const skillsArr = Array.isArray(skills)
        ? skills.map((s: any) => s.skill_name)
        : [];

      const profileImage =
        personal_info.profile_image_url ||
        "https://cdn-icons-png.flaticon.com/256/1077/1077114.png";
      const category =
        c.job_category || professional_summary.job_category || "미분류";
      const experienceTotal = formatExperience(
        c.total_experience_months ||
          professional_summary.total_experience_months,
      );
      const majorExperience = professional_summary.major_achievement || "";
      const internalRating = evaluation.internal_rating || 0;
      const introduction =
        evaluation.one_line_review ||
        professional_summary.introduction ||
        "소개글이 없습니다.";

      return {
        id: c.id,
        name: c.name,
        profile_image: profileImage,
        is_kosa_verified: false,
        basic_info: {
          category: category,
          experience_total: experienceTotal,
          birth_year: birthYear,
        },
        details: {
          final_education: finalEdu,
          qualifications: qualifications,
          major_experience: majorExperience,
          skills: skillsArr,
          internal_rating: internalRating,
        },
        introduction: introduction,
      };
    });

    console.log("복호화 :", minimalCandidates);
    const resultText = await askOllama(
      import.meta.env.VITE_LLAMA_TEXT_MODEL,
      CHAT_WITH_SUPABASE_MESSAGES(message, JSON.stringify(minimalCandidates)),
      true,
    );
    return { text: resultText };
  } catch (error) {
    console.error("AI Vector Search error:", error);
    throw new Error("AI 처리 및 벡터 검색 중 오류가 발생했습니다.");
  }
};

const postChat = async (params: PostChatParams): Promise<ChatResponse> => {
  try {
    const intentType = await postChatToType(params);
    if (intentType === "search") {
      console.log("search");
      return await postChatWithSupabase(params);
    } else {
      console.log("chat");
      return { text: "사용자 검색만 부탁드립니다." };
    }
  } catch (error) {
    console.error("postChat Error:", error);
    throw new Error("대화 처리 중 오류가 발생했습니다.");
  }
};

export { postChat };

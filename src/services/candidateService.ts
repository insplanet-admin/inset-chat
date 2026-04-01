import { supabase } from "../utils/supabase";
import { decryptJSON } from "../utils/encrypt";

const fetchAndDecryptCandidate = async (id: string) => {
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("후보자 데이터를 찾을 수 없습니다.");

  let decryptedResumeData: any = {};
  try {
    if (typeof data.resume_data === "string") {
      decryptedResumeData = decryptJSON(data.resume_data);
    } else if (data.resume_data && data.resume_data.encrypted) {
      decryptedResumeData = decryptJSON(data.resume_data);
    } else {
      decryptedResumeData = data.resume_data || {};
    }
  } catch (err) {
    console.error("복호화 실패:", err);
    decryptedResumeData = data.resume_data || {};
  }

  let decryptedName = data.name;
  try {
    decryptedName = decryptJSON(data.name) || data.name;
  } catch {
    decryptedName =
      decryptedResumeData?.personal_info?.name || data.name || "이름 없음";
  }

  const rd = decryptedResumeData;

  return {
    name: decryptedName,
    experience: `경력 ${Math.floor((data.total_experience_months || 0) / 12)}년 ${(data.total_experience_months || 0) % 12}개월`,
    age: rd?.personal_info?.birth_date
      ? `만 ${new Date().getFullYear() - parseInt(rd.personal_info.birth_date.substring(0, 4))}세`
      : "나이 미상",
    phone: rd?.personal_info?.phone || "연락처 없음",
    email: rd?.personal_info?.email || "이메일 없음",
    address: rd?.personal_info?.address || "주소 미상",
    profileImage:
      rd?.personal_info?.profile_image_url ||
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",

    aiSummary:
      rd?.evaluation?.one_line_review ||
      rd?.professional_summary?.introduction ||
      "AI 요약평이 없습니다.",
    matchScore: 82,

    skills: {
      languages: Array.isArray(rd?.skills)
        ? rd.skills.map((s: any) => s.skill_name)
        : [],
      frameworks: [],
    },
    workHistory: Array.isArray(rd?.work_experiences)
      ? rd.work_experiences.map((w: any) => ({
          period: `${w.start_date || ""} ~ ${w.end_date || "현재"}`,
          company: w.company_name,
          role: `${w.department || ""} / ${w.job_title || ""}`,
        }))
      : [],
    majorExperience: Array.isArray(rd?.projects)
      ? rd.projects.map((p: any) => ({
          period: `${p.start_date || ""} ~ ${p.end_date || "현재"}`,
          project: p.project_name,
          role: p.role_and_tasks,
        }))
      : [],
  };
};

export { fetchAndDecryptCandidate };

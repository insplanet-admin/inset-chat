import { supabase, model } from "./utils";

interface Candidate {
  name: string;
  skill: string[] | null;
  summary: string | null;
  email: string | null;
  phoneNumber: string | null;
}

interface PostChatParams {
  message: string;
}

interface ChatResponse {
  text: string;
}

export async function postChatWithSupabase({
  message,
}: PostChatParams): Promise<ChatResponse> {
  try {
    const { data, error } = await supabase
      .from("User")
      .select("name, skill, summary, email, phoneNumber");

    if (error) {
      throw new Error(error.message);
    }

    const allCandidates = data as Candidate[];

    const prompt = `
    [Role Definition]
      You are an **Expert Technical Recruiter** with deep knowledge of software engineering stacks.
      At the same time, you are a **JSON Generator** that outputs data strictly in JSON format.

      [Task Description]
      1. Analyze the [User Query] to understand the underlying technical requirements.
         - Example: If user asks for "AI Developer", look for "Python", "TensorFlow", "PyTorch", "NLP", etc., even if the exact word "AI" is missing.
         - Example: If user asks for "Frontend", look for "React", "Vue", "JavaScript", "HTML/CSS".
      2. Review the [Candidates List] and find the best matches based on your technical inference.
      3. **Construct a specific "reason" in Korean.** Explain *why* this candidate fits the vague query based on their specific skills.
      
      [User Query]
      "${message}"

      [Candidates List]
      ${JSON.stringify(allCandidates)}

      [Output Constraint - VERY IMPORTANT]
      - You must output **ONLY a JSON Array**.
      - Do not include any conversational text (e.g., "Here is the list...").
      - Do not use Markdown code blocks (like \`\`\`json). Just the raw JSON array.
      - Each object in the array must contain: "name", "skill", "summary", "email", "phoneNumber", and "reason".

      [Example JSON Structure]
      [
        {
          "name": "홍길동",
          "skill": ["Python", "Django", "PyTorch"],
          "summary": "...",
          "email": "...",
          "phoneNumber": "...",
          "reason": "사용자가 AI 개발자를 요청했는데, 이 지원자는 PyTorch를 이용한 딥러닝 프로젝트 경험이 있어 적합합니다."
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return { text: responseText };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    console.error("AI processing error:", errorMessage);

    throw new Error("AI 처리 중 오류가 발생했습니다.");
  }
}

// 1. 파일을 Gemini가 이해하는 Base64로 변환하는 헬퍼 함수
async function fileToGenerativePart(file: File) {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>(
    (resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve({
          inlineData: {
            data: base64String,
            mimeType: file.type,
          },
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    },
  );
}

// 2. 이력서 파싱 및 DB 저장 함수
export async function parseAndSaveResume(file: File) {
  try {
    // A. 파일을 Base64로 변환
    const filePart = await fileToGenerativePart(file);

    // B. 프롬프트 작성 (엄격한 JSON 스키마 요구)
    const prompt = `
      [Role]
      You are a Resume Parser. Your job is to extract structured data from the provided resume file.

      [Target Columns]
      Extract information into the following JSON keys strictly:
      - name: (string) Candidate's name.
      - skill: (array of strings) Technical skills (e.g., ["React", "Python"]).
      - summary: (string) A brief professional summary (1-2 sentences).
      - email: (string) Email address.
      - phoneNumber: (string) Phone number (format: 010-XXXX-XXXX).

      [Constraint]
      1. Return ONLY raw JSON. No Markdown, no code blocks.
      2. If a field is missing, use null or an empty string.
      3. The 'skill' field MUST be a JSON array.
      4. Translate summary to Korean if it's in English.
    `;

    // C. Gemini에게 파일과 프롬프트를 같이 전달 (멀티모달)
    const result = await model.generateContent([prompt, filePart]);
    const responseText = result.response.text();

    // D. JSON 파싱
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    const parsedData = JSON.parse(cleanJson);

    console.log("AI가 추출한 데이터:", parsedData);

    // E. Supabase에 저장 (insert)
    const { data, error } = await supabase
      .from("User") // 테이블 이름 확인
      .insert([
        {
          name: parsedData.name,
          skill: parsedData.skill, // Supabase가 알아서 배열로 저장해줍니다.
          summary: parsedData.summary,
          email: parsedData.email,
          phoneNumber: parsedData.phoneNumber,
        },
      ])
      .select();

    if (error) throw new Error(error.message);

    return data; // 저장된 데이터 반환
  } catch (error) {
    console.error("이력서 처리 중 오류:", error);
    throw new Error("이력서 분석 또는 저장에 실패했습니다.");
  }
}

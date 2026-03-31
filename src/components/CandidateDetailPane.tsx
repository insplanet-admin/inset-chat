import { useParams, useNavigate } from "react-router-dom";
import IconButton from "./common/button/IconButton";
import Icon from "./common/Icon/Icon";
import Text from "./common/text/Text";
import styled from "styled-components";
import { supabase } from "../utils/supabase";
import { decryptJSON } from "../utils/encrypt";
import { useQuery } from "@tanstack/react-query";

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

const CandidateDetailPane = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["candidate", candidateId],
    queryFn: () => fetchAndDecryptCandidate(candidateId as string),
    enabled: !!candidateId, // candidateId가 있을 때만 실행
  });

  if (isLoading) {
    return (
      <PaneWrapper style={{ justifyContent: "center", alignItems: "center" }}>
        <h2>데이터를 불러오는 중입니다...</h2>
      </PaneWrapper>
    );
  }

  if (isError || !data) {
    return (
      <PaneWrapper style={{ justifyContent: "center", alignItems: "center" }}>
        <h2>데이터를 불러오는데 실패했습니다.</h2>
        <button onClick={() => navigate("..")}>돌아가기</button>
      </PaneWrapper>
    );
  }

  return (
    <PaneWrapper>
      <Header>
        <Text variant="headingMd">PROFILE</Text>
        <IconButton style="ghost" onClick={() => navigate("..")}>
          <Icon name="CloseL" />
        </IconButton>
      </Header>

      <ContentArea>
        <ProfileCard>
          <Avatar src={data.profileImage} alt={data.name} />
          <Name>{data.name}</Name>
          <Subtitle>
            <span>{data.experience}</span> · {data.age}
          </Subtitle>
          <InfoBox>
            <InfoItem>{data.phone}</InfoItem>
            <InfoItem>{data.email}</InfoItem>
            <InfoItem>{data.address}</InfoItem>
          </InfoBox>
        </ProfileCard>

        {/* 2. 오른쪽 이력 상세 카드 */}
        <DetailCard>
          {/* AI 요약평 */}
          <Section>
            <SectionTitle>AI 요약평 ✨</SectionTitle>
            <AISummaryBox>
              <AIText>{data.aiSummary}</AIText>
              <ScoreBox>
                <ScoreLabel>매칭 점수</ScoreLabel>
                <ScoreValue>{data.matchScore}%</ScoreValue>
                <ProgressBarWrapper>
                  <ProgressBar percent={data.matchScore} />
                </ProgressBarWrapper>
              </ScoreBox>
            </AISummaryBox>
          </Section>

          {/* 기술 스택 */}
          <Section>
            <SectionTitle>기술</SectionTitle>
            <div>
              <Row>
                <RowLabel>코딩언어</RowLabel>
                <TagList>
                  {data.skills.languages.map((skill) => (
                    <Tag key={skill}>{skill}</Tag>
                  ))}
                </TagList>
              </Row>
              <Row>
                <RowLabel>프레임워크</RowLabel>
                <TagList>
                  {data.skills.frameworks.map((skill) => (
                    <Tag key={skill}>{skill}</Tag>
                  ))}
                </TagList>
              </Row>
            </div>
          </Section>

          {/* 근무이력 */}
          <Section>
            <SectionTitle>근무이력</SectionTitle>
            <div>
              {data.workHistory.map((work, idx) => (
                <Row key={idx}>
                  <RowLabel>{work.period}</RowLabel>
                  <RowContent>
                    {work.company} <span>· {work.role}</span>
                  </RowContent>
                </Row>
              ))}
            </div>
          </Section>

          {/* 주요경력 */}
          <Section>
            <SectionTitle>주요경력</SectionTitle>
            <div>
              {data.majorExperience.map((exp, idx) => (
                <Row key={idx}>
                  <RowLabel>{exp.period}</RowLabel>
                  <RowContent>
                    {exp.project} <span>· {exp.role}</span>
                  </RowContent>
                </Row>
              ))}
            </div>
          </Section>

          {/* 하단 액션 버튼 */}
          <FooterActions>
            <TextButton>이메일 보내기</TextButton>
            <PrimaryButton>이력서 다운받기</PrimaryButton>
          </FooterActions>
        </DetailCard>
      </ContentArea>
    </PaneWrapper>
  );
};

const PaneWrapper = styled.aside`
  width: 100%;
  max-width: 900px;
  height: 100%;
  background-color: #fff;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
`;

const ContentArea = styled.div`
  display: flex;
  gap: 20px;
  padding: 24px;
  overflow-y: auto;
  flex: 1;

  @media (max-width: 1800px) {
    flex-direction: column;
    padding: 16px; /* 좁은 화면에 맞춰 여백을 살짝 줄임 */
  }
`;

/* --- 왼쪽 프로필 카드 --- */
const ProfileCard = styled.div`
  width: 280px;
  background-color: #f7f5fb;
  border-radius: 16px;
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);

  @media (max-width: 1800px) {
    width: 100%;
    padding: 24px;
  }
`;

const Avatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 20px;
`;

const Name = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;

  span {
    color: #3b82f6; /* 파란색 경력 텍스트 */
    font-weight: 500;
  }
`;

const InfoBox = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: auto;

  @media (max-width: 1800px) {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  color: #333;
  gap: 8px;
`;

const ShareButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #ece8f4;
  color: #333;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  margin-top: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background-color: #e2dcf0;
  }
`;

/* --- 오른쪽 상세 카드 --- */
const DetailCard = styled.div`
  flex: 1;
  background-color: #fff;
  border-radius: 16px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);

  @media (max-width: 1800px) {
    width: 100%;
    padding: 24px;
    gap: 32px;
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #111;
`;

/* AI 요약평 영역 */
const AISummaryBox = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-start;
`;

const AIText = styled.p`
  flex: 1;
  font-size: 15px;
  line-height: 1.6;
  color: #444;
  margin: 0;
  word-break: keep-all;
`;

const ScoreBox = styled.div`
  width: 140px;
  background-color: #fcfafc;
  border: 1px solid #f0eef4;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const ScoreLabel = styled.div`
  font-size: 12px;
  color: #666;
`;

const ScoreValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: #111;
`;

const ProgressBarWrapper = styled.div`
  width: 100%;
  height: 6px;
  background-color: #e5e5e5;
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressBar = styled.div<{ percent: number }>`
  width: ${(props) => props.percent}%;
  height: 100%;
  background-color: #7c3aed; /* 보라색 */
`;

/* 리스트 (기술, 이력 등) 영역 */
const Row = styled.div`
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f4f4f4;

  &:last-child {
    border-bottom: none;
  }
`;

const RowLabel = styled.div`
  width: 120px;
  font-size: 14px;
  color: #666;
`;

const RowContent = styled.div`
  flex: 1;
  font-size: 14px;
  color: #222;
  text-align: right;

  span {
    color: #666;
    margin-left: 8px;
    font-size: 13px;
  }
`;

const TagList = styled.div`
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
`;

const Tag = styled.span`
  background-color: #f4f4f6;
  color: #444;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
`;

/* 푸터 액션 */
const FooterActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 24px;
`;

const TextButton = styled.button`
  background: none;
  border: none;
  color: #111;
  font-weight: 600;
  cursor: pointer;
  font-size: 15px;
  padding: 8px 0;
`;

const PrimaryButton = styled.button`
  background-color: #7c3aed;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 24px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;

  &:hover {
    background-color: #6d28d9;
  }
`;

export { CandidateDetailPane };

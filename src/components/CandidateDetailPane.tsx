import { useParams, useNavigate } from "react-router-dom";
import IconButton from "./common/button/IconButton";
import Icon from "./common/Icon/Icon";
import Text from "./common/text/Text";
import AreaInput from "./common/Input/AreaInput";
import Button from "./common/button/Button";
import styled from "styled-components";
import { supabase } from "../utils/supabase";
import { decryptJSON } from "../utils/encrypt";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTextArea } from "./common/Input/hooks";

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
  const queryClient = useQueryClient();

  const { value: newComment, onChange, setValue } = useTextArea("");

  const { data: comments = [], isLoading: isCommentsLoading } = useQuery({
    queryKey: ["candidate_comments", candidateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resume_comments")
        .select("*")
        .eq("resume_id", candidateId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!candidateId,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from("resume_comments")
        .insert([
          {
            resume_id: candidateId,
            author: "대표님", // 비밀번호를 이용
            content: content,
          },
        ])
        .select();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["candidate_comments", candidateId],
      });
      setValue("");
    },
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["candidate", candidateId],
    queryFn: () => fetchAndDecryptCandidate(candidateId as string),
    enabled: !!candidateId, // candidateId가 있을 때만 실행
  });

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment);
  };

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCommentSubmit();
    }
  };

  return (
    <PaneWrapper>
      <Header>
        <Text variant="headingSm" weight="bold">
          PROFILE
        </Text>
        <IconButton style="ghost" onClick={() => navigate("..")}>
          <Icon name="CloseL" />
        </IconButton>
      </Header>

      <ContentArea>
        <ProfileCard>
          <Avatar src={data.profileImage} alt={data.name} />
          <Text variant="headingSm" weight="bold">
            {data.name}
          </Text>
          <Text variant="bodyMd" weight="medium" color="#00838A">
            <span>{data.experience}</span> · {data.age}
          </Text>
          <InfoBox>
            <InfoItem>{data.phone}</InfoItem>
            <InfoItem>{data.email}</InfoItem>
            <InfoItem>{data.address}</InfoItem>
          </InfoBox>
        </ProfileCard>

        <DetailCard>
          <Section>
            <Text variant="headingXs" weight="bold">
              AI 요약평 ✨
            </Text>
            <AISummaryBox>
              <Text variant="bodyMd" weight="medium" color="#6D7178">
                {data.aiSummary}
              </Text>
              <ScoreBox>
                <Text variant="bodySm" weight="medium" color="#6D7178">
                  매칭 점수
                </Text>
                <ScoreValue>{data.matchScore}%</ScoreValue>
                <ProgressBarWrapper>
                  <ProgressBar percent={data.matchScore} />
                </ProgressBarWrapper>
              </ScoreBox>
            </AISummaryBox>
          </Section>

          <Section>
            <Text variant="headingXs" weight="bold">
              기술
            </Text>
            <div>
              <Row>
                <Text variant="bodyMd" weight="medium" color="#6D7178">
                  코딩언어
                </Text>
                <TagList>
                  {data.skills.languages.map((skill) => (
                    <Tag key={skill}>{skill}</Tag>
                  ))}
                </TagList>
              </Row>
              <Row>
                <Text variant="bodyMd" weight="medium" color="#6D7178">
                  코딩언어
                </Text>
                <TagList>
                  {data.skills.frameworks.map((skill) => (
                    <Tag key={skill}>{skill}</Tag>
                  ))}
                </TagList>
              </Row>
            </div>
          </Section>

          <Section>
            <Text variant="headingXs" weight="bold">
              근무이력
            </Text>
            <div>
              {data.workHistory.map((work, idx) => (
                <Row key={idx}>
                  <Text variant="bodyMd" weight="medium" color="#6D7178">
                    {work.period}
                  </Text>
                  <RowContent>
                    {work.company} <span>· {work.role}</span>
                  </RowContent>
                </Row>
              ))}
            </div>
          </Section>

          <Section>
            <Text variant="headingXs" weight="bold">
              주요경력
            </Text>
            <div>
              {data.majorExperience.map((exp, idx) => (
                <Row key={idx}>
                  <Text variant="bodyMd" weight="medium" color="#6D7178">
                    {exp.period}
                  </Text>

                  <RowContent>
                    {exp.project} <span>· {exp.role}</span>
                  </RowContent>
                </Row>
              ))}
            </div>
          </Section>

          <Section>
            <Text variant="headingXs" weight="bold">
              평점 및 코멘트
            </Text>

            <CommentContainer>
              {/* 1. 댓글 입력 영역 */}
              <CommentInputWrapper>
                <AreaInput
                  variant="outline"
                  placeholder="후보자에 대한 평가나 메모를 남겨주세요."
                  value={newComment}
                  onChange={onChange}
                  onKeyDown={handleKeyDown}
                />

                <div style={{ alignSelf: "flex-end" }}>
                  <Button
                    onClick={handleCommentSubmit}
                    state={
                      !newComment.trim() || addCommentMutation.isPending
                        ? "disabled"
                        : "default"
                    }
                  >
                    {addCommentMutation.isPending ? "등록 중..." : "등록"}
                  </Button>
                </div>
              </CommentInputWrapper>

              {/* 2. 댓글 목록 영역 */}
              <CommentList>
                {comments.map((comment) => (
                  <CommentItem key={comment.id}>
                    <CommentHeader>
                      <Text variant="bodyMd">{comment.author}</Text>
                      <Text variant="bodySm" color="#9ca3af">
                        {new Date(comment.created_at).toLocaleDateString(
                          "ko-KR",
                        )}
                      </Text>
                    </CommentHeader>
                    <Text variant="bodyMd">{comment.content}</Text>
                  </CommentItem>
                ))}
              </CommentList>
            </CommentContainer>
          </Section>
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
  flex: 1;

  overflow: hidden;

  @media (max-width: 1800px) {
    flex-direction: column;
    padding: 16px;
  }
`;

const ProfileCard = styled.div`
  width: 280px;
  background-color: #f7f5fb;
  border-radius: 16px;
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);

  @media (max-width: 1800px) {
    width: 100%;
    padding: 24px 0;
  }
`;

const Avatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 20px;
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

const DetailCard = styled.div`
  flex: 1;
  background-color: #fff;
  border-radius: 16px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  overflow-y: auto;

  @media (max-width: 1800px) {
    /* width: 100%; */
    padding: 24px;
    gap: 32px;
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AISummaryBox = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-start;
  justify-content: space-between;
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
  background-color: #7c3aed;
`;

const Row = styled.div`
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f4f4f4;

  &:last-child {
    border-bottom: none;
  }
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

const CommentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  background-color: #faf9fb;
  padding: 20px;
  border-radius: 12px;
`;

const CommentInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CommentItem = styled.div`
  background-color: #ffffff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export { CandidateDetailPane };

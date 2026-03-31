import { SyncLoader } from "react-spinners";
import styled from "styled-components";
import { generateWordResume } from "./WordDownload";
import { AIChatBubble, MyChatBubble } from "./domain/ChatBubble";

export default function ChatMessages({ messages, isAITyping }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {messages.map((mes) => {
        const isMine = mes.role == false;

        let candidatesArray = [];
        if (
          typeof mes.content === "string" &&
          (mes.content.startsWith("[") || mes.content.startsWith("{"))
        ) {
          try {
            const parsedData = JSON.parse(mes.content);
            if (Array.isArray(parsedData)) {
              candidatesArray = parsedData;
              console.log(candidatesArray);
            } else {
              console.log("candidatesArray error");
            }
          } catch {
            // 파싱 실패 시 조용히 넘어감 (일반 메시지인 경우)
            console.log("candidatesArray 일반 메세지");
          }
        }

        if (candidatesArray.length > 0) {
          return (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <span>해당 조건에 맞는 인력을 3명 찾았습니다.</span>
              <div style={{ display: "flex", gap: "1rem" }}>
                {candidatesArray.map((candidate, idx) => (
                  <CandidateCard key={candidate.id || idx} data={candidate} />
                ))}
              </div>
            </div>
          );
        }

        return isMine ? (
          <MyChatBubble key={mes.id} message={mes.content} />
        ) : (
          <AIChatBubble key={mes.id} message={mes.content} />
        );
      })}

      {isAITyping && (
        <div
          style={{
            padding: "10px",
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          <SyncLoader
            color="#000000" // 잘 보이는 색상
            loading
            size={8}
            speedMultiplier={0.6}
          />
        </div>
      )}
    </div>
  );
}

const renderStars = (rating) => {
  if (!rating) return "-";
  const fullStars = "★".repeat(Math.floor(rating));
  const emptyStars = "☆".repeat(5 - Math.floor(rating));
  return fullStars + emptyStars;
};

const CandidateCard = ({ data }) => {
  if (!data || !data.basic_info) return null;

  const currentYear = 2026;
  const age = currentYear - data.basic_info.birth_year;

  return (
    <Card>
      <Header>
        <ProfileImage>
          <img src={data.profile_image} alt={data.name} />
        </ProfileImage>

        <UserInfo>
          <NameWrapper>
            <Name>{data.name}</Name>
            {data.details?.internal_rating >= 4.0 && (
              <Badge bgColor="#F6F2FE" textColor="#8337ED">
                ✓ BEST
              </Badge>
            )}
            {data.is_kosa_verified && (
              <Badge bgColor="#D6F9FA" textColor="#00838A">
                코사증빙
              </Badge>
            )}
          </NameWrapper>

          <MetaInfo>
            <span className="category">{data.basic_info.category}</span>
            {" · "}
            {data.basic_info.experience_total}
            {" · "}
            {data.basic_info.birth_year}년생 (만 {age}세)
          </MetaInfo>
        </UserInfo>

        <BookmarkIcon>⚲</BookmarkIcon>
      </Header>

      <Divider />

      <DetailList>
        <DetailRow>
          <Label>최종학력</Label>
          <Value>{data.details?.final_education || "-"}</Value>
        </DetailRow>

        <DetailRow>
          <Label>보유자격</Label>
          <Value>
            {data.details?.qualifications?.length > 0
              ? data.details.qualifications.join(", ")
              : "-"}
          </Value>
        </DetailRow>

        <DetailRow>
          <Label>경력사항</Label>
          <Value className="truncate">
            {data.details?.major_experience || "-"}
          </Value>
        </DetailRow>

        <DetailRow>
          <Label>보유기술</Label>
          <SkillContainer>
            {data.details?.skills?.slice(0, 3).map((skill, idx) => (
              <SkillTag key={idx}>{skill}</SkillTag>
            ))}
            {data.details?.skills?.length > 3 && <SkillTag>...</SkillTag>}
          </SkillContainer>
        </DetailRow>

        <DetailRow>
          <Label>내부평가</Label>
          <Value className="rating">
            {renderStars(data.details?.internal_rating)}
          </Value>
        </DetailRow>
      </DetailList>

      <IntroBox>
        <Intro>{data.introduction || "소개글이 없습니다."}</Intro>
      </IntroBox>
    </Card>
  );
};

const Card = styled.div`
  width: 360px;
  background-color: #ffffff;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  font-family: sans-serif;
  position: relative;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const ProfileImage = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #f0f0f0;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserInfo = styled.div`
  flex: 1;
  overflow: hidden;
`;

const NameWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const Name = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #292b2d;
`;

const Badge = styled.span<{ bgColor?: string; textColor?: string }>`
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 12px;
  background-color: ${({ bgColor }) => bgColor || "#eee"};
  color: ${({ textColor }) => textColor || "#333"};
  white-space: nowrap;
`;

const MetaInfo = styled.div`
  font-size: 12px;
  color: #6d7178;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .category {
    color: #00838a;
    font-weight: bold;
  }
`;

const BookmarkIcon = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 20px;
  color: #ccc;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #ffd700;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #f0f0f0;
  margin-bottom: 20px;
`;

const DetailList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 14px;
  margin-bottom: 20px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Label = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #878a92;
  flex-shrink: 0;
`;

const Value = styled.span`
  flex: 1;
  color: #222;
  font-weight: 500;
  min-width: 0;
  font-size: 14px;

  &.truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &.rating {
    font-size: 16px;
    color: #444;
    letter-spacing: 2px;
  }
`;

const SkillContainer = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  flex: 1;
`;

const SkillTag = styled.span`
  background-color: #f1f2f4;
  color: #444;
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 4px;
`;

const IntroBox = styled.div`
  background-color: #f1f2f4;
  padding: 16px;
  border-radius: 16px;
`;

const Intro = styled.p`
  font-size: 12px;
  color: #333;
  line-height: 1.5;

  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;

  overflow: hidden;
  margin: 0;
`;

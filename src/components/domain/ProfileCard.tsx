import { Avatar } from "Avatar";
import IconButton from "components/common/button/IconButton";
import DotDivider from "components/common/divider/DotDivider";
import { Box, Row, Stack } from "components/common/flex";
import Icon from "components/Icon/Icon";
import styled from "styled-components";
import { testContainerStyles } from "styles/mixins";
import Text from "Text/Text";

interface Props {
  userName: string;
  email: string;
}

const ProfileCard = ({ userName, email }: Props) => {
  return (
    <StyledContainer>
      <Row gap={12}>
        <Avatar
          style="photo"
          size={56}
          src="https://via.placeholder.com/80"
          alt="User Avatar"
        />
        <Box>
          <Text variant="bodyLg" weight="semibold">
            사용자 이름
          </Text>
          <Box direction="row" align="center" gap={8}>
            <Text
              variant="bodyMd"
              weight="medium"
              color="var(--color-text-brand-secondary)"
            >
              개발
            </Text>
            <DotDivider />
            <Text variant="bodyMd" weight="medium">
              경력 8년
            </Text>
          </Box>
        </Box>
        <div style={{ marginLeft: "auto" }}>
          <IconButton
            style="ghost"
            aria-label="Edit Profile"
            onClick={() => alert("Edit")}
          >
            <Icon
              name="Star"
              size={24}
              color="var(--color-text-default-secondary)"
            />
          </IconButton>
        </div>
      </Row>
      <Separator />
      <Stack gap={14}>
        <Row gap={12}>
          <Text
            variant="bodyMd"
            weight="medium"
            color="var(--color-text-default-tertiary)"
          >
            학력
          </Text>
          <Text
            variant="bodyMd"
            weight="medium"
            color="var(--color-text-default-secondary)"
          >
            중앙대학교 컴퓨터공학 학사
          </Text>
        </Row>
        <Row gap={12}>
          <Text
            variant="bodyMd"
            weight="medium"
            color="var(--color-text-default-tertiary)"
          >
            자격
          </Text>
          <Text
            variant="bodyMd"
            weight="medium"
            color="var(--color-text-default-secondary)"
          >
            중앙대학교 컴퓨터공학 학사
          </Text>
        </Row>
        <Row gap={12}>
          <Text
            variant="bodyMd"
            weight="medium"
            color="var(--color-text-default-tertiary)"
          >
            경험
          </Text>
          <Text
            variant="bodyMd"
            weight="medium"
            color="var(--color-text-default-secondary)"
          >
            5년
          </Text>
        </Row>
        <Row gap={12}>
          <Text
            variant="bodyMd"
            weight="medium"
            color="var(--color-text-default-tertiary)"
          >
            스킬
          </Text>
          <Text
            variant="bodyMd"
            weight="medium"
            color="var(--color-text-default-secondary)"
          >
            JavaScript, TypeScript, React
          </Text>
        </Row>
      </Stack>
      <SummaryArea>
        <Text
          variant="bodyMd"
          weight="medium"
          color="var(--color-text-default-secondary)"
        >
          대규모 트래픽 처리 경험이 풍부하며, UI 성능 최적화에 강점이 있는
          전문가입니다.
        </Text>
      </SummaryArea>
    </StyledContainer>
  );
};

const SummaryArea = styled.div`
  display: flex;
  padding: var(--spacing-12, 14px) var(--spacing-16, 18px);
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  align-self: stretch;
  border-radius: var(--overlay-radius-xsmall, 4px)
    var(--overlay-radius-large, 16px) var(--overlay-radius-large, 16px)
    var(--overlay-radius-large, 16px);
  background: var(--color-background-surface-default-secondary, #f1f2f4);
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;

  ${testContainerStyles}
`;

export default ProfileCard;

const Separator = styled.div`
  height: 1px;
  background-color: #0000000d;
`;

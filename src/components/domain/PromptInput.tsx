import React from "react";
import styled from "styled-components";
import { useAutoResizeTextarea } from "pages/useAutoResizeTextarea";

// 1. suggestions(추천 텍스트 배열)를 선택적(optional) Props로 추가합니다.
interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  suggestions?: string[];
}

const PromptInput: React.FC<PromptInputProps> = ({
  onSubmit,
  suggestions = [],
}) => {
  const { ref, value, onChange, setValue } = useAutoResizeTextarea({
    initialValue: "",
    maxRows: 5,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (value.trim() === "") return;

    onSubmit(value);
    setValue("");
  };

  // 추천 버튼을 클릭했을 때 실행될 함수입니다.
  const handleSuggestionClick = (suggestionText: string) => {
    setValue(suggestionText); // 입력창의 값을 추천 텍스트로 변경합니다.
    // 만약 클릭하자마자 바로 전송되게 하려면 아래 주석을 해제하세요!
    // onSubmit(suggestionText);
  };

  return (
    // 전체를 감싸는 Wrapper를 추가했습니다.
    <Wrapper>
      {/* 기존의 입력창 컨테이너입니다 */}
      <InputContainer>
        <Textarea
          ref={ref}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder="여기에 프롬프트를 입력하세요..."
          rows={1}
        />
        <Button onClick={handleSubmit}>전송</Button>
      </InputContainer>

      {/* 2. suggestions 배열에 데이터가 있을 때만 추천 영역을 렌더링합니다 */}
      {suggestions.length > 0 && (
        <SuggestionsContainer>
          {suggestions.map((suggestion, index) => (
            <SuggestionButton
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </SuggestionButton>
          ))}
        </SuggestionsContainer>
      )}
    </Wrapper>
  );
};

export default PromptInput;

// --- Styled Components ---

// 전체 레이아웃을 세로로 정렬하는 래퍼
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;

  // bg
  border-radius: var(--input-radius-chating, 40px);
  border: var(--input-border-border, 1px) solid
    var(--color-background-surface-opacity-brand_border, rgba(85, 46, 96, 0.08));
  background: var(
    --color-background-surface-opacity-brand,
    rgba(82, 27, 150, 0.04)
  );
  backdrop-filter: blur(20px);
`;

// 기존 Container의 이름을 InputContainer로 변경했습니다.
const InputContainer = styled.div`
  display: flex;
  padding: var(--spacing-12, 14px) var(--spacing-12, 14px)
    var(--spacing-12, 14px) var(--spacing-24, 28px);
  align-items: center;
  gap: var(--spacing-12, 14px);
  align-self: stretch;
  border-radius: var(--input-radius-chating, 40px);
  background: var(--color-background-surface-default-primary, #fff);
  box-shadow:
    0 1px 2px 0 rgba(0, 0, 0, 0.04),
    0 8px 24px -2px rgba(0, 0, 0, 0.08);
`;

const Textarea = styled.textarea`
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  font-family: inherit;
  font-size: 16px;
  padding: 4px;
  line-height: 1.5;
  background: inherit;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }
`;

const Button = styled.button`
  display: flex;
  width: var(--button-size-large, 48px);
  height: 48px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  aspect-ratio: 1/1;
  border-radius: var(--button-radius-circle, 1000px);
  border: 1px solid var(--gradiant-border-chat_button, #8337ed);
  background: var(--color-background-solid-default-brand1, #894cf6);
  color: white;
  cursor: pointer;
  flex-shrink: 0; /* 버튼이 찌그러지지 않도록 보호합니다 */
`;

// --- 추천 버튼 관련 스타일 ---

const SuggestionsContainer = styled.div`
  display: flex;
  padding: 0 var(--spacing-16, 18px) var(--spacing-16, 18px)
    var(--spacing-24, 28px);
  align-items: center;
  gap: var(--spacing-8, 10px);
  align-self: stretch;
`;

const SuggestionButton = styled.button`
  display: flex;
  height: var(--chip-size-medium, 36px);
  justify-content: center;
  align-items: center;
  padding: 0 16px;
  border-radius: var(--chip-radius-circle, 1000px);
  border: var(--input-border-border, 1px) solid
    var(--color-background-surface-opacity-white_surface_border, #fff);
  background: var(
    --color-background-surface-opacity-white_surface,
    rgba(255, 255, 255, 0.5)
  );

  /* 마우스를 올렸을 때의 효과 */
  &:hover {
    background-color: var(--color-background-surface-hover, #ebebeb);
    border-color: var(--color-border-hover, #ccc);
    color: var(--color-text-default-primary, #333);
  }
`;

import { useState, DragEvent, ReactNode } from "react";

interface DragDropWrapperProps {
  children: ReactNode;
  onFileDrop: (file: File) => void;
}

export default function DragDropWrapper({
  children,
  onFileDrop,
}: DragDropWrapperProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileDrop(file);
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ position: "relative", width: "100%" }} // relative 필수
    >
      {/* 드래그 시 나타나는 오버레이 (Gemini 스타일) */}
      {isDragging && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            border: "2px dashed #007bff",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "#007bff",
            backdropFilter: "blur(4px)",
            margin: "20px 60px",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📂</div>
          <div style={{ fontWeight: "bold" }}>파일을 여기에 놓아주세요</div>
        </div>
      )}

      {/* 기존 컴포넌트들 */}
      {children}
    </div>
  );
}

const formatExperience = (months?: number) => {
  if (!months || months === 0) return "신입";
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) return `${remainingMonths}개월`;
  if (remainingMonths === 0) return `${years}년`;
  return `${years}년 ${remainingMonths}개월`;
};

export { formatExperience };

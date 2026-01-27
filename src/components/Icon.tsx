const Icon = ({ name, size = 24 }) => {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <use href={`#icon-${name}`} />
    </svg>
  );
};

export default Icon;

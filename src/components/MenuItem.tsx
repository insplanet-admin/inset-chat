import Row from "./Row";
import Text from "./Text";

interface Props {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}

const MenuItem = ({ icon, children, onClick }: Props) => {
  return (
    <button onClick={onClick} style={{ width: "100%", textAlign: "left" }}>
      <Row align="center" gap=".5rem" style={{ height: "32px" }}>
        {icon}
        <Text variant="bodyBold">{children}</Text>
      </Row>
    </button>
  );
};

export default MenuItem;

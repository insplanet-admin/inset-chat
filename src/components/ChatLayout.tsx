import { Page, Sidebar } from "./layouts";

import Spacer from "./Spacer";
import Row from "./Row";
import ConversationArea from "./ConversationArea";

import MenuItem from "./menu-item";
import { useNavigate, Outlet, useOutletContext } from "react-router-dom";
import Text from "./common/text/Text";
import Icon from "./common/Icon/Icon";
import { Avatar } from "./common/avatar";

type AuthContextType = {
  user: { id: string; name: string };
};

const ChatLayout = () => {
  const navigate = useNavigate();

  const { user } = useOutletContext<AuthContextType>();

  return (
    <Page hasSidebar>
      <Sidebar>
        <Row justify="space-between" align="center">
          1
        </Row>
        <Spacer size={4} />
        <Spacer size={4} />
        <Spacer size={4} />

        <MenuItem onClick={() => navigate(`/chat`)}>새로운 채팅</MenuItem>

        <Spacer size={1} />
        <ConversationArea />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-end",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "12px",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => {
              localStorage.removeItem("user_session");
              navigate("/");
            }}
          >
            <Avatar style="icon" size={25} icon={<Icon name="Profile" />} />
            <Text variant="bodyLg">{user.name}</Text>
            <Icon name="Exit" size={20} />
          </div>
        </div>
      </Sidebar>

      <Outlet />
    </Page>
  );
};

export default ChatLayout;

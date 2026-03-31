import { Page, Sidebar } from "./layouts";

import Spacer from "./Spacer";
import Row from "./Row";
import ConversationArea from "./ConversationArea";

import MenuItem from "./menu-item";
import { useNavigate, Outlet } from "react-router-dom";

const ChatLayout = () => {
  const navigate = useNavigate();

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
      </Sidebar>

      <Outlet />
    </Page>
  );
};

export default ChatLayout;

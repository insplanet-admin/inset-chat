import { decryptJSON } from "./encrypt";

interface UserSession {
  id: string;
  name: string;
}

const getUser = (): UserSession | null => {
  const session = localStorage.getItem("user_session");
  if (!session) return null;

  return decryptJSON(session) as UserSession;
};

export { UserSession, getUser };

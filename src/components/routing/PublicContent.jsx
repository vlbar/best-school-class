import { useSelector } from "react-redux";
import { selectAuth } from "../../redux/auth/authSelectors";

function PublicContent({ children }) {
  const { isLoggedIn } = useSelector(selectAuth);

  return isLoggedIn ? null : children;
}

export default PublicContent;

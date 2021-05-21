import { useSelector } from "react-redux";
import { selectAuth } from "../../redux/auth/authSelectors";
import { selectState } from "../../redux/state/stateSelector";

function PrivateContent({ children, allowedStates = null }) {
  const { isLoggedIn } = useSelector(selectAuth);
  const { state } = useSelector(selectState);

  return isLoggedIn && (!allowedStates || allowedStates.includes(state))
    ? children
    : null;
}

export default PrivateContent;

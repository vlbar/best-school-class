import { useSelector } from "react-redux";
import { selectAuth } from "../../redux/auth/authSelectors";
import { selectState } from "../../redux/state/stateSelector";

function PrivateContent({ children, allowedStates = null, internalState = null }) {
  const { isLoggedIn } = useSelector(selectAuth);
  const { state } = useSelector(selectState);

  return isLoggedIn && (!allowedStates || allowedStates.includes(internalState ?? state))
    ? children
    : null;
}

export default PrivateContent;

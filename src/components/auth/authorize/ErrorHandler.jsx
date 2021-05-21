import { unwrapResult } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { refreshToken } from "../../../redux/auth/authActions";
import { logouted } from "../../../redux/auth/authReducer";

function ErrorHandler(store, error) {
  if (error.response?.status !== 401) return error;
  const refreshingToken = localStorage.getItem("auth")?.user.refreshToken;
  if (!refreshingToken) {
    store.dispatch(logouted());
    return error
  } 
  console.log(!refreshingToken);

  store.dispatch(refreshToken(refreshingToken))
    .then(unwrapResult)
    .catch((e) => {
      if (e.status === 401) store.dispatch(logouted());
    });
  return error;
}

export default ErrorHandler;

import { createSlice } from "@reduxjs/toolkit";
import { login, refreshToken } from "./authActions";

const initialState = {
  isLoggedIn: false,
  user: {
    token: "",
    refreshToken: "",
    username: "",
  },
  status: "idle",
};

const currentState = localStorage.getItem("auth")
  ? JSON.parse(localStorage.getItem("auth"))
  : initialState;

const authSlice = createSlice({
  name: "auth",
  initialState: currentState,
  reducers: {
    logouted(state, action) {
      localStorage.removeItem("auth");
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.status = "success";
        state.isLoggedIn = true;
        state.user = {
          username: action.payload.username,
          token: action.payload.token,
        };
        localStorage.setItem("auth", JSON.stringify(state));
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "error";
      })
      .addCase(login.pending, (state) => {
        state.status = "loading";
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.user.token = action.payload.token;
        state.user.refreshToken = action.payload.refreshToken;
      });
  },
});

export const { loggedIn, logouted } = authSlice.actions;
export default authSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import { login, refresh } from "./authActions";

const initialState = {
  isLoggedIn: false,
  username: "",
  status: "idle",
};

const currentState = {
  isLoggedIn: !!localStorage.getItem("token"),
  username: localStorage.getItem("username") || "",
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState: currentState,
  reducers: {
    logouted() {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("username");
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.status = "success";
        state.isLoggedIn = true;
        state.username = action.payload.username;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
        localStorage.setItem("username", action.payload.username);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "error";
      })
      .addCase(login.pending, (state) => {
        state.status = "loading";
      })
      .addCase(refresh.fulfilled, (state, action) => {
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      })
      .addCase(refresh.rejected, () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("username");
        return initialState;
      });
  },
});

export const { loggedIn, logouted } = authSlice.actions;
export default authSlice.reducer;

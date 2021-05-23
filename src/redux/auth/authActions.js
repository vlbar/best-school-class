import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
const baseURL = "/auth";

export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    const initialCridentials = { username: username, password: password };
    try {
      const response = await axios.post(`${baseURL}/login`, initialCridentials);
      return response.data;
    } catch (e) {
      return rejectWithValue(e.response.data);
    }
  }
);

export const refresh = createAsyncThunk(
  "auth/refresh",
  async ({ refreshToken }) => {
    const initialCridentials = { refreshToken };
    const response = await axios.post(
      `${baseURL}/token/refresh`,
      initialCridentials,
      { skipAuthRefresh: true }
    );
    return response.data;
  }
);

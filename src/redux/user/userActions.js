import axios from "axios";
import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import { createError } from "../../components/notifications/notifications";

const baseURL = "/users";

export const me = createAsyncThunk("user/me", async () => {
  return await axios
    .get(`${baseURL}/me`)
    .then((response) => response.data)
    .catch((err) => {
      createError("Не удалось загрузить профиль пользователя.", err);
    });
});

export const restore = createAction("user/restore");

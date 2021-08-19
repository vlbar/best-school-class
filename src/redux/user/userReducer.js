import { createSlice } from "@reduxjs/toolkit";
import { me, restore } from "./userActions";

const initialState = {
  user: null
};

const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    restore(state) {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(me.fulfilled, (state, action) => {
        state.user = action.payload;
      })
  },
});

export const { fetched, restored } = userSlice.actions;
export default userSlice.reducer;

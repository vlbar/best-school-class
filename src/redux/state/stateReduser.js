import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  state: localStorage.getItem("state") || "student",
};

const stateSlice = createSlice({
  name: "state",
  initialState: initialState,
  reducers: {
    changed(state, action) {
      const actionState = action.payload;
      localStorage.setItem("state", actionState);
      state.state = actionState;
    },
  },
});

export const { changed } = stateSlice.actions;
export default stateSlice.reducer;

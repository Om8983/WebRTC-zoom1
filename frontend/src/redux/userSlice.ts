import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type Usertype = {
  userId: string;
  isLogin: boolean;
};

const initialState: Usertype = {
  userId: "",
  isLogin: false,
};

const userSlice = createSlice({
  name: "userSlice",
  initialState,
  reducers: {
    setUserCred: (state, action: PayloadAction<Usertype>) => {
      state.isLogin = action.payload.isLogin;
      state.userId = action.payload.userId;
    },
  },
});

export const { setUserCred } = userSlice.actions;
export default userSlice.reducer;

// ./slice/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess(state, action) {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
        },
        logoutSuccess(state) {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
        },
        // ... autres reducers
    }
});

export const { loginSuccess, logoutSuccess } = authSlice.actions;
export default authSlice.reducer;
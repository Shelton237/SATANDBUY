// utils/tokenHelper.js
import AuthService from "@/services/AuthService";

export const withToken = async (callback) => {
  const token = AuthService.getAccessToken();
  return callback(token);
};

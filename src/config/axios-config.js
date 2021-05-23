import { unwrapResult } from "@reduxjs/toolkit";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import { refresh } from "../redux/auth/authActions";
import { store } from "../redux/rootReducer";

export const BASE_PATH = "http://localhost:8080/bestschoolclass/api/v1";

const retryAuth = async (failedRequest) => {
  const refreshToken = localStorage.getItem("refreshToken");
  return await store
    .dispatch(refresh({ refreshToken }))
    .then(unwrapResult)
    .then(() => {
      return Promise.resolve();
    })
    .catch(() => {
      return Promise.reject();
    });
};

function setBaseURL(axios) {
  axios.defaults.baseURL = BASE_PATH;
}

function applyAuthorizationTokenHeader(axios) {
  axios.interceptors.request.use((request) => {
    const token = localStorage.getItem("token");
    if (token) request.headers.Authorization = `Bearer ${token}`;
    return request;
  });
}

function configureAxios(axios) {
  setBaseURL(axios);
  applyAuthorizationTokenHeader(axios);
  createAuthRefreshInterceptor(axios, retryAuth);
}

export default configureAxios;

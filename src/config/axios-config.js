import { unwrapResult } from "@reduxjs/toolkit";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import { refresh } from "../redux/auth/authActions";
import { store } from "../redux/rootReducer";
import Resource from "../util/Hateoas/Resource";

export const BASE_PATH = "https://dss-course-work.herokuapp.com/api/v1";

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

function createHalResourceInterceptor(axios) {
  axios.interceptors.response.use((response) => {
    if (response.data) {
      Resource.wrap(response.data);
      if (response.data._embedded)
        Object.values(response.data._embedded).forEach((collection) => {
          collection.forEach((item) => Resource.wrap(item));
        });
    }

    return response;
  });
}

function configureAxios(axios) {
  setBaseURL(axios);
  applyAuthorizationTokenHeader(axios);
  createAuthRefreshInterceptor(axios, retryAuth);
  createHalResourceInterceptor(axios);
}

export default configureAxios;
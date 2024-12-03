import { notification } from "antd";
import axios, { type AxiosRequestConfig } from "axios";

const TIMEOUT = 6000;
const ACCESS_TOKEN = "Access-Token";

const instance = axios.create({
  baseURL:
    location.hostname === "localhost"
      ? `http://localhost:8888/vdapi`
      : "/vdapi",
  timeout: TIMEOUT,
});

function handleReqConfig(config: any) {
  const token = (window as any).Metabase.store.getState().app.tempStorage.token;
  if (token) {
    config.headers = {
      ...config.headers,
      [ACCESS_TOKEN]: token,
    };
  }
  return config;
}

instance.interceptors.request.use(handleReqConfig, err => {
  return Promise.reject(err);
});

function handleResp(response: any) {
  const result = response.data;
  if (!(result instanceof Blob) && (!result || result.code < 0)) {
    notification.error({
      message: result?.code || "Error",
      description: result?.message || "unknow error",
    });
  }
  return response;
}
function handleResErr(error: any) {
  if (error.response) {
    const data = error.response.data;
    if (error.response.status === 403) {
      notification.error({ message: "Forbidden", description: data.message });
    } else if (error.response.status === 401) {
      notification.error({
        message: "Unauthorized",
        description: "Authorization verification failed",
      });
    }
  } else {
    notification.error({ message: "Unknow error", description: error + "" });
  }
  return Promise.reject(error);
}
instance.interceptors.response.use(handleResp, handleResErr);

function handleRespPost(config: AxiosRequestConfig<any>) {
  return instance(config).then(res => {
    return res.data;
  });
}

export { handleRespPost as axios };

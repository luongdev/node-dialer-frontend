import axios from "axios";

const serves = axios.create({
  baseURL: __CONFIG__.BASE_API,
  timeout: 5000,
});

serves.interceptors.request.use(
  (config) => {
    return config;
  },
  (err) => Promise.reject(err)
);

serves.interceptors.response.use(
  (res) => {
    if (res.data.code === 50000) {
      // ElMessage.error(res.data.data);
    }
    return res;
  },
  (err) => {
    if (err.message.includes("timeout")) {
      console.log("Timeout Error", err);
    }
    if (err.message.includes("Network Error")) {
      console.log("Network Error", err);
    }
    return Promise.reject(err);
  }
);


export default serves;

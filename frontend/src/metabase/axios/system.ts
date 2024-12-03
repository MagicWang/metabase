import { axios } from "./axios";

export const system = {
  // 获取机构列表
  getDeptList: (params?: any) => {
    return axios({
      url: "/system/api/sys/branch/public-combo-root",
      method: "get",
      params,
    });
  },
};

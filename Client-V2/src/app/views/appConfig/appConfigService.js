import axios from "axios";
import ConstantList from "../../appConfig";
export const getAllReagents = () => {
  return axios.get(ConstantList.API_ENPOINT + "/api/appConfig/simple/1/10");
};

export const searchAppConfig = (appConfig) => {
  return axios.post(
    ConstantList.API_ENPOINT + "/api/appConfig/searchByDto", appConfig);
};

export const getByIDByParentId = (id) => {
  var url =
    ConstantList.API_ENPOINT + "/api/appConfig/findAllByReagentId/" + id;
  return axios.get(url);
};

export const getUserById = (id) => {
  return axios.get("/api/user", { data: id });
};
export const deleteItem = (id) => {
  return axios.delete(ConstantList.API_ENPOINT + "/api/appConfig/" + id);
};

export const getItemById = (id) => {
  return axios.get(ConstantList.API_ENPOINT + "/api/appConfig/" + id);
};
export const checkCode = (obj) => {
  var url = ConstantList.API_ENPOINT + "/api/appConfig/checkCode";
  return axios.post(url, obj);
};

export const addNewAppConfig = (appConfig) => {
  return axios.post(ConstantList.API_ENPOINT + "/api/appConfig", appConfig);
};

export const updateAppConfig = (appConfig) => {
  return axios.put(
    ConstantList.API_ENPOINT + "/api/appConfig/" + appConfig.id, appConfig);
};

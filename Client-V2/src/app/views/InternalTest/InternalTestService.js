import axios from "axios";
import ConstantList from "../../appConfig";
export const getAllReagents = () => {
  return axios.get(ConstantList.API_ENPOINT + "/api/internal-test/simple/1/10");
};

export const searchInternalTest = (internalTest) => {
  return axios.post(
    ConstantList.API_ENPOINT + "/api/internal-test/searchByDto", internalTest);
};

export const getByIDByParentId = (id) => {
  var url =
    ConstantList.API_ENPOINT + "/api/internal-test/findAllByReagentId/" + id;
  return axios.get(url);
};

export const getUserById = (id) => {
  return axios.get("/api/user", { data: id });
};
export const deleteItem = (id) => {
  return axios.delete(ConstantList.API_ENPOINT + "/api/internal-test/" + id);
};

export const getItemById = (id) => {
  return axios.get(ConstantList.API_ENPOINT + "/api/internal-test/" + id);
};
export const checkCode = (obj) => {
  var url = ConstantList.API_ENPOINT + "/api/internal-test/checkCode";
  return axios.post(url, obj);
};

export const addNewInternalTest = (internalTest) => {
  return axios.post(ConstantList.API_ENPOINT + "/api/internal-test", internalTest);
};

export const updateInternalTest = (internalTest) => {
  return axios.put(
    ConstantList.API_ENPOINT + "/api/internal-test/" + internalTest.id, internalTest);
};

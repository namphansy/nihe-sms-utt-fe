import axios from "axios";
import ConstantList from "../../appConfig";
const API_PATH = ConstantList.API_ENPOINT + "/api/test_machine";

export const searchByPage = (searchObject) => {
  var url = API_PATH + "/searchByDto";
  return axios.post(url, searchObject);
};

export const getItemById = (id) => {
  var url = API_PATH + "/" + id;
  return axios.get(url);
};
export const deleteItem = (id) => {
  var url = API_PATH + "/" + id;
  return axios.delete(url);
};
export const addNew = (item) => {
  var url = API_PATH;
  return axios.post(url, item);
};
export const update = (item) => {
  var url = API_PATH + "/" + item.id;
  return axios.put(url, item);
};
export const checkCode = (obj) => {
  var url = API_PATH + "/checkCode";
  return axios.post(url, obj);
};


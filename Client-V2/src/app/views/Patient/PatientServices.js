import axios from "axios";
import ConstantList from "../../appConfig";
const API_PATH = ConstantList.API_ENPOINT + "/api/patient";

export const searchByPage = (searchObject) => {
  var url = API_PATH + "/searchByDto";
  return axios.post(url, searchObject);
};

export const deleteItem = (id) => {
  let url = API_PATH + "/" + id;
  return axios.delete(url);
};

export const addNew = (obj) => {
  let url = API_PATH;
  return axios.post(url, obj);
};

export const update = (obj) => {
  let url = API_PATH + "/" + obj.id;
  return axios.put(url, obj);
};

export const getOne = (id) => {
  let url = API_PATH + "/" + id;
  return axios.get(url);
};

export const checkCode = (obj) => {
  var url = ConstantList.API_ENPOINT + "/api/patient/checkCode";
  return axios.post(url, obj);
};

export const deleteByList = (listDelete) => {
  return axios.post(API_PATH + "/delete-by-list", listDelete);
};





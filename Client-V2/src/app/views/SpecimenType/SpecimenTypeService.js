import axios from "axios";
import ConstantList from "../../appConfig";
const API_PATH = ConstantList.API_ENPOINT + "/api/specimen-type";


export const searchByPage = (searchObject) => {
  var url = API_PATH + "/searchByDto";
  return axios.post(url, searchObject);
};
// export const findAllChildHealthOrganizationByUserLogin = (searchObject) => {
//   var url = API_PATH + "/findAllChildHealthOrganizationByUserLogin";
//   return axios.post(url, searchObject);
// };

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
    var url = ConstantList.API_ENPOINT+"/api/specimen-type/checkCode";
    return axios.post(url, obj);
  };




import axios from "axios";
import ConstantList from "../../appConfig";
const API_PATH = ConstantList.API_ENPOINT + "/api/result";
const API_PATH_EXPORT_EXCEL = ConstantList.API_ENPOINT + "/api/downloadExcel";


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
    var url = ConstantList.API_ENPOINT+"/api/result/checkCode";
    return axios.post(url, obj);
};


export const exportExcel = (id) =>{
  const url = API_PATH_EXPORT_EXCEL + "/result/" + id; 
  return axios({
    url: url,
    method: "POST",
    responseType: "blob",
  });
}

export const exportExcelEIDById = (id) =>{
  const url = API_PATH_EXPORT_EXCEL + "/resultEID/" + id; 
  return axios({
    url: url,
    method: "POST",
    responseType: "blob",
  });
}

//exportEIDByRC
export const exportEIDByRC = (obj) => {
  const url =  API_PATH_EXPORT_EXCEL +"/exportEIDByRC";
  return axios({
    url: url,
    method: "POST",
    responseType: "blob",
    data: obj,
  
  });
};
// exportEIDByIT
export const exportEIDByIT = (obj) => {
  const url =  API_PATH_EXPORT_EXCEL +"/exportEIDByIT";
  return axios({
    url: url,
    method: "POST",
    responseType: "blob",
    data: obj,
  
  });
};






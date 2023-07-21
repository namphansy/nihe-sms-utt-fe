import axios from "axios";
import ConstantList from "../../appConfig";
const API_PATH = ConstantList.API_ENPOINT + "/api/result";
const API_PATH2 = ConstantList.API_ENPOINT + "/api/sms";

const API_PATH_EXPORT_EXCEL = ConstantList.API_ENPOINT + "/api/downloadExcel";


export const searchByPage = (searchObject) => {
  var url = API_PATH + "/smsResult";
  return axios.post(url, searchObject);
};

export const sentSms = (obj) => {
  let url = API_PATH2 + "/sent";
  return axios.post(url,obj);
};

export const getOne = (id) => {
    let url = API_PATH + "/" + id;
    return axios.get(url);
};











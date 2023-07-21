import axios from "axios";
import ConstantList from "../../appConfig";
const API_PATH = ConstantList.API_ENPOINT + "/api/result";
const API_PATH_EXPORT_EXCEL = ConstantList.API_ENPOINT + "/api/downloadExcel";
const API_PATH_EMAIL = ConstantList.API_ENPOINT + "/api/email";
const API_PATH_EMAIL_LOG = ConstantList.API_ENPOINT + "/api/mail-log";

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
  var url = ConstantList.API_ENPOINT + "/api/result/checkCode";
  return axios.post(url, obj);
};

export const exportExcelResultVoucher = (obj,isExportResultVoucher,isChild) => {
  const url =  API_PATH_EXPORT_EXCEL +"/result/" + isExportResultVoucher +"/" +isChild;
  return axios({
    url: url,
    method: "POST",
    responseType: "blob",
    data: obj,
  });
};

export const emailResultVoucher = (obj,isExportResultVoucher,isChild) => {
  const url =  API_PATH_EMAIL +"/send/result/" + isExportResultVoucher +"/" +isChild;
  return axios({
    url: url,
    method: "POST",
    responseType: "blob",
    data: obj,
  
  });
};

// send Email tag PDF file
export const emailResultVoucherTagPDF = (obj,isExportResultVoucher,isChild) => {
  const url =  API_PATH_EMAIL +"/send/result-pdf/" + isExportResultVoucher +"/" +isChild;
  return axios({
    url: url,
    method: "POST",
    responseType: "blob",
    data: obj,
  
  });
};
//resultVoucherEID

export const resultExcelVoucherEID = (obj) => {
  const url =  API_PATH_EXPORT_EXCEL +"/resultVoucherEID";
  return axios({
    url: url,
    method: "POST",
    responseType: "blob",
    data: obj,
  
  });
};

export const exportExcel = (obj,isExportResultVoucher,isChild) => {
  const url =  API_PATH_EXPORT_EXCEL +"/exportResult" ;
  return axios({
    url: url,
    method: "POST",
    responseType: "blob",
    data: obj,
  
  });
};

export const exportExcelResultById = (id) => {
  const url = API_PATH_EXPORT_EXCEL + "/exportExcelResultById/" + id;
  return axios({
    url: url,
    method: "POST",
    responseType: "blob",
  });
};

export const searchMailLog = (searchObject) => {
  var url = API_PATH_EMAIL_LOG + "/searchByDto";
  return axios.post(url, searchObject);
};

export const printPDFResultVoucher = (obj, isExportResultVoucher, isChild) => {
  const url =  API_PATH_EXPORT_EXCEL +"/result-printPDF/" + isExportResultVoucher +"/" +isChild;
  return axios({
    url: url,
    method: "POST",
    responseType: "blob",
    data: obj,
  });
};

export const printPDFResultVoucherByCheckbox = (obj) => {
  const url =  API_PATH_EXPORT_EXCEL +"/result-printPDF-checkbox";
  return axios({
    url: url,
    method: "POST",
    responseType: "blob",
    data: obj,
  });
};

export const printPDFResultIndividually = (obj, isExportResultVoucher, isChild) => {
  const url =  API_PATH_EXPORT_EXCEL +"/individual-result-printPDF/" + isExportResultVoucher +"/" +isChild;
  return axios({
    url: url,
    method: "POST",
    responseType: "blob",
    data: obj,
  });
};
import axios from "axios";
import ConstantList from "../../appConfig";
const API_PATH_ROLE = ConstantList.API_ENPOINT + "/api/report/";
const API_PATH_EXCEL = ConstantList.API_ENPOINT + "/api/downloadExcel/";

export const reportNumberOfTestsByResult = (dto) => {
  var params = "reportNumberOfTestsByResult";
  var url = API_PATH_ROLE + params;
  return axios.post(url,dto);
};
export const reportNumberOrgOfTestsByResult = (dto) => {
    var params = "reportNumberOrgOfTestsByResult";
    var url = API_PATH_ROLE + params;
    return axios.post(url,dto);
};

export const exportExcelReportNumberOfTestsByResult = (dto) => {
  var params = "exportExcelreportNumberOfTestsByResult";
  var urll = API_PATH_EXCEL + params;
  return axios({
    url: urll,
    method: "POST",
    responseType: "blob", // important
    data: dto,
  })
};
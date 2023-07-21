import axios from "axios";
import ConstantList from "../../appConfig";
var path = "/api/specimen";
const API_PATH_EXPORT_EXCEL = ConstantList.API_ENPOINT + "/api/downloadExcel";

export const searchByPage = (searchDto) => {
    var url = ConstantList.API_ENPOINT + path + "/searchByDto";
    return axios.post(url, searchDto);
};

export const getById = id => {
    var url = ConstantList.API_ENPOINT + path + "/" + id;
    return axios.get(url);
};

export const deleteItem = id => {
    return axios.delete(ConstantList.API_ENPOINT + path + "/" + id);
};

export const saveOrUpdate = specimen => {
    let url = ConstantList.API_ENPOINT + path;
    if (specimen.id) {
        return axios.put(url + "/" + specimen.id, specimen);
    } else {
        return axios.post(url, specimen);
    }
};

export const checkCode = (specimen) => {
    var url = ConstantList.API_ENPOINT + path + "/checkCode";
    return axios.post(url, specimen);
};

export const exportSpeOver18MById = (id) =>{
    const url = API_PATH_EXPORT_EXCEL + "/exportSpeOver18MById/" + id; 
    return axios({
      url: url,
      method: "POST",
      responseType: "blob",
    });
  }

export const exportSpeOver18MByIdPDF = (id) =>{
    const url = API_PATH_EXPORT_EXCEL + "/print-list-speciment-over18M/" + id; 
    return axios({
      url: url,
      method: "POST",
      responseType: "blob",
    });
  }

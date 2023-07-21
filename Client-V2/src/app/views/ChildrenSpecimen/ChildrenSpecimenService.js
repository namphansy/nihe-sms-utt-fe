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

export const checkCode = (code, codeInput, id) => {
    const config = { params: { id: id, code: code, codeInput: codeInput } };
    return axios.get(ConstantList.API_ENPOINT + path + "/checkCode", config);
};

export const exportListChildUnder18M = (obj) => {
    const url = API_PATH_EXPORT_EXCEL + "/exportListSpeUnder18M";
    return axios({
        url: url,
        method: "POST",
        responseType: "blob",
        data: obj,

    });
};
export const exportSpeUnder18MById = (id) => {
    const url = API_PATH_EXPORT_EXCEL + "/exportSpeUnder18MById/" + id;
    return axios({
        url: url,
        method: "POST",
        responseType: "blob",
    });
}

export const printListSpecimentUnder18M = (obj) => {
    const url = API_PATH_EXPORT_EXCEL + "/print-list-speciment-under18M";
    return axios({
        url: url,
        method: "POST",
        responseType: "blob",
        data: obj,
    });
}

export const printPdfSpecimentUnder18M = (id) => {
    const url = API_PATH_EXPORT_EXCEL + "/print-speciment-under18M/" + id;
    return axios({
        url: url,
        method: "POST",
        responseType: "blob"
    });
}
import axios from "axios";
import ConstantList from "../../appConfig";
var path = "/api/lab_test_result";

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

export const saveOrUpdate = dto => {
    let url = ConstantList.API_ENPOINT + path;
    if (dto.id) {
        return axios.put(url + "/" + dto.id, dto);
    } else {
        return axios.post(url, dto);
    }
};

export const checkCode = (dto) => {
    var url = ConstantList.API_ENPOINT + path + "/checkCode";
    return axios.post(url, dto);
};
export const exportLabTestToExcel = id => {
    var url = ConstantList.API_ENPOINT + "/api/downloadExcel/exportLabTestToExcel/" + id;
    return axios.get(url, { responseType: "blob" });
};

export const getListLabTestClone = () => {
    var url =  ConstantList.API_ENPOINT + "/api/result-clone/findAll";
    return axios.get(url)
};

export const deleteListLabTestClone = () => {
    var url =  ConstantList.API_ENPOINT + "/api/result-clone/deleteAll";
    return axios.delete(url)
};

export const getReagentCodeClone = () => {
    var url =  ConstantList.API_ENPOINT + "/api/reagent-code-clone/findAll";
    return axios.get(url)
};

export const deleteReagentCodeClone = () => {
    var url =  ConstantList.API_ENPOINT + "/api/reagent-code-clone/deleteAll";
    return axios.delete(url)
};

export const getInternalTestClone = () => {
    var url =  ConstantList.API_ENPOINT + "/api/internal-test-clone/findAll";
    return axios.get(url)
};

export const deleteInternalTestClone = () => {
    var url =  ConstantList.API_ENPOINT + "/api/internal-test-clone/deleteAll";
    return axios.delete(url)
};
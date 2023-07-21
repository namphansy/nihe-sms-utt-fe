import axios from "axios";
import ConstantList from "../../appConfig";
var path_specimen = "/api/specimen";
var path_result_clone = "/api/result-clone";

export const saveListData = (data) => {
    return axios.post(ConstantList.API_ENPOINT + path_specimen + "/saveOrUpdateList", data);
};
export const saveListDataResultClone = (data) => {
    return axios.post(ConstantList.API_ENPOINT + path_result_clone + "/saveList", data);
};


import axios from "axios";
import ConstantList from "../../appConfig";
export const getAllReagents = () => {
  return axios.get(ConstantList.API_ENPOINT + "/api/reagent-code/simple/1/10");
};

export const searchReagent = (reagent) => {
  return axios.post(
    ConstantList.API_ENPOINT + "/api/reagent-code/searchByDto",
    reagent
  );
};

export const getByIDByParentId = (id) => {
  var url =
    ConstantList.API_ENPOINT + "/api/reagent-code/findAllByReagentId/" + id;
  return axios.get(url);
};

export const getUserById = (id) => {
  return axios.get("/api/user", { data: id });
};
export const deleteItem = (id) => {
  return axios.delete(ConstantList.API_ENPOINT + "/api/reagent-code/" + id);
};

export const getItemById = (id) => {
  return axios.get(ConstantList.API_ENPOINT + "/api/reagent-code/" + id);
};
export const checkCode = (obj) => {
  var url = ConstantList.API_ENPOINT + "/api/reagent-code/checkCode";
  return axios.post(url, obj);
};

export const addNewReagentCode = (reagent) => {
  return axios.post(ConstantList.API_ENPOINT + "/api/reagent-code", reagent);
};
export const updateReagentCode = (reagent) => {
  return axios.put(
    ConstantList.API_ENPOINT + "/api/reagent-code/" + reagent.id,
    reagent
  );
};

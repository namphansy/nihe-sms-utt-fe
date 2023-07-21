import axios from "axios";
import ConstantList from "../../appConfig";
const API_PATH = ConstantList.API_ENPOINT + "/api/users/getCurrentUser";
const API_PATH_USER_ORG = ConstantList.API_ENPOINT + "/api/userOrganization";

export const getCurrentUser = ()=> {
  var url = API_PATH;
  return axios.get(url);
};

export const getUserOrgByUserId = (id)=> {
  var url = API_PATH_USER_ORG + "/getAllOrgByUserId/" + id;
  return axios.get(url);
};


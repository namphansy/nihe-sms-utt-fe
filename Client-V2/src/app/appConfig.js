const APPLICATION_PATH = "/";
const TREAMENT_ARV = {
    haveArvTreatment: 1,  //Có điều trị ARV
    noArvTratment: 2, //Không điều trị ARV
    noArvTreatmentInformation: 3, //Không có thông tin điều trị arv
}
const listArvHIVinfectedMothers = {
    noInfomation: 1, //Không có thông tin
    yet: 2, //Chưa
    yes: 3 //Có
}
const listDetailArvHIVinfectedMothers = {
    whenPregnant: 1, //Khi mang thai
    duringlabor: 2, //Khi chuyển dạ
    afterChildbirth: 3, //Sau khi sinh
    backupRegimen: 4 //Phác đồ dự phòng
}
const typeHIVinfectedMothers = {
    beforePregnancy: 1, //Trước khi mang thai
    duringPregnancy: 2, //Trong khi mang thai
    duringlabor: 3, //Khi chuyển dạ
    noInformation: 4 //Không có thông tin
}
const typeMethodFeed = {
    neverBreastfed: 1, //Chưa bao giờ bú mẹ
    currentlyBreastfeeding: 2, //Hiện đang bú mẹ
    moreThan6Weeks: 3, //Dừng bú hơn 6 tuần
    lessThan6Weeks: 4, //Dừng bú dưới 6 tuần
    noInformation: 5 //Không có thông tin
}
const typePreventionArv = {
    noInfomation: 1, //Không có thông tin
    yet: 2, //Chưa
    yes: 3 //Có
}
const typeHivAntibody = {
    notTestedYet: 1, //Chưa xét nghiệm
    positive: 2, //dương tính
    negative: 3, //Âm tính
    unknown: 4  //Không xác định
}

//const APPLICATION_PATH="/asset_develop/";//Đặt homepage tại package.json giống như tại đây nếu deploy develop
module.exports = Object.freeze({
    //ROOT_PATH : "/egret/",
    ROOT_PATH: APPLICATION_PATH,
    ACTIVE_LAYOUT: "layout1",//layout1 = vertical, layout2=horizontal
    API_ENPOINT: "http://localhost:8992/nihe",    //local
    // API_ENPOINT: "https://api.oceantech.vn/nihe",
    LOGIN_PAGE: APPLICATION_PATH + "session/signin",//Nếu là Spring
    HOME_PAGE: APPLICATION_PATH + "dashboard/analytics",//Nếu là Spring
    //HOME_PAGE:APPLICATION_PATH+"dashboard/learning-management"//Nếu là Keycloak
    //HOME_PAGE:APPLICATION_PATH+"landing3",//Link trang landing khi bắt đầu
    MATERIAL_DEPARTMENT_CODE: "VPB4",
    TREAMENT_ARV: TREAMENT_ARV,
    //ListPatientType
    childrenUnder18Months: 1, //Trẻ em 
    adults: 2, //người lớn
    hivTreatment: 3, //Bệnh nhân điều trị hiv
    listArvHIVinfectedMothers: listArvHIVinfectedMothers,
    listDetailArvHIVinfectedMothers: listDetailArvHIVinfectedMothers,
    typeHIVinfectedMothers: typeHIVinfectedMothers,
    typeMethodFeed: typeMethodFeed,
    typePreventionArv: typePreventionArv,
    typeHivAntibody: typeHivAntibody
});



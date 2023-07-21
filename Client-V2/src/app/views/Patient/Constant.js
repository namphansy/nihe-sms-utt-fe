// import ConstantList from "../../appConfig";
const listSampleType = [
    { id: 1, name: 'Mẫu thường' },
    { id: 2, name: 'Mẫu gộp' },
]

const listSampleStatus = [
    { id: 'Draft', name: "Bản nháp" },
    { id: 'Pending', name: "Chờ xử lý" },
    { id: 'Accepted', name: "Đã được chấp nhận" },
    { id: 'Checking', name: "Dương tính chờ xác nhận" },
    { id: 'Positive', name: "Dương tính" },
    { id: 'Negative', name: "Âm tính" },
    { id: 'Rejected', name: "Mẫu không thể sử dụng" },
    { id: 'Canceled', name: "Mẫu bị hủy" },
]

const listGender = [
    { id: 'M', name: 'Nam' },
    { id: 'F', name: 'Nữ' },
    { id: 'U', name: 'Không rõ' }
]

const listSmsType = [
    // { id: null, name:"Hiện tất cả"},
    { id: false, name: 'Không sử dụng dịch vụ' },
    { id: true, name: 'Có sử dụng dịch vụ' },
    // { id: null, name:"Hiện tất cả"}
]


const listArvHIVinfectedMothers = [
    { id: 1, name: "Không có thông tin" },
    { id: 2, name: "Chưa" },
    { id: 3, name: "Có" }
]

const listPatientType = [
    { id: 1, name: "Trẻ dưới 18 tháng tuổi" },
    { id: 2, name: "Trẻ từ 18 tháng tuổi" },
    { id: 3, name: "Người đã xét nghiệm đo tải lượng HIV" }
]

const listDetailArvHIVinfectedMothers = [
    { id: 1, name: "Khi mang thai" },
    { id: 2, name: "Khi chuyển dạ" },
    { id: 3, name: "Sau khi sinh" },
    { id: 4, name: "Phác đồ dự phòng" }
]

const typeHIVinfectedMothers = [
    { id: 1, name: "Trước khi mang thai" },
    { id: 2, name: "Trong khi mang thai" },
    { id: 3, name: "Khi chuyển dạ" },
    { id: 4, name: "Không có thông tin" }
]

const typeMethodFeed = [
    { id: 1, name: "Chưa bao giờ bú mẹ" },
    { id: 2, name: "Hiện đang bú mẹ" },
    { id: 3, name: "Dừng bú hơn 6 tuần" },
    { id: 4, name: "Dừng bú dưới 6 tuần" },
    { id: 5, name: "Không có thông tin" }
]

const typePreventionArv = [
    { id: 1, name: "Không có thông tin" },
    { id: 2, name: "Chưa" },
    { id: 3, name: "Có" },
]

const typeHivAntibody = [
    { id: 1, name: "Chưa xét nghiệm" },
    { id: 2, name: "Dương tính" },
    { id: 3, name: "Âm tính" },
    { id: 4, name: "Không xác định" }
]

const listHivSymptom = [
    { id: 1, name: "Có" },
    { id: 2, name: "Không" }, 
]
const typePreventionArvRegimen =[
    {id :1 , name: "NPV" },
    {id :2 , name: "NPV+AZT"},
    {id :3 , name: "AZT+3TC+NVP"},
    {id :4 , name: "Khác"},

]

module.exports = Object.freeze({
    listSampleType: listSampleType,
    listSampleStatus: listSampleStatus,
    listGender: listGender,
    listSmsType: listSmsType,
    listPatientType: listPatientType,
    listArvHIVinfectedMothers: listArvHIVinfectedMothers,
    listDetailArvHIVinfectedMothers: listDetailArvHIVinfectedMothers,
    typeHIVinfectedMothers: typeHIVinfectedMothers,
    typeMethodFeed: typeMethodFeed,
    typePreventionArv: typePreventionArv,
    typePreventionArvRegimen : typePreventionArvRegimen,
    typeHivAntibody: typeHivAntibody,
    listHivSymptom: listHivSymptom
});


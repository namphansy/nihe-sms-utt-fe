const listSampleType = [
    { id: 1, name: 'Mẫu thường' },
    { id: 2, name: 'Mẫu gộp' },
]

const listSampleStatus = [
    { id: 'Draft', name: "Bản nháp" },
    { id: 'Pending', name: "Chờ xử lý" },
    { id: 'Accepted', name : "Đã được chấp nhận"},
    { id: 'Checking', name: "Dương tính chờ xác nhận" },
    { id: 'Positive', name: "Dương tính" },
    { id: 'Negative', name : "Âm tính"},
    { id: 'Rejected', name: "Mẫu không thể sử dụng" },
    { id: 'Canceled', name : "Mẫu bị hủy"},
]

const listGender = [
    { id: 'M', name: 'Nam' },
    { id: 'F', name: 'Nữ' },
    { id: 'U', name: 'Không rõ' }
]

const listOrgType = [
    { id: 1 , name: 'Đơn vị xét nghiệm'},
    { id: 2, name: 'Đơn vị lấy mẫu'},
]

module.exports = Object.freeze({
    listSampleType: listSampleType,
    listSampleStatus: listSampleStatus,
    listGender: listGender,
    listOrgType: listOrgType,
  });

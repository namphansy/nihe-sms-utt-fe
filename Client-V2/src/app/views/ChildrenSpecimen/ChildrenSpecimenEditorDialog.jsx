import React, { Component } from "react";
import {
  Dialog,
  Button,
  Grid,
  DialogActions,
  InputAdornment,
  FormControlLabel,
  Switch,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@material-ui/core";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import ConstantList from "../../appConfig";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { checkCode as checkCodePatient } from "../Patient/PatientServices";
import UserRoles from "app/services/UserRoles";
import { saveOrUpdate, checkCode } from "./ChildrenSpecimenService";
import AsynchronousAutocomplete from "../../views/utilities/AsynchronousAutocomplete";
import Autocomplete from "@material-ui/lab/Autocomplete";
import HealthOrganizationPopup from "./HealthOrganizationPopup";
import { searchByPage as searchSpecimenType } from "../SpecimenType/SpecimenTypeService";
import PatientSearchDialog from "./PatientSearchDialog";
import { toast } from "react-toastify";
import Tooltip from "@material-ui/core/Tooltip";
import "react-toastify/dist/ReactToastify.css";
import { getAllInfoByUserLogin } from "../User/UserService";

import Constant from "../Patient/Constant";

toast.configure({
  autoClose: 2000,
  draggable: false,
  limit: 3,
});

class ChildrenSpecimenEditorDialog extends Component {
  state = {
    name: "",
    code: "",
    item: {},
    DVLM: {},
    DVXN: {},
    isActive: false,
    autoGenCode: false,
    shouldOpenHealthOrganizationPopup: false,
    shouldOpenSampleCollectOrgPopup: false,
    patient: {
      relatePatient: [],
    },
    relatePatient: [],
    pcrTest: "",
    pcrDescription: "",
    manualBirthDateCheck: false,
    pcrFirstTimeResult: "",
    pcrFirstTimeResultDes: "",
    manualTimePreventionArvTo: false,
    manualTimePreventionArvFrom: false,
  };

  listGender = [
    { id: "M", name: "Nam" },
    { id: "F", name: "Nữ" },
    { id: "U", name: "Không rõ" },
  ];

  listType = [{ id: 1, name: "Trẻ dưới 18 tháng" }];

  listSpecimenType = [
    { id: 1, name: "Mẫu máu toàn phần" },
    { id: 2, name: "Huyết tương" },
    { id: 3, name: "Huyết thanh" },
    { id: 4, name: "DBS" },
    { id: 5, name: "Khác" },
  ];

  listDBSStatus = [
    { id: 1, name: "ít" },
    { id: 2, name: "Ẩm" },
    { id: 3, name: "Đóng gói chống ẩm sai" },
    { id: 4, name: "Tốt" },
    { id: 5, name: "Khác" },
  ];

  listSpecimenStatus = [
    { id: 1, name: "Tốt" },
    { id: 2, name: "Tán huyết" },
    { id: 3, name: "Thiếu thể tích" },
    { id: 4, name: "Có cục đông" },
    { id: 5, name: "Khác" },
  ];

  listShippingStatus = [
    { id: "Draft", name: "Tạo mới" },
    { id: "Pending", name: "Chờ xử lý" },
    { id: "Accepted", name: "Đã được chấp nhận" },
    { id: "Resulted", name: "Đã có kết quả" },
  ];

  listReasonDetail = [
    { id: 1, name: "Trẻ nghi nhiễm" },
    { id: 2, name: "Trẻ sinh ra từ mẹ nhiễm HIV" },
    { id: 3, name: "Trẻ bị bỏ rơi" },
    { id: 4, name: "Khác" },
  ];

  listPCRTest = [
    { id: 1, name: "Lần 1" },
    { id: 2, name: "Lần 2" },
    { id: 3, name: "Khác" },
  ];

  listPCRTestResult = [
    { id: 1, name: "Âm tính" },
    { id: 2, name: "Dương tính" },
    { id: 3, name: "Khác" },
  ];

  listArvTreatment = [
    { id: 1, name: "Có" },
    { id: 2, name: "Không" },
    { id: 3, name: "Không xác định" },
  ];

  listPreventionArvRegimen = [
    { id: "TDF + 3TC + DTG", name: "TDF + 3TC + DTG" },
    { id: "TDF + FTC + DTG", name: "TDF + FTC + DTG" },
    { id: "TDF + 3TC + EFV", name: "TDF + 3TC + EFV" },
    { id: "TDF + FTC + EFV", name: "TDF + FTC + EFV" },
    { id: "AZT + 3TC + EFV", name: "AZT + 3TC + EFV" },
    { id: "TDF + 3TC +PI/r", name: "TDF + 3TC +PI/r" },
    { id: "TDF + FTC +PI/r", name: "TDF + FTC +PI/r" },
    { id: "ABC + 3TC + DTG", name: "ABC + 3TC + DTG" },
    { id: "Khác", name: "Khác" },
  ];

  gender = (value) => {
    //Khai báo const
    let name = "";
    if (value == "M") {
      name = "Nam";
    } else if (value == "F") {
      name = "Nữ";
    } else if (value == "U") {
      name = "Không xác định";
    }
    return name;
  };

  handleSelectSampleCollectOrg = (sampleCollectOrg) => {
    if (sampleCollectOrg && sampleCollectOrg.id) {
      this.setState({ DVLM: sampleCollectOrg });
      // this.state.DVLM.name = sampleCollectOrg.name;
      this.setState({ org: sampleCollectOrg });
      this.handleDialogClose();
    }
  };

  handleSelectHealthOrganization = (labTest) => {
    if (labTest && labTest.id) {
      this.setState({ DVXN: labTest });
      // this.state.DVXN.name = labTest.name;
      this.setState({ labTest: labTest });
      this.handleDialogClose();
    }
  };

  handleAutoGenCode = () => {
    if (this.state.autoGenCode == true) {
      this.setState({ niheCode: null });
      this.setState({ autoGenCode: false });
    }
    if (this.state.autoGenCode == false) {
      this.setState({ niheCode: null });
      this.setState({ autoGenCode: true });
    }
  };

  handleChange = (event, source) => {
    if (source == "niheCode") {
      let niheCode = event.target.value;
      if (niheCode.length < 7) {
        // item.niheCodeInput = niheCode;
        this.setState({ niheCodeInput: niheCode });
      }
      return;
    }

    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleSelectPatient = (patient) => {
    this.setState({ patient: patient }, () => {
      this.handlePatientClose();
    });
  };

  handleChangePatient = (event, source) => {
    console.log(event, source);
    let { patient } = this.state;
    patient = patient ? patient : {};

    if (source === "gender") {
      patient.gender = event.target.value;
      this.setState({ patient: patient });
      return;
    }

    if (source === "type") {
      patient.type = event.target.value;
      this.setState({ patient: patient });
      return;
    }

    if (source === "usingSms") {
      patient.usingSms = event.target.checked;
      this.setState({ patient: patient });
      return;
    }

    if (source === "childPreventionArvRegimen") {
      patient.childPreventionArvRegimen = event.target.value;
      this.setState({ patient: patient });
      return;
    }

    patient[event.target.name] = event.target.value;
    this.setState({
      patient: patient,
    });
  };

  handleRelatedChange = (event, source) => {
    if (source == "preventionArvRegimen") {
      if (event.target.value != "Khác") {
        let { relatePatient } = this.state;
        relatePatient = relatePatient ? relatePatient : {};
        relatePatient["preventionArvRegimenDes"] = null;
        relatePatient[event.target.name] = event.target.value;
        this.setState({ relatePatient: relatePatient });
        let { patient } = this.state;
        patient.relatePatient[0] = patient.relatePatient[0]
          ? patient.relatePatient[0]
          : {};
        patient.relatePatient[0]["preventionArvRegimenDes"] = null;
        patient.relatePatient[0][event.target.name] = event.target.value;
        this.setState({ patient: patient });
      }
    }
    let { relatePatient } = this.state;
    relatePatient = relatePatient ? relatePatient : {};
    relatePatient[event.target.name] = event.target.value;
    this.setState({ relatePatient: relatePatient });
    let { patient } = this.state;
    patient.relatePatient[0] = patient.relatePatient[0]
      ? patient.relatePatient[0]
      : {};
    patient.relatePatient[0][event.target.name] = event.target.value;
    this.setState({ patient: patient });
  };

  handleRelatedChangeType = (event, source) => {
    let { patient } = this.state;
    patient.relatePatient = patient.relatePatient ? patient.relatePatient : [];
    patient.relatePatient[0] = {
      ...patient.relatePatient[0],
      [event.target.name]: event.target.value,
    };
    this.setState({ patient: patient });
  };

  handleDateChangeRelated = (value, source) => {
    console.log(value);
    let { patient } = this.state;
    patient.relatePatient = patient.relatePatient ? patient.relatePatient : {};
    patient.relatePatient[0] = { ...patient.relatePatient[0], [source]: value };
    this.setState({ patient: patient });
  };

  handleDialogClose = () => {
    this.setState({
      shouldOpenEditorDialog: false,
      shouldOpenConfirmationDialog: false,
      shouldOpenNotificationPopup: false,
      shouldOpenSelectParentPopup: false,
      shouldOpenHealthOrganizationPopup: false,
      shouldOpenSampleCollectOrgPopup: false,
      shouldOpenSampleBatchDialog: false,
      // autoGenCode: false
    });
  };

  handlePatientClose = () => {
    this.setState({
      shouldOpenPatientPopup: false,
    });
  };

  handleFormSubmit = () => {
    let { id, niheCode, patient, autoGenCode, niheCodeInput } = this.state;
    let idPatient = patient?.id;
    let codePatient = patient?.patientCode;
    let objectPatient = { id: idPatient, patientCode: codePatient };
    let item = {};
    item.id = id;
    item.niheCode = niheCode;
    item.niheCodeInput = this.state.niheCodeInput;
    item.specimenType = this.state.specimenType;
    item.specimenTypeDes = this.state.specimenTypeDes;
    item.specimenDate = this.state.specimenDate;
    item.receiverDate = this.state.receiverDate;
    item.receiverBy = this.state.receiverBy;
    item.volume = this.state.volume;
    item.plasmaSeparationDate = this.state.plasmaSeparationDate;
    item.plasmaVolume = this.state.plasmaVolume;
    item.specimenStatus = this.state.specimenStatus;
    item.specimenStatusDes = this.state.specimenStatusDes;
    item.storageTemp = this.state.storageTemp;
    item.shippingTemp = this.state.shippingTemp;
    item.receivedTemp = this.state.receivedTemp;
    item.userSendId = this.state.userSendId;
    item.reasonDetailDes = this.state.reasonDetailDes;
    item.userReceivedResultId = this.state.userReceivedResultId;
    item.userReceivedResultEmail = this.state.userReceivedResultEmail;
    item.userReceivedResultPhone = this.state.userReceivedResultPhone;
    item.note = this.state.note;
    item.reasonDetail = this.state.reasonDetail;
    item.arvTreatment = this.state.arvTreatment;
    item.arvTreatmentTime = this.state.arvTreatmentTime;
    item.numberOfTests = this.state.numberOfTests;
    item.receiverDateDbs = this.state.receiverDateDbs;
    item.screeningResults = this.state.screeningResults;

    if (this.state.manualBirthDateCheck && this.state.manualBirthDate) {
      this.state.patient.birthDate = null;
    }
    if (!this.state.manualBirthDateCheck && this.state.birthDate) {
      this.state.patient.manualBirthDate = null;
    }
    if (
      this.state.manualTimePreventionArvFrom &&
      this.state.patient?.relatePatient[0]?.manualTimePreventionArvFrom
    ) {
      this.state.patient.relatePatient.timePreventionArvFrom = null;
    }
    if (
      !this.state.manualTimePreventionArvFrom &&
      this.state.patient?.relatePatient[0]?.timePreventionArvFrom
    ) {
      this.state.patient.relatePatient.manualTimePreventionArvFrom = null;
    }
    if (
      this.state.manualTimePreventionArvTo &&
      this.state.patient?.relatePatient[0]?.manualTimePreventionArvTo
    ) {
      this.state.patient.relatePatient.timePreventionArvTo = null;
    }
    if (
      !this.state.manualTimePreventionArvTo &&
      this.state.patient?.relatePatient[0]?.timePreventionArvTo
    ) {
      this.state.patient.relatePatient.manualTimePreventionArvTo = null;
    }

    this.state.patient.type = 1;
    item.patient = patient;
    item.shippingStatus = this.state.shippingStatus;
    item.belongTo = 2; // thuộc về EID
    item.autoGenCode = autoGenCode;
    item.pcrDescription = this.state.pcrDescription;
    item.pcrTest = this.state.pcrTest;
    item.pcrFirstTimeResult = this.state.pcrFirstTimeResult;
    item.pcrFirstTimeResultDes = this.state.pcrFirstTimeResultDes;
    item.dbsStatus = this.state.dbsStatus;
    item.dbsStatusDes = this.state.dbsStatusDes;

    item.relatePatient = this.state.relatePatient;

    if (this.state.org != null && this.state.org.province != null) {
      item.provinceSpecimen = this.state.org?.province;
    }
    item.specimenSource = this.state.specimenSource;

    if (this.state.DVLM != null) {
      item.org = this.state.DVLM;
    } else {
      item.org = this.state.org;
    }
    if (this.state.DVXN != null) {
      item.labTest = this.state.DVXN;
    } else {
      item.labTest = this.state.labTest;
    }

    if (patient?.manualBirthDate == null && patient?.birthDate == null) {
      toast.warning("Bạn chưa nhập ngày sinh");
      return;
    }

    if (!autoGenCode && niheCode) {
      if (niheCodeInput.length != 6) {
        toast.warning("Code mẫu phải nhập đủ 6 chữ số");
        this.setState({ permissionEdit: false, isLoading: false });
        return;
      }
      checkCode(niheCode, niheCodeInput, id).then((result) => {
        if (result.data) {
          toast.warning("Code mẫu đã được sử dụng");
          this.setState({ permissionEdit: false, isLoading: false });
        } else {
          checkCodePatient(objectPatient).then((res) => {
            if (res.data) {
              toast.warning("Code bệnh nhân mẫu đã được sử dụng");
            } else {
              if (id) {
                saveOrUpdate({
                  ...item,
                })
                  .then((data) => {
                    if (data.data.errorMessage == "409") {
                      toast.warning("Mã NIHE đã được sử dụng");
                    } else if (data.data.errorMessage == "500") {
                      toast.error("Có lỗi xảy ra khi cập nhật");
                    } else {
                      toast.success("Cập nhật thành công");
                      this.props.handleOKEditClose();
                    }
                    this.setState({ permissionEdit: false, isLoading: false });
                  })
                  .catch(() => {
                    this.setState({ permissionEdit: false, isLoading: false });
                    toast.error("Có lỗi xảy ra khi cập nhật");
                  });
              } else {
                saveOrUpdate({
                  ...item,
                })
                  .then(() => {
                    this.setState({ permissionEdit: false, isLoading: false });
                    toast.success("Thêm mới thành công");
                    this.props.handleOKEditClose();
                  })
                  .catch(() => {
                    this.setState({ permissionEdit: false, isLoading: false });
                    toast.error("Có lỗi xảy ra khi thêm mới");
                  });
              }
            }
          });
        }
      });
    } else {
      checkCodePatient(objectPatient).then((res) => {
        if (res.data) {
          toast.warning("Code bệnh nhân mẫu đã được sử dụng");
        } else {
          if (id) {
            saveOrUpdate({
              ...item,
            })
              .then(() => {
                this.setState({ permissionEdit: false, isLoading: false });
                toast.success("Cập nhật thành công");
                this.props.handleOKEditClose();
              })
              .catch(() => {
                this.setState({ permissionEdit: false, isLoading: false });
                toast.error("Có lỗi xảy ra khi cập nhật");
              });
          } else {
            saveOrUpdate({
              ...item,
            })
              .then(() => {
                this.setState({ permissionEdit: false, isLoading: false });
                toast.success("Thêm mới thành công");
                this.props.handleOKEditClose();
              })
              .catch(() => {
                this.setState({ permissionEdit: false, isLoading: false });
                toast.error("Có lỗi xảy ra khi thêm mới");
              });
          }
        }
      });
    }
  };

  handleDateChange = (value, source) => {
    this.setState({ [source]: value });
  };

  shouldOpenPatientPopup = (value) => {
    let { patient } = this.state;

    this.setState({ ...{ patient: value } });
    this.handlePatientClose();
  };

  handleDateChangePatient = (value, source) => {
    let { patient } = this.state;
    patient = patient ? patient : {};
    patient[source] = value;
    this.setState({ patient: patient });
  };

  selectSpecimenType = (value) => {
    this.setState({ specimenType: value });
  };

  componentWillMount() {
    let { item } = this.props;
    // let relatePatient;
    let permissionEdit = item?.permissionEdit;
    this.setState({ ...item, permissionEdit: permissionEdit });

    // if (
    // 	item.patient?.relatePatient != null &&
    // 	item.patient?.relatePatient.length > 0
    // ) {
    // 	relatePatient = item.patient?.relatePatient[0];
    // }
    // this.setState(item, () => {
    // 	this.setState({ relatePatient: relatePatient, permissionEdit: permissionEdit});
    // });

    if (this.props.item?.patient?.manualBirthDate) {
      this.setState({ manualBirthDateCheck: true });
    } else {
      this.setState({ manualBirthDateCheck: false });
    }

    if (this.props.item?.patient?.relatePatient[0]?.manualTimePreventionArvTo) {
      this.setState({ manualTimePreventionArvTo: true });
    }

    if (this.props.item?.patient?.relatePatient[0]?.timePreventionArvTo) {
      this.setState({ manualTimePreventionArvTo: false });
    }

    if (
      this.props.item?.patient?.relatePatient[0]?.manualTimePreventionArvFrom
    ) {
      this.setState({ manualTimePreventionArvFrom: true });
    }

    if (this.props.item?.patient?.relatePatient[0]?.timePreventionArvFrom) {
      this.setState({ manualTimePreventionArvFrom: false });
    }

    getAllInfoByUserLogin().then(({ data }) => {
      let nameHealthOrg = data?.userOrganization?.org?.name;
      if (data?.userOrganization?.org?.orgType == 2) {
        this.setState({ DVLM: data.userOrganization.org });
      } else if (data?.userOrganization?.org?.orgType == 1) {
        this.setState({ DVXN: data.userOrganization.org });
      } else {
        if (!this.state.id) {
          this.setState({ DVXN: null });
          this.setState({ DVLM: null });
        } else {
          this.setState({ DVLM: item.org });
          this.setState({ DVXN: item.labTest });
        }
      }
    });
  }

  validateForm(value) {
    let whitespace = new RegExp(/[^\s]+/);
    if (!whitespace.test(value)) {
      return true;
    }
    return false;
  }

  componentDidMount() {
    ValidatorForm.addValidationRule("whitespace", (value) => {
      if (this.validateForm(value)) {
        return false;
      }
      return true;
    });
    this.getArvTime();
  }

  componentWillUnmount() {
    ValidatorForm.removeValidationRule("whitespace");
  }

  handleManualBirthDate = () => {
    let { manualBirthDateCheck } = this.state;
    this.setState({ manualBirthDateCheck: !manualBirthDateCheck });
  };

  handleManualPreArvTo = () => {
    if (this.state.manualTimePreventionArvTo == true) {
      let { patient } = this.state;
      patient.relatePatient.manualTimePreventionArvTo = null;
      this.setState({ patient, patient });
      this.setState({ manualTimePreventionArvTo: false });
    } else if (this.state.manualTimePreventionArvTo == false) {
      let { patient } = this.state;
      patient.relatePatient.timePreventionArvTo = null;
      this.setState({ patient, patient });
      this.setState({ manualTimePreventionArvTo: true });
    }
  };

  handleManualPreArvFrom = () => {
    if (this.state.manualTimePreventionArvFrom == true) {
      let { patient } = this.state;
      patient.relatePatient.manualTimePreventionArvFrom = null;
      this.setState({ patient, patient });
      this.setState({ manualTimePreventionArvFrom: false });
    } else if (this.state.manualTimePreventionArvFrom == false) {
      let { patient } = this.state;
      patient.relatePatient.manualTimePreventionArvTo = null;
      this.setState({ patient, patient });
      this.setState({ manualTimePreventionArvFrom: true });
    }
  };

  getArvTime = () => {
    if (this.state.id) {
      if (this.state.patient?.relatePatient[0]?.manualTimePreventionArvFrom) {
        this.setState({ manualTimePreventionArvFrom: true });
      } else if (
        !this.state.patient?.relatePatient[0]?.manualTimePreventionArvFrom
      ) {
        this.setState({ manualTimePreventionArvFrom: false });
      }

      if (this.state.patient?.relatePatient[0]?.manualTimePreventionArvTo) {
        this.setState({ manualTimePreventionArvTo: true });
      } else if (
        !this.state.patient?.relatePatient[0]?.manualTimePreventionArvTo
      ) {
        this.setState({ manualTimePreventionArvTo: false });
      }
    }
  };

  render() {
    let { open, handleClose, handleOKEditClose, t, i18n } = this.props;
    let {
      id,
      niheCode,
      specimenType,
      specimenDate,
      receiverDate,
      receiverBy,
      volume,
      plasmaSeparationDate,
      plasmaVolume,
      specimenStatus,
      specimenStatusDes,
      arvTreatment,
      shouldOpenHealthOrganizationPopup,
      arvTreatmentTime,
      storageTemp,
      userReceivedResultEmail,
      userReceivedResultPhone,
      reasonDetail,
      shippingStatus,
      shouldOpenSampleCollectOrgPopup,
      shippingTemp,
      receivedTemp,
      note,
      labTest,
      org,
      item,
      shouldOpenPatientPopup,
      patient,
      isAddnew,
      autoGenCode,
      relatePatient,
      reasonDetailDes,
      dbsStatus,
      dbsStatusDes,
      specimenTypeDes,
      permissionEdit,
      specimenSource,
      pcrTest,
      pcrDescription,
      pcrFirstTimeResult,
      pcrFirstTimeResultDes,
      niheCodeInput,
    } = this.state;

    let searchObject = { pageIndex: 0, pageSize: 1000000 };

    return (
      <Dialog open={open} fullWidth maxWidth="lg">
        <div className="p-24">
          <h4 className="mb-24">
            {id ? t("general.update") : t("general.add")}{" "}
            {t("specimen.titleChildrenSpecimen")}
          </h4>
          <ValidatorForm ref="form" onSubmit={this.handleFormSubmit}>
            <Grid className="" container spacing={2}>
              <Grid xs={12}>
                <fieldset>
                  <legend>Thông tin bệnh nhân</legend>
                  {isAddnew && (
                    <Grid xs={12} spacing={2}>
                      <Button
                        className="mt-8 mb-12"
                        variant="contained"
                        size="small"
                        color="primary"
                        onClick={() => {
                          this.setState({ shouldOpenPatientPopup: true });
                        }}
                      >
                        {t("specimen.patientSelect")}
                      </Button>

                      {shouldOpenPatientPopup && (
                        <PatientSearchDialog
                          open={shouldOpenPatientPopup}
                          handleSelect={this.handleSelectPatient}
                          item={patient}
                          handleClose={this.handlePatientClose}
                          t={t}
                          i18n={i18n}
                        ></PatientSearchDialog>
                      )}
                    </Grid>
                  )}
                  <Grid item container xs={12} spacing={2}>
                    {/*---- Mã bệnh nhân --------------*/}
                    <Grid item lg={3} md={3} sm={6} xs={12}>
                      <TextValidator
                        className="w-100"
                        variant="outlined"
                        size="small"
                        label={
                          <span className="font">
                            {t("specimen.patientCode")}
                          </span>
                        }
                        onChange={this.handleChangePatient}
                        type="text"
                        name="patientCode"
                        value={patient?.patientCode ? patient?.patientCode : ""}
                        disabled={permissionEdit}
                      />
                    </Grid>
                    {/*------- Tên bệnh nhân ----------*/}
                    <Grid item lg={3} md={3} sm={6} xs={12}>
                      <TextValidator
                        className="w-100"
                        variant="outlined"
                        size="small"
                        label={
                          <span className="font">
                            <span style={{ color: "red" }}> * </span>
                            {t("specimen.fullName")}
                          </span>
                        }
                        onChange={this.handleChangePatient}
                        type="text"
                        name="fullName"
                        value={patient?.fullName ? patient?.fullName : ""}
                        validators={["required", "whitespace"]}
                        errorMessages={[
                          t("general.required"),
                          t("general.invalidCharacter"),
                        ]}
                        disabled={permissionEdit}
                      />
                    </Grid>
                    {/*-------- Tên giám hộ -----------*/}
                    <Grid item lg={3} md={3} sm={6} xs={12}>
                      <TextValidator
                        className="w-100"
                        variant="outlined"
                        size="small"
                        label={
                          <span className="font">
                            {t("specimen.parentName")}
                          </span>
                        }
                        onChange={this.handleRelatedChangeType}
                        type="text"
                        name="nameHIVinfectedMothers"
                        value={
                          patient?.relatePatient[0]?.nameHIVinfectedMothers
                            ? patient?.relatePatient[0]?.nameHIVinfectedMothers
                            : ""
                        }
                        disabled={permissionEdit}
                      />
                    </Grid>
                    {/*-------- Số điện thoại ----------*/}
                    <Grid item lg={3} md={3} sm={6} xs={12}>
                      <TextValidator
                        className="w-100"
                        variant="outlined"
                        size="small"
                        label={
                          <span className="font">{t("specimen.phone")}</span>
                        }
                        onChange={this.handleChangePatient}
                        type="text"
                        name="phone"
                        value={patient?.phone ? patient?.phone : ""}
                        disabled={permissionEdit}
                      />
                    </Grid>
                    {/*------- Ngày tháng năm sinh ------*/}
                    {this.props.isAddnew && (
                      <>
                        <Grid item lg={2} md={2} sm={6} xs={12}>
                          <TextValidator
                            className="w-100"
                            variant="outlined"
                            size="small"
                            label={
                              <span className="font">
                                <span style={{ color: "red" }}> * </span>
                                {t("general.dob")}
                              </span>
                            }
                            onChange={(manualBirthDate) =>
                              this.handleChangePatient(
                                manualBirthDate,
                                "manualBirthDate"
                              )
                            }
                            type="text"
                            name="manualBirthDate"
                            value={
                              patient
                                ? patient?.manualBirthDate
                                  ? patient?.manualBirthDate
                                  : null
                                : null
                            }
                            validators={["required", "whitespace"]}
                            errorMessages={[
                              t("general.required"),
                              t("general.invalidCharacter"),
                            ]}
                            disabled={permissionEdit}
                          />
                        </Grid>

                        <Grid item lg={2} md={2} sm={5} xs={12}>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              size="small"
                              className="w-100"
                              margin="none"
                              id="date-picker-dialog"
                              label={
                                <span>
                                  <span style={{ color: "red" }}> * </span>
                                  {t("general.dob_2")}
                                </span>
                              }
                              inputVariant="outlined"
                              type="text"
                              autoOk={true}
                              format="dd/MM/yyyy"
                              value={
                                patient
                                  ? patient?.birthDate
                                    ? patient?.birthDate
                                    : null
                                  : null
                              }
                              onChange={(value) =>
                                this.handleDateChangePatient(value, "birthDate")
                              }
                              KeyboardButtonProps={{
                                "aria-label": "change date",
                              }}
                              validators={["required", "whitespace"]}
                              errorMessages={[
                                t("general.required"),
                                t("general.invalidCharacter"),
                              ]}
                              disabled={permissionEdit}
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>
                      </>
                    )}
                    {/*-------- manualBirthDate ----------*/}
                    {!this.props.isAddnew && (
                      <>
                        {this.state.manualBirthDateCheck && (
                          <Grid item lg={2} md={2} sm={5} xs={12}>
                            <TextValidator
                              className="w-100"
                              variant="outlined"
                              size="small"
                              label={
                                <span className="font">
                                  <span style={{ color: "red" }}> * </span>
                                  {t("general.dob")}
                                </span>
                              }
                              onChange={(manualBirthDate) =>
                                this.handleChangePatient(
                                  manualBirthDate,
                                  "manualBirthDate"
                                )
                              }
                              type="text"
                              name="manualBirthDate"
                              value={
                                patient
                                  ? patient?.manualBirthDate
                                    ? patient?.manualBirthDate
                                    : null
                                  : null
                              }
                              validators={["required", "whitespace"]}
                              errorMessages={[
                                t("general.required"),
                                t("general.invalidCharacter"),
                              ]}
                              disabled={permissionEdit}
                            />
                          </Grid>
                        )}

                        {!this.state.manualBirthDateCheck && (
                          <Grid item lg={2} md={2} sm={5} xs={12}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                              <KeyboardDatePicker
                                size="small"
                                className="w-100"
                                margin="none"
                                id="date-picker-dialog"
                                label={
                                  <span>
                                    <span style={{ color: "red" }}> * </span>
                                    {t("general.dob_2")}
                                  </span>
                                }
                                inputVariant="outlined"
                                type="text"
                                autoOk={true}
                                format="dd/MM/yyyy"
                                value={
                                  patient
                                    ? patient?.birthDate
                                      ? patient?.birthDate
                                      : null
                                    : null
                                }
                                onChange={(value) =>
                                  this.handleDateChangePatient(
                                    value,
                                    "birthDate"
                                  )
                                }
                                KeyboardButtonProps={{
                                  "aria-label": "change date",
                                }}
                                validators={["required", "whitespace"]}
                                errorMessages={[
                                  t("general.required"),
                                  t("general.invalidCharacter"),
                                ]}
                                disabled={permissionEdit}
                              />
                            </MuiPickersUtilsProvider>
                          </Grid>
                        )}
                      </>
                    )}
                    {/*------ Checkbox ngày tháng năm sinh ---------*/}
                    <Grid item lg={1} md={1} sm={1} xs={12}>
                      <Tooltip title="Nhập tay" placement="bottom">
                        <Checkbox
                          checked={this.state.manualBirthDateCheck}
                          onChange={this.handleManualBirthDate}
                          inputProps={{ "aria-label": "primary checkbox" }}
                          title="Nhập tay"
                          disabled={permissionEdit}
                        />
                      </Tooltip>
                    </Grid>
                    {/*------ Loại bệnh nhân -----------------*/}
                    <Grid item lg={3} md={3} sm={6} xs={12}>
                      <FormControl
                        fullWidth={true}
                        variant="outlined"
                        size="small"
                      >
                        <InputLabel htmlFor="type-simple">
                          {
                            <span className="font">
                              {t("specimen.patientType")}
                            </span>
                          }
                        </InputLabel>
                        <Select
                          label={
                            <span className="font">
                              {t("specimen.patientType")}
                            </span>
                          }
                          defaultValue={
                            patient?.type
                              ? this.listType.find(
                                  (type) => type.id === patient?.type
                                )
                              : ""
                          }
                          value={patient?.type ? patient?.type : ""}
                          onChange={(type) =>
                            this.handleChangePatient(type, "type")
                          }
                          inputProps={{
                            name: "type",
                            id: "type-simple",
                          }}
                          disabled={permissionEdit}
                        >
                          {this.listType.map((item) => {
                            return (
                              <MenuItem key={item.id} value={item.id}>
                                {item.name}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Grid>
                    {/*-------- Giới tính ---------------------*/}
                    <Grid item lg={3} md={3} sm={6} xs={12}>
                      <FormControl
                        fullWidth={true}
                        variant="outlined"
                        size="small"
                      >
                        <InputLabel htmlFor="gender-simple">
                          {
                            <span className="font">
                              <span style={{ color: "red" }}> * </span>
                              {t("user.gender")}
                            </span>
                          }
                        </InputLabel>
                        <Select
                          label={
                            <span className="font">{t("user.gender")}</span>
                          }
                          defaultValue={
                            patient?.gender
                              ? this.listGender.find(
                                  (gender) => gender.id === patient?.gender
                                )
                              : ""
                          }
                          value={patient?.gender ? patient?.gender : ""}
                          onChange={(gender) =>
                            this.handleChangePatient(gender, "gender")
                          }
                          inputProps={{
                            name: "gender",
                            id: "gender-simple",
                          }}
                          required
                          disabled={permissionEdit}
                        >
                          {this.listGender.map((item) => {
                            return (
                              <MenuItem key={item.id} value={item.id}>
                                {item.name}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Grid>
                    {/*---------- Địa chỉ ---------------------*/}
                    <Grid item lg={3} md={3} sm={6} xs={12}>
                      <TextValidator
                        className="w-100"
                        variant="outlined"
                        size="small"
                        label={
                          <span className="font">{t("person.address")}</span>
                        }
                        onChange={this.handleChangePatient}
                        type="text"
                        name="address"
                        value={patient?.address ? patient?.address : ""}
                        disabled={permissionEdit}
                      />
                    </Grid>
                    {/*-------- Địa chỉ thường trú --------------*/}
                    <Grid item lg={3} md={3} sm={6} xs={12}>
                      <TextValidator
                        className="w-100"
                        variant="outlined"
                        size="small"
                        label={
                          <span className="font">
                            {t("person.permanentAddress")}
                          </span>
                        }
                        onChange={this.handleChangePatient}
                        type="text"
                        name="permanentAddress"
                        value={
                          patient?.permanentAddress
                            ? patient?.permanentAddress
                            : ""
                        }
                        disabled={permissionEdit}
                      />
                    </Grid>
                    {/*-------- Mẹ được điều trị ARV ------------*/}
                    <Grid item lg={3} md={3} sm={6} xs={12}>
                      <FormControl
                        fullWidth={true}
                        variant="outlined"
                        size="small"
                      >
                        <InputLabel htmlFor="gender-simple">
                          {t("specimen.isParentArvTreatment")}
                        </InputLabel>
                        <Select
                          label={t("specimen.isParentArvTreatment")}
                          value={
                            typeof patient?.relatePatient[0]
                              ?.arvHIVinfectedMothers != "undefined"
                              ? patient?.relatePatient[0]?.arvHIVinfectedMothers
                              : ""
                          }
                          onChange={(arvHIVinfectedMothers) =>
                            this.handleRelatedChangeType(
                              arvHIVinfectedMothers,
                              "arvHIVinfectedMothers"
                            )
                          }
                          inputProps={{
                            name: "arvHIVinfectedMothers",
                            id: "arvHIVinfectedMothers-simple",
                          }}
                          disabled={permissionEdit}
                        >
                          {Constant.listArvHIVinfectedMothers.map((item) => {
                            return (
                              <MenuItem key={item.id} value={item.id}>
                                {item.name}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Grid>
                    {/*-------- Phác đồ điều trị arv của mẹ --------*/}
                    {patient?.relatePatient[0]?.arvHIVinfectedMothers ==
                      ConstantList.listArvHIVinfectedMothers.yes && (
                      <Grid item lg={3} md={3} sm={6} xs={12}>
                        <FormControl
                          fullWidth={true}
                          variant="outlined"
                          size="small"
                        >
                          <InputLabel htmlFor="pcrFirstTimeResult-simple">
                            {
                              <span className="font">
                                {"Phác đồ điều trị ARV của mẹ"}
                              </span>
                            }
                          </InputLabel>

                          <Select
                            label={
                              <span className="font">
                                {"Phác đồ điều trị ARV của mẹ"}
                              </span>
                            }
                            value={
                              patient?.relatePatient[0]?.preventionArvRegimen
                                ? patient?.relatePatient[0]
                                    ?.preventionArvRegimen
                                : ""
                            }
                            onChange={(preventionArvRegimen) =>
                              this.handleRelatedChange(
                                preventionArvRegimen,
                                "preventionArvRegimen"
                              )
                            }
                            inputProps={{
                              name: "preventionArvRegimen",
                              id: "preventionArvRegimen-simple",
                            }}
                          >
                            {this.listPreventionArvRegimen.map((item) => {
                              return (
                                <MenuItem key={item.id} value={item.id}>
                                  {item.name}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                    {/*-------- Mô tả phác đồ điều trị arv của mẹ  --------*/}
                    {relatePatient?.preventionArvRegimen == "Khác" && (
                      <Grid item lg={3} md={3} sm={6} xs={12}>
                        <TextValidator
                          className="w-100"
                          variant="outlined"
                          size="small"
                          label={
                            <span className="font">
                              {"Mô tả phác đồ điều trị arv"}
                            </span>
                          }
                          onChange={this.handleRelatedChangeType}
                          type="text"
                          name="preventionArvRegimenDes"
                          value={relatePatient?.preventionArvRegimenDes}
                          disabled={permissionEdit}
                        />
                      </Grid>
                    )}

                    {patient?.relatePatient[0]?.arvHIVinfectedMothers ==
                      ConstantList.listArvHIVinfectedMothers.yes && (
                      <Grid item lg={3} md={3} sm={6} xs={12}>
                        <FormControl
                          fullWidth={true}
                          variant="outlined"
                          size="small"
                        >
                          <InputLabel htmlFor="gender-simple">
                            {t("specimen.detailArvTreatment")}
                          </InputLabel>
                          <Select
                            label={t("specimen.detailArvTreatment")}
                            value={
                              typeof patient?.relatePatient[0]
                                ?.detailArvHIVinfectedMothers != "undefined"
                                ? patient?.relatePatient[0]
                                    ?.detailArvHIVinfectedMothers
                                : ""
                            }
                            onChange={(detailArvHIVinfectedMothers) =>
                              this.handleRelatedChangeType(
                                detailArvHIVinfectedMothers,
                                "detailArvHIVinfectedMothers"
                              )
                            }
                            inputProps={{
                              name: "detailArvHIVinfectedMothers",
                              id: "detailArvHIVinfectedMothers-simple",
                            }}
                            disabled={permissionEdit}
                          >
                            {Constant.listDetailArvHIVinfectedMothers.map(
                              (item) => {
                                return (
                                  <MenuItem key={item.id} value={item.id}>
                                    {item.name}
                                  </MenuItem>
                                );
                              }
                            )}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}

                    {(patient?.relatePatient
                      ? patient.relatePatient[0]?.detailArvHIVinfectedMothers ==
                        ConstantList.listDetailArvHIVinfectedMothers
                          .whenPregnant
                      : false) &&
                      patient?.relatePatient[0]?.arvHIVinfectedMothers ==
                        ConstantList.listArvHIVinfectedMothers.yes && (
                        <Grid item lg={3} md={3} sm={6} xs={12}>
                          <TextValidator
                            className="w-100"
                            variant="outlined"
                            size="small"
                            label={
                              <span className="font">
                                {t("specimen.parentTreatmentTimePregnant")}
                              </span>
                            }
                            onChange={this.handleRelatedChange}
                            type="number"
                            name="timePregnantArvHIVinfectedMothers"
                            value={
                              patient?.relatePatient
                                ? patient?.relatePatient[0]
                                    ?.timePregnantArvHIVinfectedMothers
                                : ""
                            }
                            disabled={permissionEdit}
                          />
                        </Grid>
                      )}

                    <Grid item lg={3} md={3} sm={6} xs={12}>
                      <FormControl
                        fullWidth={true}
                        variant="outlined"
                        size="small"
                      >
                        <InputLabel htmlFor="gender-simple">
                          {t("specimen.hivInfectedMothers")}
                        </InputLabel>
                        <Select
                          label={t("specimen.hivInfectedMothers")}
                          value={
                            typeof patient?.relatePatient[0]
                              ?.hivInfectedMothers != "undefined"
                              ? patient?.relatePatient[0]?.hivInfectedMothers
                              : ""
                          }
                          onChange={(hivInfectedMothers) =>
                            this.handleRelatedChangeType(
                              hivInfectedMothers,
                              "hivInfectedMothers"
                            )
                          }
                          inputProps={{
                            name: "hivInfectedMothers",
                            id: "hivInfectedMothers-simple",
                          }}
                          disabled={permissionEdit}
                        >
                          {Constant.typeHIVinfectedMothers.map((item) => {
                            return (
                              <MenuItem key={item.id} value={item.id}>
                                {item.name}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Grid>
                    {(patient?.relatePatient
                      ? patient.relatePatient[0]?.hivInfectedMothers ==
                        ConstantList.typeHIVinfectedMothers.duringPregnancy
                      : false) && (
                      <Grid item lg={3} md={3} sm={6} xs={12}>
                        <TextValidator
                          className="w-100"
                          variant="outlined"
                          size="small"
                          label={
                            <span className="font">
                              {t("specimen.timePregnantHIVinfectedMothers")}
                            </span>
                          }
                          onChange={this.handleRelatedChange}
                          type="number"
                          name="timePregnantHIVinfectedMothers"
                          value={
                            patient?.relatePatient[0]
                              ? patient?.relatePatient[0]
                                  ?.timePregnantHIVinfectedMothers
                              : ""
                          }
                          disabled={permissionEdit}
                        />
                      </Grid>
                    )}
                    {/*------ Phương pháp nuôi dưỡng ------------*/}
                    <Grid item lg={3} md={3} sm={6} xs={12}>
                      <FormControl
                        fullWidth={true}
                        variant="outlined"
                        size="small"
                      >
                        <InputLabel htmlFor="methodFeed-simple">
                          {t("specimen.careMethod")}
                        </InputLabel>
                        <Select
                          label={t("specimen.careMethod")}
                          value={
                            typeof patient?.relatePatient[0]?.methodFeed !=
                            "undefined"
                              ? patient?.relatePatient[0]?.methodFeed
                              : ""
                          }
                          onChange={(methodFeed) =>
                            this.handleRelatedChangeType(
                              methodFeed,
                              "methodFeed"
                            )
                          }
                          inputProps={{
                            name: "methodFeed",
                            id: "methodFeed-simple",
                          }}
                          disabled={permissionEdit}
                        >
                          {Constant.typeMethodFeed.map((item) => {
                            return (
                              <MenuItem key={item.id} value={item.id}>
                                {item.name}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Grid>
                    {/*------ Trẻ dự phòng AVR --------------------*/}
                    <Grid item lg={3} md={3} sm={6} xs={12}>
                      <FormControl
                        fullWidth={true}
                        variant="outlined"
                        size="small"
                      >
                        <InputLabel htmlFor="preventionArv-simple">
                          {t("specimen.preventionArv")}
                        </InputLabel>
                        <Select
                          label={t("specimen.preventionArv")}
                          defaultValue={
                            patient?.relatePatient[0]?.preventionArv
                              ? Constant.typePreventionArv.find(
                                  (prevention) =>
                                    prevention.id ===
                                    patient?.relatePatient[0]?.preventionArv
                                )
                              : ""
                          }
                          value={
                            patient?.relatePatient[0]?.preventionArv
                              ? patient?.relatePatient[0]?.preventionArv
                              : ""
                          }
                          onChange={(preventionArv) =>
                            this.handleRelatedChangeType(
                              preventionArv,
                              "preventionArv"
                            )
                          }
                          inputProps={{
                            name: "preventionArv",
                            id: "preventionArv-simple",
                          }}
                          disabled={permissionEdit}
                        >
                          {Constant.typePreventionArv.map((item) => {
                            return (
                              <MenuItem key={item.id} value={item.id}>
                                {item.name}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Grid>
                    {patient.relatePatient[0]?.preventionArv ==
                      ConstantList.typePreventionArv.yes && (
                      <Grid item lg={3} md={3} sm={6} xs={12}>
                        <FormControl
                          fullWidth={true}
                          variant="outlined"
                          size="small"
                        >
                          <InputLabel htmlFor="childPreventionArvRegimen-simple">
                            {t("specimen.preventionArvRegimen")}
                          </InputLabel>
                          <Select
                            label={t("specimen.preventionArvRegimen")}
                            value={
                              patient?.childPreventionArvRegimen
                                ? patient?.childPreventionArvRegimen
                                : ""
                            }
                            onChange={(childPreventionArvRegimen) =>
                              this.handleChangePatient(
                                childPreventionArvRegimen,
                                "childPreventionArvRegimen"
                              )
                            }
                            inputProps={{
                              name: "childPreventionArvRegimen",
                              id: "childPreventionArvRegimen-simple",
                            }}
                            disabled={permissionEdit}
                          >
                            {Constant.typePreventionArvRegimen.map((item) => {
                              return (
                                <MenuItem key={item.id} value={item.id}>
                                  {item.name}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                    {/* here */}
                    {!this.state.manualTimePreventionArvFrom &&
                      patient?.relatePatient[0]?.preventionArv ==
                        ConstantList.typePreventionArv.yes && (
                        <Grid item lg={2} md={2} sm={5} xs={12}>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              size="small"
                              className="w-100"
                              margin="none"
                              id="date-picker-dialog"
                              label={
                                <span>
                                  {t("specimen.timePreventionArvFrom")}
                                </span>
                              }
                              // disableFuture={true}
                              inputVariant="outlined"
                              type="text"
                              // autoOk={true}
                              format="dd/MM/yyyy"
                              value={
                                patient?.relatePatient[0]?.timePreventionArvFrom
                                  ? patient?.relatePatient[0]
                                      ?.timePreventionArvFrom
                                  : null
                              }
                              onChange={(timePreventionArvFrom) =>
                                this.handleDateChangeRelated(
                                  timePreventionArvFrom,
                                  "timePreventionArvFrom"
                                )
                              }
                              KeyboardButtonProps={{
                                "aria-label": "change date",
                              }}
                              disabled={permissionEdit}
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>
                      )}

                    {this.state.manualTimePreventionArvFrom &&
                      (patient?.relatePatient
                        ? patient.relatePatient[0]?.preventionArv ==
                          ConstantList.typePreventionArv.yes
                        : false) && (
                        <Grid item lg={2} md={2} sm={5} xs={12}>
                          <TextValidator
                            className="w-100"
                            variant="outlined"
                            size="small"
                            label={
                              <span className="font">
                                {t("specimen.timePreventionArvFrom")}
                              </span>
                            }
                            onChange={this.handleRelatedChangeType}
                            type="text"
                            name="manualTimePreventionArvFrom"
                            value={
                              patient?.relatePatient
                                ? patient?.relatePatient[0]
                                    ?.manualTimePreventionArvFrom
                                : null
                            }
                            disabled={permissionEdit}
                          />
                        </Grid>
                      )}

                    {patient?.relatePatient[0]?.preventionArv ==
                      ConstantList.typePreventionArv.yes && (
                      <Grid item lg={1} md={1} sm={1} xs={12}>
                        <Tooltip title="Nhập tay" placement="bottom">
                          <Checkbox
                            checked={this.state.manualTimePreventionArvFrom}
                            onChange={this.handleManualPreArvFrom}
                            inputProps={{ "aria-label": "primary checkbox" }}
                            title="Nhập tay"
                            disabled={permissionEdit}
                          />
                        </Tooltip>
                      </Grid>
                    )}
                    {patient.relatePatient[0]?.preventionArv ==
                      ConstantList.typePreventionArv.yes &&
                      !this.state.manualTimePreventionArvTo && (
                        <Grid item lg={2} md={2} sm={5} xs={12}>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              size="small"
                              className="w-100"
                              margin="none"
                              id="date-picker-dialog"
                              label={
                                <span>{t("specimen.timePreventionArvTo")}</span>
                              }
                              minDate={
                                patient?.relatePatient[0]?.timePreventionArvFrom
                              }
                              // disableFuture={true}
                              inputVariant="outlined"
                              type="text"
                              // autoOk={true}
                              format="dd/MM/yyyy"
                              value={
                                patient?.relatePatient[0]?.timePreventionArvTo
                                  ? patient?.relatePatient[0]
                                      ?.timePreventionArvTo
                                  : null
                              }
                              onChange={(timePreventionArvTo) =>
                                this.handleDateChangeRelated(
                                  timePreventionArvTo,
                                  "timePreventionArvTo"
                                )
                              }
                              KeyboardButtonProps={{
                                "aria-label": "change date",
                              }}
                              disabled={permissionEdit}
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>
                      )}

                    {this.state.manualTimePreventionArvTo &&
                      (patient?.relatePatient
                        ? patient.relatePatient[0]?.preventionArv ==
                          ConstantList.typePreventionArv.yes
                        : false) && (
                        <Grid item lg={2} md={2} sm={5} xs={12}>
                          <TextValidator
                            className="w-100"
                            variant="outlined"
                            size="small"
                            label={
                              <span className="font">
                                {t("specimen.timePreventionArvTo")}
                              </span>
                            }
                            onChange={this.handleRelatedChangeType}
                            type="text"
                            name="manualTimePreventionArvTo"
                            value={
                              patient?.relatePatient
                                ? patient?.relatePatient[0]
                                    ?.manualTimePreventionArvTo
                                : null
                            }
                            disabled={permissionEdit}
                          />
                        </Grid>
                      )}

                    {patient?.relatePatient[0]?.preventionArv ==
                      ConstantList.typePreventionArv.yes && (
                      <Grid item lg={1} md={1} sm={1} xs={12}>
                        <Tooltip title="Nhập tay" placement="bottom">
                          <Checkbox
                            checked={this.state.manualTimePreventionArvTo}
                            onChange={this.handleManualPreArvTo}
                            inputProps={{ "aria-label": "primary checkbox" }}
                            title="Nhập tay"
                            disabled={permissionEdit}
                          />
                        </Tooltip>
                      </Grid>
                    )}
                    {/*------- specimen.hivSymptom -------------*/}
                    <Grid item lg={3} md={3} sm={6} xs={12}>
                      <FormControl
                        fullWidth={true}
                        variant="outlined"
                        size="small"
                      >
                        <InputLabel htmlFor="hivSymptom-simple">
                          {t("specimen.hivSymptom")}
                        </InputLabel>
                        <Select
                          label={t("specimen.hivSymptom")}
                          defaultValue={
                            patient?.relatePatient[0]?.hivSymptom
                              ? Constant.listHivSymptom.find(
                                  (hivSymptom) =>
                                    hivSymptom.id ===
                                    patient?.relatePatient[0]?.hivSymptom
                                )
                              : ""
                          }
                          value={
                            patient?.relatePatient[0]?.hivSymptom
                              ? patient?.relatePatient[0]?.hivSymptom
                              : ""
                          }
                          onChange={(hivSymptom) =>
                            this.handleRelatedChangeType(
                              hivSymptom,
                              "hivSymptom"
                            )
                          }
                          inputProps={{
                            name: "hivSymptom",
                            id: "hivSymptom-simple",
                          }}
                          disabled={permissionEdit}
                        >
                          {Constant.listHivSymptom.map((item) => {
                            return (
                              <MenuItem key={item.id} value={item.id}>
                                {item.name}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Grid>
                    {/*---- specimen.hivAntibody ---------*/}
                    <Grid item lg={3} md={3} sm={6} xs={12}>
                      <FormControl
                        fullWidth={true}
                        variant="outlined"
                        size="small"
                      >
                        <InputLabel htmlFor="hivAntibody-simple">
                          {t("specimen.hivAntibody")}
                        </InputLabel>
                        <Select
                          label={t("specimen.hivAntibody")}
                          defaultValue={
                            patient?.relatePatient[0]?.hivAntibody
                              ? Constant.typeHivAntibody.find(
                                  (hivAntibody) =>
                                    hivAntibody.id ===
                                    patient?.relatePatient[0]?.hivAntibody
                                )
                              : ""
                          }
                          value={
                            patient?.relatePatient[0]?.hivAntibody
                              ? patient?.relatePatient[0]?.hivAntibody
                              : ""
                          }
                          onChange={(hivAntibody) =>
                            this.handleRelatedChangeType(
                              hivAntibody,
                              "hivAntibody"
                            )
                          }
                          inputProps={{
                            name: "hivAntibody",
                            id: "hivAntibody-simple",
                          }}
                          disabled={permissionEdit}
                        >
                          {Constant.typeHivAntibody.map((item) => {
                            return (
                              <MenuItem key={item.id} value={item.id}>
                                {item.name}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Grid>
                    {/* ---------- specimen.reasonDetail ------*/}
                    <Grid item lg={3} md={3} sm={6} xs={12}>
                      <FormControl
                        fullWidth={true}
                        variant="outlined"
                        size="small"
                      >
                        <InputLabel htmlFor="shippingStatus-simple">
                          {
                            <span className="font">
                              {" "}
                              {t("specimen.reasonDetail")}
                            </span>
                          }
                        </InputLabel>
                        <Select
                          label={
                            <span className="font">
                              {t("specimen.reasonDetail")}
                            </span>
                          }
                          value={reasonDetail ? reasonDetail : ""}
                          onChange={(reasonDetail) =>
                            this.handleChange(reasonDetail, "reasonDetail")
                          }
                          inputProps={{
                            name: "reasonDetail",
                            id: "reasonDetail-simple",
                          }}
                          disabled={permissionEdit}
                        >
                          {this.listReasonDetail.map((item) => {
                            return (
                              <MenuItem key={item.id} value={item.id}>
                                {item.name}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Grid>

                    {reasonDetail == 4 && (
                      <Grid item lg={3} md={3} sm={6} xs={12}>
                        <TextValidator
                          className="w-100"
                          variant="outlined"
                          size="small"
                          label={
                            <span className="font">
                              {"Mô tả lý do chỉ định"}
                            </span>
                          }
                          onChange={this.handleChange}
                          type="text"
                          name="reasonDetailDes"
                          value={reasonDetailDes}
                        />
                      </Grid>
                    )}

                    <Grid item lg={3} md={3} sm={6} xs={12}>
                      <TextValidator
                        className="w-100"
                        variant="outlined"
                        size="small"
                        label={
                          <span className="font">
                            {t("specimen.specimenSource")}
                          </span>
                        }
                        onChange={this.handleChange}
                        type="text"
                        name="specimenSource"
                        value={specimenSource}
                        disabled={permissionEdit}
                      />
                    </Grid>

                    <Grid item lg={3} md={3} sm={6} xs={12}>
                      <TextValidator
                        className="w-100"
                        variant="outlined"
                        size="small"
                        label={
                          <span className="font">
                            {t("specimen.provinceSpecimen")}
                          </span>
                        }
                        // onChange={this.handleChange}
                        type="text"
                        name="provinceSpecimen"
                        value={
                          this.state.DVLM?.province
                            ? this.state.DVLM?.province
                            : ""
                        }
                        disabled={permissionEdit}
                      />
                    </Grid>

                    <Grid item lg={3} md={3} sm={6} xs={12}>
                      <TextValidator
                        className="w-100"
                        variant="outlined"
                        size="small"
                        label={
                          <span className="font">{t("specimen.note")}</span>
                        }
                        onChange={this.handleChange}
                        type="text"
                        name="note"
                        value={note}
                        disabled={permissionEdit}
                      />
                    </Grid>

                    <Grid item lg={3} md={3} sm={6} xs={12}>
                      <FormControl
                        fullWidth={true}
                        variant="outlined"
                        size="small"
                      >
                        <InputLabel htmlFor="pcrTest-simple">
                          {
                            <span className="font">
                              {t("specimen.pcrTest")}
                            </span>
                          }
                        </InputLabel>
                        <Select
                          label={
                            <span className="font">
                              {t("specimen.pcrTest")}
                            </span>
                          }
                          value={pcrTest ? pcrTest : ""}
                          onChange={(pcrTest) =>
                            this.handleChange(pcrTest, "pcrTest")
                          }
                          inputProps={{
                            name: "pcrTest",
                            id: "pcrTest-simple",
                          }}
                          disabled={permissionEdit}
                        >
                          {this.listPCRTest.map((item) => {
                            return (
                              <MenuItem key={item.id} value={item.id}>
                                {item.name}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Grid>

                    {this.state.pcrTest == 3 && (
                      <Grid item lg={3} md={3} sm={6} xs={12}>
                        <TextValidator
                          className="w-100"
                          variant="outlined"
                          size="small"
                          label={
                            <span className="font">
                              {t("specimen.pcrDescription")}
                            </span>
                          }
                          onChange={this.handleChange}
                          type="text"
                          name="pcrDescription"
                          value={pcrDescription}
                          disabled={permissionEdit}
                        />
                      </Grid>
                    )}

                    {this.state.pcrTest == 2 && (
                      <Grid item lg={3} md={3} sm={6} xs={12}>
                        <FormControl
                          fullWidth={true}
                          variant="outlined"
                          size="small"
                        >
                          <InputLabel htmlFor="pcrFirstTimeResult-simple">
                            {
                              <span className="font">
                                {t("specimen.pcrTestResult")}
                              </span>
                            }
                          </InputLabel>
                          <Select
                            label={
                              <span className="font">
                                {t("specimen.pcrTest")}
                              </span>
                            }
                            value={pcrFirstTimeResult ? pcrFirstTimeResult : ""}
                            onChange={(pcrFirstTimeResult) =>
                              this.handleChange(
                                pcrFirstTimeResult,
                                "pcrFirstTimeResult"
                              )
                            }
                            inputProps={{
                              name: "pcrFirstTimeResult",
                              id: "pcrFirstTimeResult-simple",
                            }}
                            disabled={permissionEdit}
                          >
                            {this.listPCRTestResult.map((item) => {
                              return (
                                <MenuItem key={item.id} value={item.id}>
                                  {item.name}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}

                    {this.state.pcrFirstTimeResult == 3 &&
                      this.state.pcrTest == 2 && (
                        <Grid item lg={3} md={3} sm={6} xs={12}>
                          <TextValidator
                            className="w-100"
                            variant="outlined"
                            size="small"
                            label={
                              <span className="font">
                                {t("specimen.pcrResultDescription")}
                              </span>
                            }
                            onChange={this.handleChange}
                            type="text"
                            name="pcrFirstTimeResultDes"
                            value={pcrFirstTimeResultDes}
                            disabled={permissionEdit}
                          />
                        </Grid>
                      )}

                    <Grid item container xs={12} spacing={2}>
                      {!this.state.id && (
                        <Grid item lg={6} md={6} sm={6} xs={12}>
                          <TextValidator
                            size="small"
                            variant="outlined"
                            className="w-100 "
                            label={
                              <span className="font">
                                {t("specimen.orgSelect")}
                              </span>
                            }
                            name="org"
                            // value={item?.org ? item.org.name : ""}
                            value={
                              this.state.DVLM?.name ? this.state.DVLM?.name : ""
                            }
                            disabled={permissionEdit}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Button
                                    size={"small"}
                                    className="align-bottom"
                                    variant="contained"
                                    color="primary"
                                    onClick={() =>
                                      this.setState({
                                        shouldOpenSampleCollectOrgPopup: true,
                                      })
                                    }
                                    disabled={permissionEdit}
                                  >
                                    {t("Select")}
                                  </Button>
                                </InputAdornment>
                              ),
                            }}
                          />

                          {shouldOpenSampleCollectOrgPopup && (
                            <HealthOrganizationPopup
                              open={shouldOpenSampleCollectOrgPopup}
                              orgType={2}
                              handleSelect={this.handleSelectSampleCollectOrg}
                              item={org}
                              handleClose={this.handleDialogClose}
                              t={t}
                              i18n={i18n}
                            ></HealthOrganizationPopup>
                          )}
                        </Grid>
                      )}

                      {this.state.id && (
                        <Grid item lg={6} md={6} sm={6} xs={12}>
                          <TextValidator
                            size="small"
                            variant="outlined"
                            className="w-100 "
                            label={
                              <span className="font">
                                {t("specimen.orgSelect")}
                              </span>
                            }
                            name="org"
                            value={this.state.org ? this.state.org.name : ""}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Button
                                    size={"small"}
                                    className="align-bottom"
                                    variant="contained"
                                    color="primary"
                                    onClick={() =>
                                      this.setState({
                                        shouldOpenSampleCollectOrgPopup: true,
                                      })
                                    }
                                  >
                                    {t("Select")}
                                  </Button>
                                </InputAdornment>
                              ),
                            }}
                          />
                          {shouldOpenSampleCollectOrgPopup && (
                            <HealthOrganizationPopup
                              open={shouldOpenSampleCollectOrgPopup}
                              orgType={2}
                              handleSelect={this.handleSelectSampleCollectOrg}
                              item={org}
                              handleClose={this.handleDialogClose}
                              t={t}
                              i18n={i18n}
                            ></HealthOrganizationPopup>
                          )}
                        </Grid>
                      )}
                      {!this.state.id && (
                        <Grid item lg={6} md={6} sm={6} xs={12}>
                          <TextValidator
                            size="small"
                            variant="outlined"
                            className="w-100 "
                            label={
                              <span className="font">
                                {t("specimen.labTestSelect")}
                              </span>
                            }
                            name="labTest"
                            value={
                              this.state.DVXN?.name ? this.state.DVXN?.name : ""
                            }
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Button
                                    size={"small"}
                                    className="align-bottom"
                                    variant="contained"
                                    color="primary"
                                    onClick={() =>
                                      this.setState({
                                        shouldOpenHealthOrganizationPopup: true,
                                      })
                                    }
                                  >
                                    {t("Select")}
                                  </Button>
                                </InputAdornment>
                              ),
                            }}
                          />
                          {shouldOpenHealthOrganizationPopup && (
                            <HealthOrganizationPopup
                              open={shouldOpenHealthOrganizationPopup}
                              orgType={1}
                              handleSelect={this.handleSelectHealthOrganization}
                              item={labTest}
                              handleClose={this.handleDialogClose}
                              t={t}
                              i18n={i18n}
                            ></HealthOrganizationPopup>
                          )}
                        </Grid>
                      )}

                      {this.state.id && (
                        <Grid item lg={6} md={6} sm={6} xs={12}>
                          <TextValidator
                            size="small"
                            variant="outlined"
                            className="w-100 "
                            label={
                              <span className="font">
                                {t("specimen.labTestSelect")}
                              </span>
                            }
                            name="labTest"
                            value={
                              this.state.labTest ? this.state.labTest.name : ""
                            }
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Button
                                    size={"small"}
                                    className="align-bottom"
                                    variant="contained"
                                    color="primary"
                                    onClick={() =>
                                      this.setState({
                                        shouldOpenHealthOrganizationPopup: true,
                                      })
                                    }
                                  >
                                    {t("Select")}
                                  </Button>
                                </InputAdornment>
                              ),
                            }}
                          />
                          {shouldOpenHealthOrganizationPopup && (
                            <HealthOrganizationPopup
                              open={shouldOpenHealthOrganizationPopup}
                              orgType={1}
                              handleSelect={this.handleSelectHealthOrganization}
                              item={labTest}
                              handleClose={this.handleDialogClose}
                              t={t}
                              i18n={i18n}
                            ></HealthOrganizationPopup>
                          )}
                        </Grid>
                      )}
                    </Grid>

                    <Grid item sm={12} xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={patient?.usingSms}
                            onChange={(usingSms) =>
                              this.handleChangePatient(usingSms, "usingSms")
                            }
                            value="usingSms"
                            disabled={permissionEdit}
                          />
                        }
                        label="Nhận SMS"
                      />
                    </Grid>
                  </Grid>
                </fieldset>
              </Grid>
              {/*------------ Mã NIHE ------------------------*/}
              {!id && (
                <Grid item lg={2} md={2} sm={6} xs={12}>
                  <TextValidator
                    disabled={permissionEdit ? permissionEdit : autoGenCode}
                    className="w-100"
                    variant="outlined"
                    size="small"
                    label={<span className="font">{t("specimen.code")}</span>}
                    onChange={(event) => this.handleChange(event, "niheCode")}
                    type="number"
                    name="niheCode"
                    value={niheCodeInput}
                  />
                </Grid>
              )}
              {id && niheCode && (
                <Grid item lg={3} md={3} sm={6} xs={12}>
                  <TextValidator
                    className="w-100"
                    variant="outlined"
                    size="small"
                    disabled={permissionEdit ? permissionEdit : autoGenCode}
                    label={<span className="font">{t("specimen.code")}</span>}
                    onChange={(event) => this.handleChange(event, "niheCode")}
                    type="number"
                    name="niheCode"
                    value={niheCodeInput}
                  />
                </Grid>
              )}
              {id && !niheCode && (
                <Grid item lg={2} md={2} sm={6} xs={12}>
                  <TextValidator
                    className="w-100"
                    variant="outlined"
                    size="small"
                    disabled={permissionEdit ? permissionEdit : autoGenCode}
                    label={<span className="font">{t("specimen.code")}</span>}
                    onChange={(event) => this.handleChange(event, "niheCode")}
                    type="number"
                    name="niheCode"
                    value={niheCodeInput}
                  />
                </Grid>
              )}

              {(!niheCode || !id) && (
                <Grid item lg={1} md={1} sm={6} xs={12}>
                  <Tooltip title="Tạo mẫu tự động" placement="bottom">
                    <Checkbox
                      onChange={this.handleAutoGenCode}
                      inputProps={{ "aria-label": "primary checkbox" }}
                      title="Tạo mẫu tự động"
                      disabled={permissionEdit}
                    />
                  </Tooltip>
                </Grid>
              )}

              {/*-------- Loại mẫu -------------*/}
              <Grid item lg={3} md={3} sm={6} xs={12}>
                <AsynchronousAutocomplete
                  label={t("specimen.type")}
                  variant="outlined"
                  size="small"
                  searchFunction={searchSpecimenType}
                  searchObject={searchObject}
                  displayLable={"name"}
                  value={specimenType ? specimenType : ""}
                  onSelect={this.selectSpecimenType}
                />
              </Grid>

              {specimenType?.name == "Khác" && (
                <Grid item lg={3} md={3} sm={6} xs={12}>
                  <TextValidator
                    className="w-100"
                    variant="outlined"
                    size="small"
                    label={
                      <span className="font">{t("Mô tả cụ thể loại mẫu")}</span>
                    }
                    onChange={this.handleChange}
                    type="text"
                    name="specimenTypeDes"
                    value={specimenTypeDes}
                    disabled={permissionEdit}
                  />
                </Grid>
              )}

              {specimenType?.name == "DBS" && (
                <Grid item lg={3} md={3} sm={6} xs={12}>
                  <FormControl fullWidth={true} variant="outlined" size="small">
                    <InputLabel htmlFor="dbsStatus-simple">
                      {<span className="font">{t("specimen.DBSStatus")}</span>}
                    </InputLabel>
                    <Select
                      label={
                        <span className="font">{t("specimen.DBSStatus")}</span>
                      }
                      value={dbsStatus ? dbsStatus : ""}
                      onChange={(dbsStatus) =>
                        this.handleChange(dbsStatus, "dbsStatus")
                      }
                      inputProps={{
                        name: "dbsStatus",
                        id: "dbsStatus-simple",
                      }}
                      disabled={permissionEdit}
                    >
                      {this.listDBSStatus.map((item) => {
                        return (
                          <MenuItem key={item.id} value={item.id}>
                            {item.name}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              {/*---------- specimen.DBSStatusDes -----------------*/}
              {dbsStatus && dbsStatus == 5 && specimenType?.name == "DBS" && (
                <Grid item lg={3} md={3} sm={6} xs={12}>
                  <TextValidator
                    className="w-100"
                    variant="outlined"
                    size="small"
                    label={
                      <span className="font">{t("specimen.DBSStatusDes")}</span>
                    }
                    onChange={this.handleChange}
                    type="text"
                    name="dbsStatusDes"
                    value={dbsStatusDes}
                    disabled={permissionEdit}
                  />
                </Grid>
              )}

              <Grid item lg={3} md={3} sm={6} xs={12}>
                <FormControl fullWidth={true} variant="outlined" size="small">
                  <InputLabel htmlFor="shippingStatus-simple">
                    {
                      <span className="font">
                        {" "}
                        {t("specimen.shippingStatus")}
                      </span>
                    }
                  </InputLabel>
                  <Select
                    label={
                      <span className="font">
                        {t("specimen.shippingStatus")}
                      </span>
                    }
                    value={shippingStatus ? shippingStatus : ""}
                    onChange={(shippingStatus) =>
                      this.handleChange(shippingStatus, "shippingStatus")
                    }
                    inputProps={{
                      name: "shippingStatus",
                      id: "shippingStatus-simple",
                    }}
                    disabled={permissionEdit}
                  >
                    {this.listShippingStatus.map((item) => {
                      return (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              {/*------- specimen.specimenDate ----------------*/}
              <Grid item lg={3} md={3} sm={6} xs={12}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    size="small"
                    className="w-100"
                    margin="none"
                    id="date-picker-dialog"
                    label={<span>{t("specimen.specimenDate")}</span>}
                    standard="standard"
                    inputVariant="outlined"
                    type="text"
                    autoOk={true}
                    format="dd/MM/yyyy HH:mm"
                    value={specimenDate ? specimenDate : null}
                    onChange={(value) =>
                      this.handleDateChange(value, "specimenDate")
                    }
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                    }}
                    disabled={permissionEdit}
                  />
                </MuiPickersUtilsProvider>
              </Grid>
              {/*------- specimen.receiverDate -------------------*/}
              <Grid item lg={3} md={3} sm={6} xs={12}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    size="small"
                    disabled={UserRoles.isUser()}
                    className="w-100"
                    margin="none"
                    id="date-picker-dialog"
                    label={<span>{t("specimen.receiverDate")}</span>}
                    inputVariant="outlined"
                    type="text"
                    autoOk={true}
                    format="dd/MM/yyyy HH:mm"
                    value={receiverDate ? receiverDate : null}
                    onChange={(value) =>
                      this.handleDateChange(value, "receiverDate")
                    }
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                    }}
                  />
                </MuiPickersUtilsProvider>
              </Grid>
              {/*------------ specimen.receiverBy -------------------*/}
              <Grid item lg={3} md={3} sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  variant="outlined"
                  size="small"
                  label={
                    <span className="font">{t("specimen.receiverBy")}</span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="receiverBy"
                  value={receiverBy}
                  // validators={["required", 'whitespace']}
                  // errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                />
              </Grid>
              {/*------- specimen.volume --------------*/}
              {this.state.specimenType?.name !== "DBS" && (
                <Grid item lg={3} md={3} sm={6} xs={12}>
                  <TextValidator
                    className="w-100"
                    variant="outlined"
                    size="small"
                    label={<span className="font">{t("specimen.volume")}</span>}
                    onChange={this.handleChange}
                    type="text"
                    name="volume"
                    value={volume}
                    disabled={permissionEdit}
                  />
                </Grid>
              )}
              {/*-------------- specimen.plasmaSeparationDate --------------*/}
              {this.state.specimenType?.name !== "DBS" && (
                <Grid item lg={3} md={3} sm={6} xs={12}>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                      size="small"
                      className="w-100"
                      margin="none"
                      id="date-picker-dialog"
                      label={<span>{t("specimen.plasmaSeparationDate")}</span>}
                      inputVariant="outlined"
                      type="text"
                      autoOk={true}
                      format="dd/MM/yyyy HH:mm"
                      value={plasmaSeparationDate ? plasmaSeparationDate : null}
                      onChange={(value) =>
                        this.handleDateChange(value, "plasmaSeparationDate")
                      }
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                      }}
                      disabled={permissionEdit}
                    />
                  </MuiPickersUtilsProvider>
                </Grid>
              )}
              {/*------------- specimen.plasmaVolume -------------------------*/}
              {this.state.specimenType?.name !== "DBS" && (
                <Grid item lg={3} md={3} sm={6} xs={12}>
                  <TextValidator
                    className="w-100"
                    variant="outlined"
                    size="small"
                    label={
                      <span className="font">{t("specimen.plasmaVolume")}</span>
                    }
                    onChange={this.handleChange}
                    type="text"
                    name="plasmaVolume"
                    value={plasmaVolume}
                    disabled={permissionEdit}
                  />
                </Grid>
              )}
              {/*------------ specimen.status ------------------------*/}
              {this.state.specimenType?.name !== "DBS" && (
                <Grid item lg={3} md={3} sm={6} xs={12}>
                  <FormControl fullWidth={true} variant="outlined" size="small">
                    <InputLabel htmlFor="specimenStatus-simple">
                      {<span className="font">{t("specimen.status")}</span>}
                    </InputLabel>
                    <Select
                      label={
                        <span className="font">{t("specimen.status")}</span>
                      }
                      value={specimenStatus ? specimenStatus : ""}
                      onChange={(specimenStatus) =>
                        this.handleChange(specimenStatus, "specimenStatus")
                      }
                      inputProps={{
                        name: "specimenStatus",
                        id: "specimenStatus-simple",
                      }}
                      disabled={permissionEdit}
                    >
                      {this.listSpecimenStatus.map((item) => {
                        return (
                          <MenuItem key={item.id} value={item.id}>
                            {item.name}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              {/*------------- specimenStatusDes ------------------*/}
              {specimenStatus == 5 && (
                <Grid item lg={3} md={3} sm={6} xs={12}>
                  <TextValidator
                    className="w-100"
                    variant="outlined"
                    size="small"
                    label={
                      <span className="font">{"Mô tả tình trạng mẫu"}</span>
                    }
                    onChange={this.handleChange}
                    type="text"
                    name="specimenStatusDes"
                    value={specimenStatusDes}
                    disabled={permissionEdit}
                  />
                </Grid>
              )}
              {/*--------- specimen.storageTemp ----------------*/}
              {this.state.specimenType?.name !== "DBS" && (
                <Grid item lg={3} md={3} sm={6} xs={12}>
                  <TextValidator
                    className="w-100"
                    variant="outlined"
                    size="small"
                    label={
                      <span className="font">{t("specimen.storageTemp")}</span>
                    }
                    onChange={this.handleChange}
                    type="text"
                    name="storageTemp"
                    value={storageTemp}
                    disabled={permissionEdit}
                  />
                </Grid>
              )}
              {/*------------ specimen.shippingTemp --------------*/}
              {this.state.specimenType?.name !== "DBS" && (
                <Grid item lg={3} md={3} sm={6} xs={12}>
                  <TextValidator
                    className="w-100"
                    variant="outlined"
                    size="small"
                    label={
                      <span className="font">{t("specimen.shippingTemp")}</span>
                    }
                    onChange={this.handleChange}
                    type="text"
                    name="shippingTemp"
                    value={shippingTemp}
                    disabled={permissionEdit}
                  />
                </Grid>
              )}
              {/*------------- specimen.receivedTemp ----------------*/}
              {this.state.specimenType?.name !== "DBS" && (
                <Grid item lg={3} md={3} sm={6} xs={12}>
                  <TextValidator
                    className="w-100"
                    variant="outlined"
                    size="small"
                    label={
                      <span className="font">{t("specimen.receivedTemp")}</span>
                    }
                    onChange={this.handleChange}
                    type="text"
                    name="receivedTemp"
                    value={receivedTemp}
                    disabled={permissionEdit}
                  />
                </Grid>
              )}
              {/*---------- specimen.userReceivedResultEmail --------------*/}
              <Grid item lg={3} md={3} sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  variant="outlined"
                  size="small"
                  label={
                    <span className="font">
                      {t("specimen.userReceivedResultEmail")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="userReceivedResultEmail"
                  value={userReceivedResultEmail}
                  validators={["isEmail"]}
                  errorMessages={["general.invalidCharacter"]}
                  disabled={permissionEdit}
                />
              </Grid>
              {/*--------- specimen.userReceivedResultPhone -------------*/}
              <Grid item lg={3} md={3} sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  variant="outlined"
                  size="small"
                  label={
                    <span className="font">
                      {t("specimen.userReceivedResultPhone")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="userReceivedResultPhone"
                  value={userReceivedResultPhone}
                  disabled={permissionEdit}
                />
              </Grid>
            </Grid>

            <DialogActions style={{ paddingRight: "0px" }}>
              <div className="flex flex-space-between flex-middle mt-24">
                <Button
                  variant="contained"
                  className="mr-12"
                  color="secondary"
                  onClick={() => this.props.handleClose()}
                >
                  {t("Huỷ")}
                </Button>
                <Button variant="contained" color="primary" type="submit">
                  {t("Lưu")}
                </Button>
              </div>
            </DialogActions>
          </ValidatorForm>
        </div>
      </Dialog>
    );
  }
}

export default ChildrenSpecimenEditorDialog;

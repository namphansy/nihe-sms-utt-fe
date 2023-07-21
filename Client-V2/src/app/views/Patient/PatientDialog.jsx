import React, { Component, useState } from "react";
import {
  Dialog,
  Button,
  Grid,
  DialogActions,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
} from "@material-ui/core";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { checkCode, updateUser, addNew, update } from "./PatientServices";
import Constant from "./Constant";
import ConstantList from "../../appConfig";
import Tooltip from "@material-ui/core/Tooltip";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import { flatMap } from "lodash-es";

toast.configure({
  autoClose: 2000,
  draggable: false,
  limit: 3,
});

class HivPatientDialog extends Component {
  // const [startDate, setStartDate] = useState(new Date());
  state = {
    fullName: "",
    monthOfPatient: "",
    patientCode: "",
    phone: "",
    address: "",
    description: "",
    usingSms: false, //Sử dụng dịch vụ sms default
    // gender: "M",
    // type: 1,
    arvHIVinfectedMothers: 1,
    isExternalOrg: false,
    isActive: false,
    shouldOpenSelectParentPopup: false,
    item: {},
    birthDate: "",
    manualTimePreventionArvTo: false,
    manualTimePreventionArvFrom: false,
    manualBirthDateCheck: false,
  };
  valueItem = {};
  //------------
  handleChange = (event, source) => {
    // debugger
    event.persist();
    if (source === "isExternalOrg") {
      this.setState({ isExternalOrg: event.target.checked });
      return;
    }
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleRelatedChange = (event, source) => {
    let { relatePatient } = this.state;
    relatePatient = relatePatient ? relatePatient : {};
    relatePatient[event.target.name] = event.target.value;
    this.setState({ relatePatient: relatePatient });
  };

  handleRelatedChangeType = (event, source) => {
    let { relatePatient } = this.state;
    relatePatient = relatePatient ? relatePatient : {};
    relatePatient[source] = event.target.value;
    this.setState({ relatePatient: relatePatient });
  };
  //-------------

  handleChangeType = (event, source) => {
    if (source === "usingSms") {
      this.setState({ [source]: event.target.checked }, () =>
        console.log(this.state)
      );

      return;
    }
    if (source === "isExternalOrg") {
      this.setState({ isExternalOrg: event.target.checked });
      return;
    }
    if (source === "gender") {
      this.setState({ [source]: event.target.value }, () =>
        console.log(this.state)
      );
      return;
    }
    if (source === "childPreventionArvRegimen") {
      this.setState({ [source]: event.target.value }, () =>
        console.log(this.state)
      );
      return;
    }

    if (source === "type") {
      this.setState({ [source]: event.target.value }, () =>
        console.log(this.state)
      );
      console.log(this.state.type);
      if (this.state.type == 1) {
        console.log("asjdaskd");
      }
    }
  };

  // handleChangePatientType = (event, source)=>{

  // }
  handleDateChangeRelated = (value, source) => {
    let { relatePatient } = this.state;
    relatePatient = relatePatient ? relatePatient : {};
    relatePatient[source] = value;
    this.setState({ relatePatient: relatePatient });
  };

  handleFormSubmit = () => {
    let { id, patientCode, relatePatient, patient } = this.state;
    let obj = { id: id, patientCode: patientCode };
    let list = [];
    if (this.state.type == 1) {
      if (
        this.state.manualTimePreventionArvFrom &&
        relatePatient?.manualTimePreventionArvFrom
      ) {
        relatePatient.timePreventionArvFrom = null;
      }
      if (
        !this.state.manualTimePreventionArvFrom &&
        relatePatient?.timePreventionArvFrom
      ) {
        relatePatient.manualTimePreventionArvFrom = null;
      }
      if (
        this.state.manualTimePreventionArvTo &&
        relatePatient?.manualTimePreventionArvTo
      ) {
        relatePatient.timePreventionArvTo = null;
      }
      if (
        !this.state.manualTimePreventionArvTo &&
        relatePatient?.timePreventionArvTo
      ) {
        relatePatient.manualTimePreventionArvTo = null;
      }
      if (this.state.manualBirthDateCheck && this.state.manualBirthDate) {
        this.state.birthDate = null;
      }
      if (!this.state.manualBirthDateCheck && this.state.birthDate) {
        this.state.manualBirthDate = null;
      }
      if (relatePatient) {
        list.push(relatePatient);
      }
    }

    // patient.relatePatient = list;

    let item = {};
    item.id = this.state.id;
    item.relatePatient = list;
    item.patientCode = this.state.patientCode;
    item.fullName = this.state.fullName;
    item.monthOfPatient = this.state.monthOfPatient;
    item.preventionArvRegimen = this.state.preventionArvRegimen;
    item.phone = this.state.phone;
    item.usingSms = this.state.usingSms;
    item.caseId = this.state.caseId;
    item.type = this.state.type;

    item.birthDate = this.state.birthDate;
    item.manualBirthDate = this.state.manualBirthDate;

    item.permanentAddress = this.state.permanentAddress;
    item.address = this.state.address;
    item.placeOfBirth = this.state.placeOfBirth;
    item.gender = this.state.gender;
    item.childPreventionArvRegimen = this.state.childPreventionArvRegimen;
    // debugger
    checkCode(obj).then((result) => {
      //Nếu trả về true là code đã được sử dụng
      if (result.data) {
        toast.warn("Code bị trùng, vui lòng kiểm tra lại");
      } else {
        //Nếu trả về false là code chưa sử dụng có thể dùng
        if (
          this.state.type == 1 &&
          this.state.birthDate == "" &&
          this.state.manualBirthDate
        ) {
          toast.error("Không được để trống ngày sinh");
        } else if (this.state.type == 1 && this.state.gender == null) {
          toast.error("Không được để trống giới tính");
        } else if (id) {
          update(item).then(() => {
            this.props.handleOKEditClose();
            toast.success("Cập nhật thành công!");
          });
        } else {
          addNew(item).then(() => {
            this.props.handleOKEditClose();
            toast.success("Thêm mới thành công!");
            // this.setState()
          });
        }
      }
    });
  };
  handleDateChange = (value, source) => {
    // debugger
    let { item } = this.state;
    item = item ? item : {};
    item[source] = value;
    this.state.birthDate = value;

    this.setState({ birthDate: value });
  };
  openParentPopup = (event) => {
    this.setState({ shouldOpenSelectParentPopup: true });
  };
  handleSelectParent = (itemParent) => {
    let { t } = this.props;
    let { id } = this.state;
    let { code, parent } = this.state;
    let idClone = id;
    let { item } = this.state;
    if (id) {
      let isCheck = false;
      let parentClone = itemParent;
      let children = this.props.item;
      // if(typeof)
      if (children.parentId === null && children.id == parentClone.id) {
        isCheck = true;
      }
      while (parentClone != null) {
        if (parentClone.id == children.id) {
          isCheck = true;
          break;
        } else {
          parentClone = parentClone.parent;
        }
      }
      if (isCheck) {
        alert(t("user.warning_parent"));
        return;
      }
    }
    //alert(parent.name);
    this.setState({ parent: itemParent });
    this.setState({ shouldOpenSelectParentPopup: false });
    //this.setState({shouldOpenSelectParentPopup:true});
  };

  handleDialogClose = () => {
    this.setState({ shouldOpenSelectParentPopup: false, autoGenCode: false });
  };

  componentWillMount() {
    let { open, handleClose, item } = this.props;
    let relatePatient;
    if (item.relatePatient != null && item.relatePatient.length > 0) {
      relatePatient = item.relatePatient[0];
    }
    this.setState(item, () => {
      this.setState({ relatePatient: relatePatient });
    });

    if (this.props.item?.birthDate) {
      this.setState({ manualBirthDateCheck: false });
    } else if (this.props.item?.manualBirthDate) {
      this.setState({ manualBirthDateCheck: true });
    }
  }

  validateForm(value) {
    let whitespace = new RegExp(/[^\s]+/);
    if (!whitespace.test(value)) {
      return true;
    }
    return false;
  }
  handleManualPreArvTo = () => {
    if (this.state.manualTimePreventionArvTo == true) {
      this.setState({ manualTimePreventionArvTo: false });
    } else if (this.state.manualTimePreventionArvTo == false) {
      this.setState({ manualTimePreventionArvTo: true });
    }
  };
  handleManualPreArvFrom = () => {
    if (this.state.manualTimePreventionArvFrom == true) {
      this.setState({ manualTimePreventionArvFrom: false });
    } else if (this.state.manualTimePreventionArvFrom == false) {
      this.setState({ manualTimePreventionArvFrom: true });
    }
  };
  handleManualBirthDate = () => {
    if (this.state.manualBirthDateCheck == true) {
      this.setState({ manualBirthDate: null });
      this.setState({ manualBirthDateCheck: false });
    } else if (this.state.manualBirthDateCheck == false) {
      this.setState({ birthDate: null });
      this.setState({ manualBirthDateCheck: true });
    }
  };

  getArvTime = () => {
    console.log(this.state.relatePatient);
    console.log("hieu");
    console.log(this.state.patientCode);
    if (this.state.id) {
      if (this.state.relatePatient[0]?.manualTimePreventionArvFrom) {
        this.setState({ manualTimePreventionArvFrom: true });
      } else if (!this.state.relatePatient[0]?.manualTimePreventionArvFrom) {
        this.setState({ manualTimePreventionArvFrom: false });
      }

      if (this.state.relatePatient[0]?.manualTimePreventionArvTo) {
        this.setState({ manualTimePreventionArvTo: true });
      } else if (!this.state.relatePatient[0]?.manualTimePreventionArvTo) {
        this.setState({ manualTimePreventionArvTo: false });
      }
    }
  };

  getBirthDate = () => {
    if (this.state.type == 1) {
      if (this.state.birthDate) {
        this.setState({ manualBirthDateCheck: false });
      } else if (this.state.manualBirthDate) {
        this.setState({ manualBirthDateCheck: true });
      }
    }
  };

  componentDidMount() {
    ValidatorForm.addValidationRule("whitespace", (value) => {
      if (this.validateForm(value)) {
        return false;
      }
      return true;
    });
    this.getArvTime();
    this.getBirthDate();
  }

  componentWillUnmount() {
    ValidatorForm.removeValidationRule("whitespace");
  }

  handleChangeValue = (item) => {
    this.valueItem = item;
    console.log(this.valueItem);
  };

  render() {
    let { open, handleClose, handleOKEditClose, t, i18n } = this.props;
    let {
      id,
      fullName,
      monthOfPatient,
      patientCode,
      phone,
      usingSms,
      address,
      childPreventionArvRegimen,
      permanentAddress,
      type,
      birthDate,
      manualBirthDate,
      nameHIVinfectedMothers,
      preventionArvRegimen,
      autoGenCode,
      relatePatient,
      arvHIVinfectedMothers,
      placeOfBirth,
      item,
      code,
      description,
      isExternalOrg,
    } = this.state;

    return (
      <Dialog open={open} fullWidth maxWidth="lg">
        <div className="p-24">
          <h4 className="mb-24">
            {id ? t("general.update") : t("general.add")}
          </h4>
          <ValidatorForm ref="form" onSubmit={this.handleFormSubmit}>
            <Grid className="" container spacing={2}>
              <Grid item lg={3} md={3} sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  variant="outlined"
                  size="small"
                  label={<span className="font">{t("patient.code")}</span>}
                  onChange={this.handleChange}
                  type="text"
                  name="patientCode"
                  value={patientCode}
                />
              </Grid>

              <Grid item lg={3} md={3} sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  variant="outlined"
                  size="small"
                  label={<span className="font">{t("patient.name")}</span>}
                  onChange={this.handleChange}
                  type="text"
                  name="fullName"
                  value={fullName}
                />
              </Grid>

              {!type && (
                <>
                  {this.state.manualBirthDateCheck && (
                    <Grid item lg={2} md={2} sm={6} xs={12}>
                      <TextValidator
                        className="w-100"
                        variant="outlined"
                        size="small"
                        label={<span className="font">{t("general.dob")}</span>}
                        onChange={this.handleChange}
                        type="text"
                        name="manualBirthDate"
                        value={manualBirthDate}
                        validators={["required", "whitespace"]}
                      />
                    </Grid>
                  )}

                  {!this.state.manualBirthDateCheck && (
                    <Grid item lg={2} md={2} sm={6} xs={12}>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                          size="small"
                          className="w-100"
                          margin="none"
                          id="date-picker-dialog"
                          label={<span>{t("general.dob")}</span>}
                          disableFuture={true}
                          inputVariant="outlined"
                          errorMessages={[
                            t("general.required"),
                            t("general.invalidCharacter"),
                          ]}
                          autoOk={true}
                          format="dd/MM/yyyy"
                          value={birthDate ? birthDate : null}
                          onChange={(value) =>
                            this.handleDateChange(value, "birthDate")
                          }
                          KeyboardButtonProps={{
                            "aria-label": "change date",
                          }}
                        />
                      </MuiPickersUtilsProvider>
                    </Grid>
                  )}
                </>
              )}

              {type == 1 && (
                <>
                  {this.state.manualBirthDateCheck && (
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
                        onChange={this.handleChange}
                        type="text"
                        name="manualBirthDate"
                        value={manualBirthDate}
                        validators={["required", "whitespace"]}
                        errorMessages={[
                          t("general.required"),
                          t("general.invalidCharacter"),
                        ]}
                        required={true}
                      />
                    </Grid>
                  )}

                  {!this.state.manualBirthDateCheck && (
                    <Grid item lg={2} md={2} sm={6} xs={12}>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                          size="small"
                          className="w-100"
                          margin="none"
                          id="date-picker-dialog"
                          label={
                            <span>
                              <span style={{ color: "red" }}> * </span>
                              {t("general.dob")}
                            </span>
                          }
                          disableFuture={true}
                          inputVariant="outlined"
                          errorMessages={[
                            t("general.required"),
                            t("general.invalidCharacter"),
                          ]}
                          autoOk={true}
                          format="dd/MM/yyyy"
                          value={birthDate ? birthDate : null}
                          onChange={(value) =>
                            this.handleDateChange(value, "birthDate")
                          }
                          KeyboardButtonProps={{
                            "aria-label": "change date",
                          }}
                        />
                      </MuiPickersUtilsProvider>
                    </Grid>
                  )}
                </>
              )}

              {(type == 2 || type == 3) && (
                <>
                  {this.state.manualBirthDateCheck && (
                    <Grid item lg={2} md={2} sm={6} xs={12}>
                      <TextValidator
                        className="w-100"
                        variant="outlined"
                        size="small"
                        label={<span className="font">{t("general.dob")}</span>}
                        onChange={this.handleChange}
                        type="text"
                        name="manualBirthDate"
                        value={manualBirthDate}
                      />
                    </Grid>
                  )}

                  {!this.state.manualBirthDateCheck && (
                    <Grid item lg={2} md={2} sm={6} xs={12}>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                          size="small"
                          className="w-100"
                          margin="none"
                          id="date-picker-dialog"
                          label={<span>{t("general.dob")}</span>}
                          disableFuture={true}
                          inputVariant="outlined"
                          errorMessages={[
                            t("general.required"),
                            t("general.invalidCharacter"),
                          ]}
                          autoOk={true}
                          format="dd/MM/yyyy"
                          value={birthDate ? birthDate : null}
                          onChange={(value) =>
                            this.handleDateChange(value, "birthDate")
                          }
                          KeyboardButtonProps={{
                            "aria-label": "change date",
                          }}
                        />
                      </MuiPickersUtilsProvider>
                    </Grid>
                  )}
                </>
              )}

              <Grid item lg={1} md={1} sm={1} xs={12}>
                <Tooltip title="Nhập tay" placement="bottom">
                  <Checkbox
                    checked={this.state.manualBirthDateCheck}
                    onChange={this.handleManualBirthDate}
                    inputProps={{ "aria-label": "primary checkbox" }}
                    title="Nhập tay"
                  />
                </Tooltip>
              </Grid>

              {type == 1 && (
                <Grid item lg={3} md={3} sm={6} xs={12}>
                  <TextValidator
                    className="w-100"
                    variant="outlined"
                    size="small"
                    label={<span className="font">{t("patient.month")}</span>}
                    onChange={this.handleChange}
                    type="text"
                    name="monthOfPatient"
                    value={monthOfPatient}
                  />
                </Grid>
              )}
              {type != 1 && (
                <Grid item lg={3} md={3} sm={6} xs={12}>
                  <FormControl fullWidth={true} variant="outlined" size="small">
                    <InputLabel htmlFor="gender-simple">
                      {t("patient.gender")}
                    </InputLabel>
                    <Select
                      label={t("patient.gender")}
                      value={
                        typeof this.state.gender != "undefined"
                          ? this.state.gender
                          : ""
                      }
                      validators={["required", "whitespace"]}
                      errorMessages={[
                        t("general.required"),
                        t("general.invalidCharacter"),
                      ]}
                      onChange={(gender) =>
                        this.handleChangeType(gender, "gender")
                      }
                      inputProps={{
                        name: "gender",
                        id: "gender-simple",
                      }}
                    >
                      {Constant.listGender.map((item) => {
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

              {type == 1 && (
                <Grid item lg={3} md={3} sm={6} xs={12}>
                  <FormControl fullWidth={true} variant="outlined" size="small">
                    <InputLabel htmlFor="gender-simple">
                      <span style={{ color: "red" }}> * </span>
                      {t("patient.gender")}
                    </InputLabel>
                    <Select
                      label={t("patient.gender")}
                      value={
                        typeof this.state.gender != "undefined"
                          ? this.state.gender
                          : ""
                      }
                      validators={["required", "whitespace"]}
                      errorMessages={[
                        t("general.required"),
                        t("general.invalidCharacter"),
                      ]}
                      onChange={(gender) =>
                        this.handleChangeType(gender, "gender")
                      }
                      inputProps={{
                        name: "gender",
                        id: "gender-simple",
                      }}
                    >
                      {Constant.listGender.map((item) => {
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

              <Grid item lg={3} md={3} sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  variant="outlined"
                  size="small"
                  label={<span className="font">{t("patient.phone")}</span>}
                  onChange={this.handleChange}
                  type="text"
                  name="phone"
                  value={phone}
                />
              </Grid>

              <Grid item lg={3} md={3} sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  variant="outlined"
                  size="small"
                  label={
                    <span className="font">
                      {/* <span style={{ color: "red" }}> * </span> */}
                      {t("patient.permanentAddress")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="permanentAddress"
                  value={permanentAddress}
                />
              </Grid>

              <Grid item lg={3} md={3} sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  variant="outlined"
                  size="small"
                  label={
                    <span className="font">{t("patient.placeOfBirth")}</span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="placeOfBirth"
                  value={placeOfBirth}
                />
              </Grid>

              <Grid item lg={3} md={3} sm={6} xs={12}>
                <FormControl fullWidth={true} variant="outlined" size="small">
                  <InputLabel htmlFor="type-patient">
                    {t("patient.type")}
                  </InputLabel>
                  <Select
                    value={
                      typeof this.state.type != "undefined"
                        ? this.state.type
                        : ""
                    }
                    label={t("patient.type")}
                    onChange={(type) => this.handleChangeType(type, "type")}
                    inputProps={{
                      name: "type",
                      id: "type-simple",
                    }}
                  >
                    {Constant.listPatientType.map((item) => {
                      return (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item md={3} sm={6} lg={9} md={12}>
                <TextValidator
                  className="w-100"
                  variant="outlined"
                  size="small"
                  label={
                    <span className="font">{t("patient.curentAddress")}</span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="address"
                  value={address}
                />
              </Grid>

              {type == 1 && (
                <>
                  <Grid item lg={3} md={3} sm={6} xs={12}>
                    <TextValidator
                      className="w-100"
                      variant="outlined"
                      size="small"
                      label={
                        <span className="font">{t("patient.parentName")}</span>
                      }
                      onChange={this.handleRelatedChange}
                      type="text"
                      name="nameHIVinfectedMothers"
                      value={relatePatient?.nameHIVinfectedMothers}
                    />
                  </Grid>
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
                          typeof relatePatient?.arvHIVinfectedMothers !=
                          "undefined"
                            ? relatePatient?.arvHIVinfectedMothers
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
                  {relatePatient?.arvHIVinfectedMothers ==
                    ConstantList.listArvHIVinfectedMothers.yes && (
                    <Grid item lg={3} md={3} sm={6} xs={12}>
                      <TextValidator
                        className="w-100"
                        variant="outlined"
                        size="small"
                        label={
                          <span className="font">
                            {/* fix translate later */}
                            {"Phác đồ điều trị ARV của mẹ"}
                          </span>
                        }
                        onChange={this.handleRelatedChange}
                        type="text"
                        name="preventionArvRegimen"
                        value={relatePatient?.preventionArvRegimen}
                      />
                    </Grid>
                  )}

                  {relatePatient?.arvHIVinfectedMothers ==
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
                            typeof relatePatient?.detailArvHIVinfectedMothers !=
                            "undefined"
                              ? relatePatient?.detailArvHIVinfectedMothers
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
                  {relatePatient?.detailArvHIVinfectedMothers ==
                    ConstantList.listDetailArvHIVinfectedMothers.whenPregnant &&
                    relatePatient?.arvHIVinfectedMothers ==
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
                            relatePatient
                              ? relatePatient?.timePregnantArvHIVinfectedMothers
                              : ""
                          }
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
                          typeof relatePatient?.hivInfectedMothers !=
                          "undefined"
                            ? relatePatient?.hivInfectedMothers
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
                  {relatePatient?.hivInfectedMothers ==
                    ConstantList.typeHIVinfectedMothers.duringPregnancy && (
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
                          relatePatient
                            ? relatePatient?.timePregnantHIVinfectedMothers
                            : ""
                        }
                      />
                    </Grid>
                  )}

                  {/* <Grid item lg={3} md={3} sm={6} xs={12}>
                    <TextValidator
                      className="w-100"
                      variant="outlined"
                      size="small"
                      label={<span className="font">
                        {t("patient.month")}
                      </span>}
                      onChange={this.handleChange}
                      type="text"
                      name="monthOfPatient"
                      value={monthOfPatient}
                    />
                  </Grid> */}

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
                          typeof relatePatient?.methodFeed != "undefined"
                            ? relatePatient?.methodFeed
                            : ""
                        }
                        onChange={(methodFeed) =>
                          this.handleRelatedChangeType(methodFeed, "methodFeed")
                        }
                        inputProps={{
                          name: "methodFeed",
                          id: "methodFeed-simple",
                        }}
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
                        value={
                          typeof relatePatient?.preventionArv != "undefined"
                            ? relatePatient?.preventionArv
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

                  {relatePatient?.preventionArv ==
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
                            typeof this.state.childPreventionArvRegimen !=
                            "undefined"
                              ? this.state.childPreventionArvRegimen
                              : ""
                          }
                          onChange={(childPreventionArvRegimen) =>
                            this.handleChangeType(
                              childPreventionArvRegimen,
                              "childPreventionArvRegimen"
                            )
                          }
                          inputProps={{
                            name: "childPreventionArvRegimen",
                            id: "childPreventionArvRegimen-simple",
                          }}
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
                    relatePatient?.preventionArv ==
                      ConstantList.typePreventionArv.yes && (
                      <Grid item lg={2} md={2} sm={5} xs={12}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                          <KeyboardDatePicker
                            size="small"
                            className="w-100"
                            margin="none"
                            id="date-picker-dialog"
                            label={
                              <span>{t("specimen.timePreventionArvFrom")}</span>
                            }
                            disableFuture={true}
                            inputVariant="outlined"
                            type="text"
                            autoOk={true}
                            format="dd/MM/yyyy"
                            value={
                              relatePatient?.timePreventionArvFrom
                                ? relatePatient?.timePreventionArvFrom
                                : null
                            }
                            onChange={(value) =>
                              this.handleDateChangeRelated(
                                value,
                                "timePreventionArvFrom"
                              )
                            }
                            KeyboardButtonProps={{
                              "aria-label": "change date",
                            }}
                          />
                        </MuiPickersUtilsProvider>
                      </Grid>
                    )}
                  {this.state.manualTimePreventionArvFrom && (
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
                        onChange={this.handleRelatedChange}
                        type="text"
                        name="manualTimePreventionArvFrom"
                        value={relatePatient?.manualTimePreventionArvFrom}
                      />
                    </Grid>
                  )}
                  {relatePatient?.preventionArv ==
                    ConstantList.typePreventionArv.yes && (
                    <Grid item lg={1} md={1} sm={1} xs={12}>
                      <Tooltip title="Nhập tay" placement="bottom">
                        <Checkbox
                          checked={this.state.manualTimePreventionArvFrom}
                          onChange={this.handleManualPreArvFrom}
                          inputProps={{ "aria-label": "primary checkbox" }}
                          title="Nhập tay"
                        />
                      </Tooltip>
                    </Grid>
                  )}
                  {!this.state.manualTimePreventionArvTo &&
                    relatePatient?.preventionArv ==
                      ConstantList.typePreventionArv.yes && (
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
                            disableFuture={true}
                            inputVariant="outlined"
                            type="text"
                            autoOk={true}
                            format="dd/MM/yyyy"
                            value={
                              relatePatient?.timePreventionArvTo
                                ? relatePatient?.timePreventionArvTo
                                : null
                            }
                            onChange={(value) =>
                              this.handleDateChangeRelated(
                                value,
                                "timePreventionArvTo"
                              )
                            }
                            KeyboardButtonProps={{
                              "aria-label": "change date",
                            }}
                          />
                        </MuiPickersUtilsProvider>
                      </Grid>
                    )}
                  {this.state.manualTimePreventionArvTo && (
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
                        onChange={this.handleRelatedChange}
                        type="text"
                        name="manualTimePreventionArvTo"
                        value={relatePatient?.manualTimePreventionArvTo}
                      />
                    </Grid>
                  )}

                  {relatePatient?.preventionArv ==
                    ConstantList.typePreventionArv.yes && (
                    <Grid item lg={1} md={1} sm={1} xs={12}>
                      <Tooltip title="Nhập tay" placement="bottom">
                        <Checkbox
                          checked={this.state.manualTimePreventionArvTo}
                          onChange={this.handleManualPreArvTo}
                          inputProps={{ "aria-label": "primary checkbox" }}
                          title="Nhập tay"
                        />
                      </Tooltip>
                    </Grid>
                  )}

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
                        value={
                          typeof relatePatient?.hivSymptom != "undefined"
                            ? relatePatient?.hivSymptom
                            : ""
                        }
                        onChange={(hivSymptom) =>
                          this.handleRelatedChangeType(hivSymptom, "hivSymptom")
                        }
                        inputProps={{
                          name: "hivSymptom",
                          id: "hivSymptom-simple",
                        }}
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
                        value={
                          typeof relatePatient?.hivAntibody != "undefined"
                            ? relatePatient?.hivAntibody
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
                </>
              )}
              <Grid item sm={12} xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={usingSms}
                      onChange={(usingSms) =>
                        this.handleChangeType(usingSms, "usingSms")
                      }
                      value="usingSms"
                    />
                  }
                  label={t("patient.sms")}
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
                  {t("general.cancel")}
                </Button>
                <Button variant="contained" color="primary" type="submit">
                  {t("general.save")}
                </Button>
              </div>
            </DialogActions>
          </ValidatorForm>
        </div>
      </Dialog>
    );
  }
}

export default HivPatientDialog;

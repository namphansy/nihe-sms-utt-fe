import React, { Component, useState } from "react";
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
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { checkCode, updateUser, addNew, update } from "./PatientResultEIDService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import DateFnsUtils from '@date-io/date-fns';
import { searchByPage as SearchSpecimen } from "../Specimen/SpecimenService";
import { searchByPage as SearchLabTestResult } from "../SampleList/SampleListService";
// import { searchByPage as SearchLabTestResult} from "../Lab/SpecimenService";
import AsynchronousAutocomplete from "../utilities/AsynchronousAutocomplete";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";

toast.configure({
  autoClose: 2000,
  draggable: false,
  limit: 3,
});

class ResultDialog extends Component {
  state = {
    code: "",
    isActive: false,
    item: {},
    resultDate: "",
  };

  handleChange = (event, source) => {
    if(source === "status"){
      if(event.target.value === "Undetachable"){
        this.setState({ labResult: null})
      }
    }
    this.setState({
      [event.target.name]: event.target.value,

    });
  };

  type = [
    { id: 1, name: "NormalVL" },
    { id: 2, name: "EID" }
  ]
  resultStatus = [
    { id: 1, name: "Âm tính" },
    { id: 2, name: "Dương tính" },
    { id: 3, name: "Không xác định" }
  ]

  handleFormSubmit = () => {
    let { id, code } = this.state;
    let obj = { id: id, code: code };

    let item = {};
    item.id = this.state.id;
    item.testCode = this.state.testCode;
    item.labResult = this.state.labResult;
    item.resultDate = this.state.resultDate;
    item.resultStatus = this.state.resultStatus;
    item.times = this.state.times;
    item.type = this.state.type;
    item.specimen = this.state.specimen;
    item.labTestResult = this.state.labTestResult;
    item.status = this.state.status;
    checkCode(obj).then((result) => {
      //Nếu trả về true là code đã được sử dụng
      if (result.data) {
        toast.warn("Code bị trùng, vui lòng kiểm tra lại");
      } else {
        //Nếu trả về false là code chưa sử dụng có thể dùng
        if (id) {
          update(
            item
          ).then(() => {
            this.props.handleOKEditClose();
            toast.success("Cập nhật thành công!")
          });

        } else {
          addNew(
            item
          ).then(() => {
            this.props.handleOKEditClose();
            toast.success("Thêm mới thành công!")
            // this.setState()
          });
        }
      }
    });
  };


  selectSpecimen = (value) => {
    this.setState({ specimen: value });
  }
  selectLabTestResult = (value) => {
    this.setState({ labTestResult: value });
  }

  handleDateChange = (value, source) => {
    let { item } = this.state;
    let resultDate = "";
    item = item ? item : {};

    item[source] = value;
    this.setState({ item: item });
    this.setState({ resultDate: value });
    resultDate = item.resultDate;
  }

  componentWillMount() {
    let { open, handleClose, item } = this.props;
    this.setState(item);
  }

  validateForm(value) {
    let whitespace = new RegExp(/[^\s]+/);
    if (!whitespace.test(value)) {
      return true
    }
    return false
  }

  componentDidMount() {
    ValidatorForm.addValidationRule('whitespace', (value) => {
      if (this.validateForm(value)) {
        return false;
      }
      return true;
    });
  }

  componentWillUnmount() {
    ValidatorForm.removeValidationRule('whitespace');
  }

  render() {
    let { open, handleClose, handleOKEditClose, t, i18n } = this.props;
    let { id, testCode, labResult, resultDate, item, specimen, resultStatus, labTestResult, times, type, status } = this.state;
    let searchObject = { pageIndex: 0, pageSize: 100000 }

    return (
      <Dialog open={open} fullWidth maxWidth="md">
        <div className="p-24">
          <h4 className="mb-24">{id ? t("general.update") : t("general.add")}</h4>
          <ValidatorForm ref="form" onSubmit={this.handleFormSubmit}>
            <Grid className="" container spacing={2}>
              <Grid item lg={4} md={4} sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  variant="outlined"
                  size="small"
                  label={<span className="font">
                    <span style={{ color: "red" }}> * </span>
                    {t("result.code")}
                  </span>}
                  onChange={this.handleChange}
                  type="text"
                  name="testCode"
                  value={testCode}
                  validators={["required", 'whitespace']}
                  errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                />
              </Grid>
              <Grid item lg={4} md={4} sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  variant="outlined"
                  size="small"
                  label={<span className="font">
                    {t("specimen.patientCode")}
                  </span>}
                  onChange={this.handleChange}
                  type="text"
                  name="patientCode"
                  value={specimen?.patientCode}

                />
              </Grid>

              <Grid item lg={4} md={4} sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  variant="outlined"
                  size="small"
                  label={<span className="font">
                    {t("specimen.fullName")}
                  </span>}
                  onChange={this.handleChange}
                  type="text"
                  name="fullName"
                  value={specimen?.patient?.fullName}

                />
              </Grid>
              {this.state.specimen?.patient?.birthDate &&
                <Grid item lg={4} md={4} sm={6} xs={12}>
                  <TextValidator
                    className="w-100"
                    variant="outlined"
                    size="small"
                    label={<span className="font">
                      {t("specimen.birthDate")}
                    </span>}
                    onChange={this.handleChange}
                    type="text"
                    name="birthDate"
                    value={moment(specimen?.patient?.birthDate).format("DD/MM/YYYY")}
                  />
                </Grid>
              }

              {this.state.specimen?.patient?.manualBirthDate &&
                <Grid item lg={4} md={4} sm={6} xs={12}>
                  <TextValidator
                    className="w-100"
                    variant="outlined"
                    size="small"
                    label={<span className="font">
                      {t("specimen.birthDate")}
                    </span>}
                    onChange={this.handleChange}
                    type="text"
                    name="birthDate"
                    value={specimen?.patient?.manualBirthDate}
                  />
                </Grid>
              }

              <Grid item lg={4} md={4} sm={6} xs={12}>
                <FormControl className="w-100" variant="outlined" size="small">
                  <InputLabel htmlFor="type-simple">
                    {
                      <span className="font">
                        {t("Tình trạng đo")}
                      </span>
                    }
                  </InputLabel>
                  <Select
                    label={
                      <span className="font">
                        {t("Tình trạng đo")}
                      </span>
                    }
                    value={status}
                    onChange={status => this.handleChange(status, "status")}
                    inputProps={{
                      name: "status",
                      id: "status-simple"
                    }}
                  >
                    <MenuItem value={"HaveResulted"}>Đo được tải lượng Virus</MenuItem>
                    <MenuItem value={"Undetachable"}>Không phát hiện</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {status === "HaveResulted" && (<Grid item lg={4} md={4} sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  variant="outlined"
                  size="small"
                  label={<span className="font">
                    <span style={{ color: "red" }}> * </span>
                    {t("result.status") + "(cp/ml)"}
                  </span>}
                  onChange={this.handleChange}
                  type="text"
                  name="labResult"
                  value={labResult}
                  validators={["required", 'whitespace']}
                  errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                />
              </Grid>)}

              <Grid item lg={4} md={4} sm={6} xs={12}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    size="small"
                    className="w-100"
                    margin="none"
                    id="date-picker-dialog"
                    label={
                      <span>
                        {t("result.date")}
                      </span>
                    }
                    inputVariant="outlined"
                    type="text"
                    autoOk={true}
                    format="dd/MM/yyyy HH:ss"
                    value={resultDate ? resultDate : null}
                    onChange={(resultDate) => this.handleDateChange(resultDate, "resultDate")}
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                    }}
                  />
                </MuiPickersUtilsProvider>
              </Grid>

              <Grid item lg={4} md={4} sm={6} xs={12}>
                <FormControl fullWidth={true} variant="outlined" size="small">
                  <InputLabel htmlFor="type-simple">
                    {
                      <span className="font">
                        {t("result.type")}
                      </span>
                    }
                  </InputLabel>
                  <Select
                    label={<span className="font">{t("result.type")}</span>}
                    value={type ? type : ""}
                    onChange={(type) => this.handleChange(type, "type")}
                    inputProps={{
                      name: "type",
                      id: "type-simple",
                    }}
                  >
                    {this.type.map((item) => {
                      return (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item lg={4} md={4} sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  variant="outlined"
                  size="small"
                  onChange={this.handleChange}
                  label={t("result.times")}
                  type="number"
                  name="times"
                  value={times}
                  validators={["required", 'whitespace']}
                  errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                />
              </Grid>
              <Grid item lg={4} md={4} sm={6} xs={12}>
                <FormControl fullWidth={true} variant="outlined" size="small">
                  <InputLabel htmlFor="resultStatus-simple" variant="outlined">
                    {
                      <span className="font">
                        {t("result.status")}
                      </span>
                    }
                  </InputLabel>
                  <Select
                    label={<span className="font">{t("result.status")}</span>}
                    value={resultStatus ? resultStatus : ""}
                    onChange={(resultStatus) => this.handleChange(resultStatus, "resultStatus")}
                    inputProps={{
                      name: "resultStatus",
                      id: "type-simple",
                    }}
                  >
                    {this.resultStatus.map((item) => {
                      return (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              {/* -----------------Chọn mẫu xét nghiệm và lab test result */}

              <Grid item lg={4} md={4} sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  variant="outlined"
                  size="small"
                  label={t('result.codeSelect')}
                  disabled={true}
                  value={specimen.niheCode}
                />
              </Grid>
              <Grid item lg={4} md={4} sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  variant="outlined"
                  size="small"
                  label={t('result.codeSelect')}
                  disabled={true}
                  value={labTestResult?.code}
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

export default ResultDialog;

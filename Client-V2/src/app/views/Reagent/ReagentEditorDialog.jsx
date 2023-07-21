import React, { Component } from "react";
import {
  Dialog,
  Button,
  DialogActions,
  Grid,
  Checkbox,
  FormControlLabel,
  DialogTitle,
  TextField,
  DialogContent,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  FormHelperText,
  Icon,
  IconButton,
} from "@material-ui/core";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { checkCode, addNewReagent, updateReagent } from "./ReagentService";
import { MuiPickersUtilsProvider, DateTimePicker, DatePicker, KeyboardDatePicker } from "@material-ui/pickers";
import LocalConstants from "./Constants";
import DateFnsUtils from "@date-io/date-fns";
import Draggable from "react-draggable";
import Paper from "@material-ui/core/Paper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../../styles/views/_style.scss";

toast.configure();

function PaperComponent(props) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

class ReagentEditorDialog extends Component {
  state = {
    name: "",
    code: "",
    description: "",
    registrationNumber: "", //Số đăng ký
    dateOfIssue: new Date(), //Ngày cấp
    expirationDate: new Date(), //Ngày hết hạn
    activeIngredients: "", //Hoạt chất
    dosageForms: "", //Dạng bào chế
    packing: "", //Quy cách đóng gói
    registeredFacilityName: "", //Tên cơ sở đăng ký
    productionFacilityName: "", //Tên cơ sở sản xuất
    healthDepartmentDirectory: true, //thuộc bộ y tế
    testType: null, //Thuộc phương pháp xét nghiệm nào
    isActive: false,
    isView: false,
    hasTestType: false,
    loading: false,
    reagentSource: "",
  };

  list() {
    let listMethod = [
      { value: LocalConstants.EQAResultReportTypeMethod.Elisa, name: "Elisa" },
      {
        value: LocalConstants.EQAResultReportTypeMethod.FastTest,
        name: "Test nhanh",
      },
      {
        value: LocalConstants.EQAResultReportTypeMethod.ECL,
        name: "Điện hóa phát quang",
      },
      {
        value: LocalConstants.EQAResultReportTypeMethod.SERODIA,
        name: "Serodia",
      },
    ];
    this.setState({ listMethod: listMethod });
  }
  
  saveRegant = () => {
    let { id, code, testType, item } = this.state;
    let { t } = this.props;
    this.setState({ isView: true, loading: true });
    // checkCode(id, item.code).then((result) => {
    //   //Nếu trả về true là code đã được sử dụng
    //   if (result.data) {
    //     toast.warning(t("mess_code"));
    //     this.setState({ isView: false, loading: false });
    //   } else {
        //Nếu trả về false là code chưa sử dụng có thể dùng
        if (id) {
          updateReagent({
            ...this.state.item,
          }).then(() => {
            toast.success(t("mess_edit"));
            this.setState({ isView: false, loading: false });
            this.props.handleOKEditClose();
          });
        } else {
          addNewReagent({
            ...this.state.item,
          }).then((response) => {
            if (response.data != null && response.status == 200) {
              this.state.item.id = response.data.id;
              this.setState({
                ...this.state.item,
                isView: false,
                loading: false,
              });
              toast.success(t("mess_add"));
              this.props.handleOKEditClose();
            }
          });
        }
      }
    // });
    // }
  // };

  handleChange = (event, source) => {
    event.persist();
    let { item } = this.state;
    if (source === "switch") {
      item["isActive"] = event.target.checked;
      this.setState({ item: item });
      return;
    }
    if (source === "active") {
      item["healthDepartmentDirectory"] = event.target.checked;
      this.setState({ item: item });
      return;
    }
    if (source === "testType") {
      item["testType"] = event.target.value;
      item["hasTestType"] = false;
      this.setState({ item: item });
    }
    const name = event.target.name;
    const value = event.target.value;
    item[name] = value;
    this.setState({
      item: item,
    });
  };

  handleDateChange = (date, name) => {
    let { item } = this.state;
    if (name === "dateOfIssue") {
      item["dateOfIssue"] = date;
    }
    if (name === "expirationDate") {
      item["expirationDate"] = date;
    }

    this.setState({
      item: item,
    });
  };
  handleDateOfIssueChange = (date) => {
    let { item } = this.state;
    item["dateOfIssue"] = date;
    this.setState({
      item: item,
    });
  };

  handleExpirationDateChange = (date) => {
    let { item } = this.state;
    item["expirationDate"] = date;
    this.setState({
      item: item,
    });
  };

  componentDidMount() {
    ValidatorForm.addValidationRule("checkMaxLength", (value) => {
      if (value != null && value != undefined) {
        if (value.length > 255) {
          return false;
        }
      }
      return true;
    });

    ValidatorForm.addValidationRule("checkNull", (value) => {
      if (value.trim() != null && value.trim().length > 0) {
        return true;
      }
      return false;
    });
  }

  componentWillMount() {
    let { open, handleClose, item } = this.props;
    if (item == null) {
      item = {};

      // item["dateOfIssue"] = null;
      // item["expirationDate"] = null;
    }
    item["hasTestType"] = false;
    if (item != null && item.healthDepartmentDirectory == null) {
      item["healthDepartmentDirectory"] = true;
    }

    this.setState({ item: item });
    this.list();

    this.setState({
      ...item,
    });
  }

  render() {
    let {
      id,
      isView,
    } = this.state;
    console.log(this.state.item);
    let { open, handleClose, handleOKEditClose, t, i18n } = this.props;
    return (
      <Dialog
        open={open}
        PaperComponent={PaperComponent}
        maxWidth={"lg"}
        fullWidth={true}
      >
        <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
          <span className="mb-20 styleColor">
            {" "}
            {(id ? t("update") : t("Add")) + " " + t("reagent.title")}{" "}
          </span>
          <IconButton
            style={{ position: "absolute", right: "10px", top: "10px" }}
            onClick={() => handleClose()}
          >
            <Icon color="error" title={t("close")}>
              close
            </Icon>
          </IconButton>
        </DialogTitle>
        <ValidatorForm
          ref="form"
          onSubmit={this.saveRegant}
        // style={{
        //   overflowY: "auto",
        //   display: "flex",
        //   flexDirection: "column",
        // }}
        >
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item lg={6} md={6} sm={12} xs={12}>
                <TextValidator
                  className="w-100"
                  label={
                    <span className="font">
                      <span style={{ color: "red" }}> * </span>
                      {t("reagent.name")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="name"
                  value={this.state.item?.name}
                  validators={["required", "matchRegexp:^.{0,255}$"]}
                  errorMessages={[
                    t("general.errorMessages_required"),
                    t("MaxLength"),
                  ]}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              {/* <Grid item lg={6} md={6} sm={12} xs={12}>
                <TextValidator
                  className="w-100"
                  label={
                    <span className="font">
                      <span style={{ color: "red" }}> * </span>
                      {t("Số lô")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="code"
                  value={this.state.item?.code}
                  validators={["required", "matchRegexp:^.{0,255}$"]}
                  errorMessages={[
                    t("general.errorMessages_required"),
                    t("MaxLength"),
                  ]}
                  variant="outlined"
                  size="small"
                />
              </Grid> */}

              <Grid item lg={6} md={6} sm={12} xs={12}>
                <TextValidator
                  className="w-100"
                  label={
                    <span className="font">
                      {t("Description")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  multiline
                  rowsMax={4}
                  name="description"
                  value={this.state.item?.description}
                  validators={["checkMaxLength"]}
                  errorMessages={[t("MaxLength")]}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item lg={6} md={6} sm={12} xs={12}>
                <TextValidator
                  className="w-100"
                  label={
                    <span className="font">
                      {t("reagent.activeIngredients")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="activeIngredients"
                  multiline
                  rowsMax={4}
                  value={this.state.item?.activeIngredients}
                  validators={["checkMaxLength"]}
                  errorMessages={[
                    t("MaxLength"),
                  ]}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item lg={6} md={6} sm={12} xs={12}>
                <TextValidator
                  className="w-100"
                  label={
                    <span className="font">
                      {t("reagent.dosageForms")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="dosageForms"
                  value={this.state.item?.dosageForms}
                  variant="outlined"
                  size="small"
                  validators={["matchRegexp:^.{0,255}$"]}
                  errorMessages={[
                    t("MaxLength"),
                  ]}
                />
              </Grid>

              <Grid item lg={6} md={6} sm={12} xs={12}>
                <TextValidator
                  className="w-100"
                  label={
                    <span className="font">
                      {t("reagent.packing")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="packing"
                  value={this.state.item?.packing}
                  variant="outlined"
                  size="small"
                  validators={["matchRegexp:^.{0,255}$"]}
                  errorMessages={[
                    t("MaxLength"),
                  ]}
                />
              </Grid>

              <Grid item lg={6} md={6} sm={12} xs={12}>
                <TextValidator
                  className="w-100"
                  label={
                    <span className="font">
                      {t("reagent.reagentSource")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="reagentSource"
                  value={this.state.item?.reagentSource}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item lg={6} md={6} sm={12} xs={12}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    className="w-100"
                    margin="none"
                    id="mui-pickers-date"
                    label={
                      <span className="font">{t("reagent.dateOfIssue")}</span>
                    }
                    type="text"
                    autoOk={false}
                    maxDate={new Date()}
                    maxDateMessage={"Không được lớn họn ngày hiện tại"}
                    format="dd/MM/yyyy"
                    value={
                      this.state.item?.dateOfIssue
                        ? this.state.item?.dateOfIssue
                        : null
                    }
                    onChange={this.handleDateOfIssueChange}
                    validators={["required"]}
                    errorMessages={[t("general.errorMessages_required")]}
                    inputVariant="outlined"
                    size="small"
                  />
                </MuiPickersUtilsProvider>
              </Grid>

              <Grid item lg={6} md={6} sm={12} xs={12}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    className="w-100"
                    margin="none"
                    id="mui-pickers-date"
                    label={
                      <span className="font">
                        <span style={{ color: "red" }}> * </span>
                        {t("reagent.expirationDate")}
                      </span>
                    }
                    type="text"
                    autoOk={false}
                    format="dd/MM/yyyy"
                    value={
                      this.state.item?.expirationDate
                        ? this.state.item?.expirationDate
                        : null
                    }
                    onChange={this.handleExpirationDateChange}
                    validators={["required"]}
                    errorMessages={[t("general.errorMessages_required")]}
                    inputVariant="outlined"
                    size="small"
                  />
                </MuiPickersUtilsProvider>
              </Grid>

              <Grid item lg={6} md={6} sm={12} xs={12}>
                <TextValidator
                  className="w-100"
                  label={
                    <span className="font">
                      <span style={{ color: "red" }}> * </span>
                      {t("reagent.productionFacilityName")}
                    </span>
                  }
                  onChange={this.handleChange}
                  multiline
                  rowsMax={4}
                  type="text"
                  name="productionFacilityName"
                  value={this.state.item?.productionFacilityName}
                  validators={["required", "matchRegexp:^.{0,255}$"]}
                  errorMessages={[
                    t("general.errorMessages_required"),
                    t("MaxLength"),
                  ]}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item lg={6} md={6} sm={12} xs={12}>
                <FormControlLabel
                  variant="outlined"
                  size="small"
                  value={this.state.item?.healthDepartmentDirectory}
                  className="mb-16"
                  name="healthDepartmentDirectory"
                  onChange={(healthDepartmentDirectory) =>
                    this.handleChange(healthDepartmentDirectory, "active")
                  }
                  control={
                    <Checkbox
                      checked={this.state.item?.healthDepartmentDirectory}
                    />
                  }
                  label={
                    <span className="font">
                      {t("reagent.healthDepartmentDirectory")}
                    </span>
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions spacing={4} className="flex flex-end flex-middle">
            <Button
              variant="contained"
              className="mr-16"
              color="secondary"
              type="button"
              onClick={() => handleClose()}
            >
              {" "}
              {t("Cancel")}
            </Button>
            <Button
              disabled={isView}
              // onClick={this.saveRegant}
              variant="contained"
              color="primary"
              className=" mr-16 align-bottom"
              type="submit"
            >
              {t("Save")}
            </Button>
          </DialogActions>
        </ValidatorForm>
      </Dialog>
    );
  }
}

export default ReagentEditorDialog;

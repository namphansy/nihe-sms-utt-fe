import React, { Component } from "react";
import {
  Dialog,
  Button,
  DialogActions,
  Grid,
  DialogTitle,
  DialogContent,
  Icon,
  IconButton,
} from "@material-ui/core";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { checkCode, addNewInternalTest, updateInternalTest } from "./InternalTestService";
import LocalConstants from "./Constants";
import Draggable from "react-draggable";
import Paper from "@material-ui/core/Paper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../../styles/views/_style.scss";
import { searchInternalTest } from "../InternalTest/InternalTest";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, DateTimePicker, DatePicker, KeyboardDatePicker } from "@material-ui/pickers";

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

class InternalTestEditorDialog extends Component {
  state = {
    source: "",
    code: "",
    loading: false,
    description: "",
    expirationDate: "",
    packCode: "",
    result: "",
    dateOfManufacture: "",
    productionFacilityName: "",
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
  saveInternalTest = () => {
    let { id, code, testType, item } = this.state;
    let { t } = this.props;
    this.setState({ isView: true, loading: true });
    checkCode(this.state.item).then((result) => {
      //Nếu trả về true là code đã được sử dụng
      if (result.data) {
        toast.error("Mã mẫu nội kiểm đã được sử dụng");
        this.setState({ isView: false, loading: false });
      } else {
        //Nếu trả về false là code chưa sử dụng có thể dùng
        if (id) {
          updateInternalTest({
            ...this.state.item,
          }).then(() => {
            toast.success(t("Chỉnh sửa mẫu nội kiểm thành công!"));
            this.setState({ isView: false, loading: false });
            this.props.handleOKEditClose();
          });
        } else {
          addNewInternalTest({
            ...this.state.item,
          }).then((response) => {
            if (response.data != null && response.status == 200) {
              this.state.item.id = response.data.id;
              this.setState({
                ...this.state.item,
                isView: false,
                loading: false,
              });
              toast.success(t("Thêm mẫu nội kiểm thành công!"));
              this.props.handleOKEditClose();
            }
          });
        }
      }
    });
    // }
  };

  handleChange = (event, source) => {
    event.persist();
    let { item } = this.state;
    const name = event.target.name;
    const value = event.target.value;
    item[name] = value;
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

  handleDateOfManufacture = (date) => {
    let { item } = this.state;
    item["dateOfManufacture"] = date;
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
    }

    this.setState({ item: item });
    this.list();

    this.setState({
      ...item,
    });
  }

  // selectReagent = (value) => {
  //   // console.log("hieu");
  //   let { item }= this.state;
  //   item.reagent = value;
  //   this.setState({ item: item })
  // }

  render() {
    let {
      id,
      isView,
    } = this.state;
    console.log(this.state.item);
    let { open, handleClose, handleOKEditClose, t, i18n } = this.props;
    let searchObject = { pageIndex: 0, pageSize: 100000 }
    return (
      <Dialog
        open={open}
        PaperComponent={PaperComponent}
        maxWidth={"md"}
        fullWidth={true}
      >
        <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
          <span className="mb-20 styleColor">
            {" "}
            {(id ? t("update") : t("Add")) + " " + t("internalTest.title")}{" "}
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
          onSubmit={this.saveInternalTest}
        >
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  label={
                    <span className="font">
                      <span style={{ color: "red" }}> * </span>
                      {t("internalTest.code")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="code"
                  value={this.state.item?.code}
                  validators={["required"]}
                  errorMessages={[t("general.errorMessages_required")]}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  label={
                    <span className="font">
                      {t("internalTest.description")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="description"
                  value={this.state.item?.description}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              
              <Grid item sm={6} xs={12}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    className="w-100"
                    margin="none"
                    id="mui-pickers-date"
                    label={
                      <span className="font">
                        <span style={{ color: "red" }}> * </span>
                        {t("internalTest.dateOfManufacture")}
                      </span>
                    }
                    type="text"
                    autoOk={false}
                    format="dd/MM/yyyy"
                    value={
                      this.state.item?.dateOfManufacture
                        ? this.state.item?.dateOfManufacture
                        : null
                    }
                    onChange={this.handleDateOfManufacture}
                    validators={["required"]}
                    errorMessages={[t("general.errorMessages_required")]}
                    inputVariant="outlined"
                    size="small"
                  />
                </MuiPickersUtilsProvider>
              </Grid>

              <Grid item sm={6} xs={12}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    className="w-100"
                    margin="none"
                    id="mui-pickers-date"
                    label={
                      <span className="font">
                        {t("internalTest.expirationDate")}
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
                    inputVariant="outlined"
                    size="small"
                  />
                </MuiPickersUtilsProvider>
              </Grid>

              <Grid item sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  label={
                    <span className="font">
                      {t("internalTest.productionFacilityName")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="productionFacilityName"
                  value={this.state.item?.productionFacilityName}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  label={
                    <span className="font">
                      <span style={{ color: "red" }}> * </span>
                      {t("internalTest.source")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="source"
                  value={this.state.item?.source}
                  validators={["required"]}
                  errorMessages={[t("general.errorMessages_required")]}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  label={
                    <span className="font">
                      {t("internalTest.packCode")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="packCode"
                  value={this.state.item?.packCode}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  label={
                    <span className="font">
                      {t("internalTest.result")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="result"
                  value={this.state.item?.result}
                  variant="outlined"
                  size="small"
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
              // onClick={this.saveInternalTest}
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

export default InternalTestEditorDialog;

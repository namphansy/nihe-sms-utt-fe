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
import { checkCode, addNewReagentCode, updateReagentCode } from "./ReagentCodeService";
import LocalConstants from "./Constants";
import Draggable from "react-draggable";
import Paper from "@material-ui/core/Paper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../../styles/views/_style.scss";
import AsynchronousAutocomplete from "../utilities/AsynchronousAutocomplete";
import { searchReagent } from "../Reagent/ReagentService";

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

class ReagentCodeEditorDialog extends Component {
  state = {
    name: "",
    code: "",
    loading: false,
    ncResult: "",
    pcResult: "",
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
    checkCode(this.state.item).then((result) => {
      //Nếu trả về true là code đã được sử dụng
      if (result.data) {
        toast.error("Số lô đã được sử dụng");
        this.setState({ isView: false, loading: false });
      } else {
        //Nếu trả về false là code chưa sử dụng có thể dùng
        if (id) {
          updateReagentCode({
            ...this.state.item,
          }).then(() => {
            toast.success(t("Chỉnh sửa số lô sinh phẩm thành công!"));
            this.setState({ isView: false, loading: false });
            this.props.handleOKEditClose();
          });
        } else {
          addNewReagentCode({
            ...this.state.item,
          }).then((response) => {
            if (response.data != null && response.status == 200) {
              this.state.item.id = response.data.id;
              this.setState({
                ...this.state.item,
                isView: false,
                loading: false,
              });
              toast.success(t("Thêm số lô sinh phẩm thành công!"));
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

  selectReagent = (value) => {
    // console.log("hieu");
    let { item }= this.state;
    item.reagent = value;
    this.setState({ item: item })
  }

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
        maxWidth={"sm"}
        fullWidth={true}
      >
        <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
          <span className="mb-20 styleColor">
            {" "}
            {(id ? t("update") : t("Add")) + " " + t("reagentCode.title")}{" "}
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
        >
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item sm={12} xs={12}>
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
                </Grid>
              <Grid item sm={12} xs={12}>
                <AsynchronousAutocomplete
                  label={
                    <span className="font">
                      <span style={{ color: "red" }}> * </span>
                      {t("reagentCode.reagent")}
                    </span>
                  }
                  searchFunction={searchReagent}
                  variant="outlined"
                  size="small"
                  // multiple={true}
                  searchObject={searchObject}
                  defaultValue={this.state.item.reagent? this.state.item.reagent : ""}
                  displayLable={'name'}
                  value={this.state.item.reagent? this.state.item.reagent : ""}
                  onSelect={this.selectReagent}
                  validators={["required"]}
                  errorMessages={[
                    t("general.errorMessages_required")
                  ]}
                />
              </Grid>

              <Grid item sm={12} xs={12}>
                <TextValidator
                  className="w-100"
                  label={
                    <span className="font">
                      {t("reagentCode.ncResult")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="ncResult"
                  value={this.state.item?.ncResult}
                  validators={["checkMaxLength"]}
                  errorMessages={[t("MaxLength")]}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item sm={12} xs={12}>
                <TextValidator
                  className="w-100"
                  label={
                    <span className="font">
                      {t("reagentCode.pcResult")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="pcResult"
                  value={this.state.item?.pcResult}
                  validators={["checkMaxLength"]}
                  errorMessages={[
                    t("MaxLength"),
                  ]}
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

export default ReagentCodeEditorDialog;

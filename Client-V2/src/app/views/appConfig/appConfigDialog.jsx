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
  Checkbox,
  FormControlLabel,
} from "@material-ui/core";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { checkCode, addNewAppConfig, updateAppConfig } from "./appConfigService";
import Draggable from "react-draggable";
import Paper from "@material-ui/core/Paper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../../styles/views/_style.scss";

toast.configure({
  autoClose: 2000,
  draggable: false,
  limit: 3,
});

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

class appConfigEditorDialog extends Component {
  state = {
    id: "",
    isView: false,
    code: "",
    loading: false,
    name: "",
    value: "",
    active: "",
  };

  saveAppConfig = () => {
    let { id, value, testType, code } = this.state;
    let { t } = this.props;
    let item = {};
    item.id = id;
    item.code = this.state.code;
    item.name = this.state.name;
    item.value = this.state.value;
    item.active = this.state.active;

    this.setState({ isView: true, loading: true });

    checkCode(this.state.item).then((result) => {
      //Nếu trả về true là code đã được sử dụng
      if (result.data) {
        toast.error("Mã appConfig đã được sử dụng");
        this.setState({ isView: false, loading: false });
      } else {
        //Nếu trả về false là code chưa sử dụng có thể dùng
        if (id) {
          updateAppConfig({
            ...this.state.item,
          }).then(() => {
            toast.success(t("Chỉnh sửa appConfig thành công!"));
            this.setState({ isView: false, loading: false });
            this.props.handleOKEditClose();
          });
        } else {
          addNewAppConfig({
            ...this.state.item,
          }).then((response) => {
            if (response.data != null && response.status == 200) {
              this.state.item.id = response.data.id;
              this.setState({
                ...this.state.item,
                isView: false,
                loading: false,
              });
              toast.success(t("Thêm appConfig thành công!"));
              this.props.handleOKEditClose();
            }
          });
        }
      }
    });

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
    if (source === "active") {
      item["active"] = event.target.checked;
      this.setState({ item: item });
      return;
    }
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
    this.setState({
      ...item,
    });

    if (item != null && item.active == null) {
      item["active"] = true;
    }
  }

  render() {
    let {
      id,
      isView,
      name,
      code,
      value,
      active
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
            {(id ? t("update") : t("Add")) + " " + t("manage.appConfig")}{" "}
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
        <ValidatorForm ref="form" onSubmit={this.saveAppConfig}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  label={
                    <span className="font">
                      <span style={{ color: "red" }}> * </span>
                      {t("appConfig.code")}
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
                      {t("appConfig.name")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="name"
                  value={this.state.item?.name}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  label={
                    <span className="font">
                      {t("appConfig.value")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="value"
                  value={this.state.item?.value}
                  variant="outlined"
                  size="small"
                // validators={[ "required", "matchRegexp:^.{0,4}$" ]}
                // errorMessages={[
                //     t("general.errorMessages_required"), 
                //     t("Giá trị nhập vào không quá 4 số")
                // ]}
                />
              </Grid>

              <Grid item sm={6} xs={12}>
                <FormControlLabel
                  variant="outlined"
                  size="small"
                  value={this.state.item?.active}
                  className="mb-16"
                  name="active"
                  onChange={(active) =>
                    this.handleChange(active, "active")
                  }
                  control={
                    <Checkbox
                      checked={this.state.item?.active}
                    />
                  }
                  label={
                    <span className="font">
                      {t("appConfig.activeAppConfig")}
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

export default appConfigEditorDialog;

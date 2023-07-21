import React, { Component } from "react";
import {
  Dialog,
  Button,
  Grid,
  DialogActions,
  DialogTitle,
  DialogContent,
  Icon,
  IconButton,
} from "@material-ui/core";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { checkCode, addNew, update } from "./TestMachineService";
import Draggable from "react-draggable";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Paper from "@material-ui/core/Paper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

toast.configure({
  autoClose: 1000,
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
class TestMachineDialog extends Component {
  state = {
    cabinet: {},
    name: "",
    code: "",
    description: "",
    isActive: false,
    isView: false,
    loading: false,
  };

  handleChange = (event, source) => {
    event.persist();
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleFormSubmit = () => {
    let { id, code } = this.state;
    let obj = { id: id, code: code };
    let { t } = this.props;
    this.setState({ isView: true, loading: true });
    checkCode(obj).then((result) => {
      //Nếu trả về true là code đã được sử dụng
      if (result.data) {
        this.setState({ isView: false, loading: false });
        toast.warning(t("general.duplicateCode"));
      } else {
        //Nếu trả về false là code chưa sử dụng có thể dùng
        if (id) {
          update({
            ...this.state,
          }).then(() => {
            this.setState({ isView: false, loading: false });
            toast.success(t("general.success"));
            this.props.handleOKEditClose();
          });
        } else {
          addNew({
            ...this.state,
          }).then((response) => {
            if (response.data != null && response.status == 200) {
              this.state.id = response.data.id;
              this.setState({ ...this.state });
              this.setState({ isView: false, loading: false });
              toast.success(t("general.success"));
              this.props.handleOKEditClose();
            }
          });
        }
      }
    });
  };

  componentWillMount() {
    let { item } = this.props;
    this.setState(item);
    ValidatorForm.addValidationRule("checkMaxLength", (value) => {
      if (value.length > 255) {
        return false;
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

  render() {
    let { open, handleClose, t, i18n } = this.props;
    let { id, name, code, isView, sensitivity, description } = this.state;
    return (
      <Dialog
        open={open}
        PaperComponent={PaperComponent}
        maxWidth={"sm"}
        fullWidth={true}
      >
        <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
          <span className="mb-20 styleColor">
            {id ? t("general.update") : t("general.add")} {t("testMachine.popup")}
          </span>
          <IconButton
            style={{ position: "absolute", right: "10px", top: "10px" }}
            onClick={() => handleClose()}
          >
            <Icon color="error" title={t("general.close")}>
              close
            </Icon>
          </IconButton>
        </DialogTitle>
        <ValidatorForm
          ref="form"
          onSubmit={this.handleFormSubmit}
          style={{
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item md={12} sm={12} xs={12}>
                <TextValidator
                  className="w-100"
                  label={
                    <span className="font">
                      <span style={{ color: "red" }}> * </span>
                      {t("testMachine.name")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="name"
                  value={name}
                  validators={["checkNull", "checkMaxLength"]}
                  errorMessages={[
                    t("general.required"),
                    t("general.invalidLength"),
                  ]}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item md={12} sm={12} xs={12}>
                <TextValidator
                  className="w-100"
                  label={
                    <span className="font">
                      <span style={{ color: "red" }}> * </span>
                      {t("testMachine.code")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="code"
                  value={code}
                  validators={["checkNull", "checkMaxLength"]}
                  errorMessages={[
                    t("general.required"),
                    t("general.invalidLength"),
                  ]}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item item md={12} sm={12} xs={12}>
                <TextValidator
                  className="w-100"
                  label={<span className="font">{t("testMachine.description")}</span>}
                  onChange={this.handleChange}
                  type="text"
                  name="description"
                  value={description}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item item md={12} sm={12} xs={12}>
                <TextValidator
                  className="w-100"
                  label={<span className="font">{t("testMachine.sensitivity")}</span>}
                  onChange={this.handleChange}
                  type="text"
                  name="sensitivity"
                  value={sensitivity}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions spacing={4} className="flex flex-end flex-middle">
            <Button
              variant="contained"
              color="secondary"
              onClick={() => this.props.handleClose()}
            >
              {t("general.cancel")}
            </Button>
            {!isView && (
              <Button variant="contained" color="primary" type="submit">
                {t("general.save")}
              </Button>
            )}
          </DialogActions>
        </ValidatorForm>
      </Dialog>
    );
  }
}
export default TestMachineDialog;

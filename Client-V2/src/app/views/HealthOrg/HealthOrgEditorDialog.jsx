import React, { Component } from "react";
import {
  Dialog,
  Button,
  Grid,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  DialogContent,
  Checkbox,
  FormControlLabel
} from "@material-ui/core";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { checkCode, updateUser, addNew, update } from "./HealthOrgService";
import SelectParentPopup from "./SelectParentPopup";
import Constant from './Constant';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Draggable from "react-draggable";
import Paper from "@material-ui/core/Paper";

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

class HealthOrgEditorDialog extends Component {
  state = {
    name: "",
    code: "",
    province: "",
    description: "",
    orgType: 2, //Đơn vị lấy mẫu
    isExternalOrg: false,
    isActive: false,
    shouldOpenSelectParentPopup: false,
    phone: "",
    email: "",
    address: "",
    allowSms: "",
    allowSmsCheck: false,
  };

  handleChange = (event, source) => {
    event.persist();
    if (source === "isExternalOrg") {
      this.setState({ isExternalOrg: event.target.checked });
      return;
    }
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleChangeType = (event, source) => {
    // if (source === "allowSms") {
    //   this.setState({ [source]: event.target.checked }, () => console.log(this.state));

    //   return;
    // }
    if (source === "orgType") {
      this.setState({ [source]: event.target.value }, () => console.log(this.state));
      return;
    }
    if (source === "isExternalOrg") {
      this.setState({ isExternalOrg: event.target.checked });
      return;
    }
  }

  handleFormSubmit = () => {
    let { id } = this.state;
    let { code } = this.state;
    checkCode(id, code).then((result) => {
      //Nếu trả về true là code đã được sử dụng
      if (result.data) {
        alert("Code đã được sử dụng");
      } else {
        //Nếu trả về false là code chưa sử dụng có thể dùng
        if (id) {
          update({
            ...this.state,
          }).then(() => {
            this.props.handleOKEditClose();
          });
        } else {
          addNew({
            ...this.state,
          }).then(() => {
            this.props.handleOKEditClose();
          });
        }
      }
    });
  };
  openParentPopup = (event) => {
    this.setState({ shouldOpenSelectParentPopup: true });
  };
  componentWillMount() {
    let { open, handleClose, item } = this.props;
    this.setState(item);

    if (this.props.item.allowSms == 1) { this.setState({ allowSmsCheck: true }) }
    else {
      this.setState({ allowSmsCheck: false })
    }
  }
  // componentWillMount() {
  //   let { open, handleClose, item } = this.props;
  //   // let { item } = this.props;
  //   item.allowSms = this.state.allowSms;
  //   this.setState((item) => {
  //     if( this.props.allowSms == 1 ) 
  //     { this.setState({checked:true}) }
  //      else {
  //       this.setState({checked:false}) 
  //     }
  //   });
  // }

  handleAllowSmS = () => {
    if (this.state.allowSmsCheck == true) {
      this.setState({ allowSmsCheck: false })
      this.setState({ allowSms: 0 })
    }
    else if (this.state.allowSmsCheck == false) {
      this.setState({ allowSmsCheck: true })
      this.setState({ allowSms: 1 })

    }
  }
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
    this.setState({ shouldOpenSelectParentPopup: false });
  };



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
    let { id, name, province, allowSms, code, description, isExternalOrg, phone, email, address ,fax } = this.state;

    return (
      <Dialog open={open} fullWidth PaperComponent={PaperComponent} maxWidth="lg">
        <div className="p-24">
          <h4 className="mb-24">{id ? t("general.update") : t("general.add")}</h4>
          <ValidatorForm ref="form" onSubmit={this.handleFormSubmit}>
            <DialogContent dividers>
              <Grid className="" container spacing={4}>
                <Grid item lg={6} md={6} sm={12} xs={12}>
                  <TextValidator
                    className="w-100"
                    variant="outlined"
                    size="small"
                    label={<span className="font">
                      <span style={{ color: "red" }}> * </span>
                      {t("org.code")}
                    </span>}
                    onChange={this.handleChange}
                    type="text"
                    name="code"
                    value={code}
                    validators={["required", 'whitespace']}
                    errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                  />
                </Grid>
                <Grid item lg={6} md={6} sm={12} xs={12}>
                  <TextValidator
                    className="w-100"
                    variant="outlined"
                    size="small"
                    label={<span className="font">
                      <span style={{ color: "red" }}> * </span>
                      {t("org.name")}
                    </span>}
                    onChange={this.handleChange}
                    type="text"
                    name="name"
                    value={name}
                    validators={["required", 'whitespace']}
                    errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                  />
                </Grid>
                <Grid item lg={6} md={6} sm={12} xs={12}>
                  <TextValidator
                    className="w-100"
                    variant="outlined"
                    size="small"
                    label={<span className="font">
                      <span style={{ color: "red" }}> * </span>
                      {"Tỉnh thành"}
                    </span>}
                    onChange={this.handleChange}
                    type="text"
                    name="province"
                    value={province}
                    validators={["required", 'whitespace']}
                    errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                  />
                </Grid>
                <Grid item lg={6} md={6} sm={12} xs={12}>
                  <FormControl fullWidth={true} variant="outlined" size="small">
                    <InputLabel htmlFor="gender-simple">
                      {t("org.type")}
                    </InputLabel>
                    <Select
                      label={t("org.type")}
                      value={typeof this.state.orgType != "undefined" ? this.state.orgType : ""}
                      onChange={(orgType) =>
                        this.handleChangeType(orgType, "orgType")
                      }
                      inputProps={{
                        name: "orgType",
                        id: "orgType-simple",
                      }}
                    >
                      {Constant.listOrgType.map((item) => {
                        return (
                          <MenuItem key={item.id} value={item.id}>
                            {item.name}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item lg={6} md={6} sm={12} xs={12}>
                  <TextValidator
                    className="w-100"
                    variant="outlined"
                    size="small"
                    label={<span className="font">
                      <span style={{ color: "red" }}> * </span>
                      {t("org.phone")}
                    </span>}
                    onChange={this.handleChange}
                    type="text"
                    name="phone"
                    value={phone}
                    validators={["required", 'whitespace']}
                    errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                  />
                </Grid>
                {/* <Grid item sm ={12} xs={12}>
                <FormControlLabel
                    control={
                      <Checkbox
                        checked={isExternalOrg}
                        onChange={(isExternalOrg) => this.handleChangeType(isExternalOrg, "isExternalOrg")}
                        value="isExternalOrg"
                      />
                    }
                    label="Là đơn vị ngoại tỉnh"
                  />
                </Grid> */}
                <Grid item lg={6} md={6} sm={12} xs={12}>
                  <TextValidator
                    className="w-100"
                    variant="outlined"
                    size="small"
                    label={t("org.address")}
                    onChange={this.handleChange}
                    type="text"
                    name="address"
                    value={address}
                  />
                </Grid>
                <Grid item lg={6} md={6} sm={12} xs={12}>
                  <TextValidator
                    className="w-100"
                    variant="outlined"
                    size="small"
                    label={<span className="font">
                      <span style={{ color: "red" }}> * </span>
                      {t("org.email")}
                    </span>}
                    onChange={this.handleChange}
                    type="text"
                    name="email"
                    value={email}
                    validators={["required", 'whitespace']}
                    errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                  />
                </Grid>
                <Grid item lg={6} md={6} sm={12} xs={12}>
                  <Button
                    size="small"
                    className="btn btn-primary-d"
                    style={{
                      position: "absolute",
                      cursor: "pointer",
                      right: "48px",
                      zIndex: "9999",
                      height: "38px"
                    }}
                    variant="contained"
                    color="primary"
                    onClick={this.openParentPopup}
                  >
                    {t("general.select")}
                  </Button>
                  <TextValidator
                    variant="outlined"
                    className="w-100 mb-16"
                    size="small"
                    fullWidth
                    // style={{ width: "85%" }}
                    InputProps={{
                      readOnly: true,
                    }}
                    label={
                      <span>
                        <span style={{ color: "red" }}></span>
                        {t("org.parent")}
                      </span>
                    }
                    value={
                      this.state.parent != null ? this.state.parent.name : ""
                    }
                  />

                  {this.state.shouldOpenSelectParentPopup && (
                    <SelectParentPopup
                      open={this.state.shouldOpenSelectParentPopup}
                      handleSelect={this.handleSelectParent}
                      selectedItem={
                        this.state.item != null && this.state.item.parent != null
                          ? this.state.item.parent
                          : {}
                      }
                      handleClose={this.handleDialogClose}
                      t={t}
                      i18n={i18n}
                    />
                  )}
                </Grid>
              </Grid>
              <Grid item lg={6} md={6} sm={12} xs={12}>
                  <TextValidator
                    className="w-100"
                    variant="outlined"
                    size="small"
                    label={<span className="font">
                      <span style={{ color: "red" }}></span>
                      {"fax"}
                    </span>}
                    onChange={this.handleChange}
                    type="text"
                    name="fax"
                    value={fax}
                    // validators={["required", 'whitespace']}
                    // errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                  />
                </Grid>
              <Grid item sm={12} xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.allowSmsCheck}
                      onChange={this.handleAllowSmS}
                    />
                  }
                  label={"Nhận kết quả qua tin nhắn"}
                />
              </Grid>
            </DialogContent>

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

export default HealthOrgEditorDialog;

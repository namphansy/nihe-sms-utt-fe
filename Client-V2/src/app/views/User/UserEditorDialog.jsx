import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  Icon,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import UserRoles from "app/services/UserRoles";
import React, { Component } from "react";
import { TextValidator, ValidatorForm } from "react-material-ui-form-validator";
import {
  getByPageByParentId as getAdministrativeUnitByPage,
  getUserById as getAdministrativeUnitById,
} from "../AdministrativeUnit/AdministrativeUnitService";
import { findAllChildHealthOrganizationByUserLogin as getOrg } from "../HealthOrg/HealthOrgService";
import AsynchronousAutocomplete from "../utilities/AsynchronousAutocomplete";
import {
  getAllInfoByUserLogin,
  getAllRoles,
  getRoleUser,
  getUserByUsername,
  saveUserOrg,
} from "./UserService";

class UserEditorDialog extends Component {
  constructor(props) {
    super(props);

    // getAllRoles().then((result) => {
    //   let listRole = result.data;
    //   this.setState({ listRole: listRole });
    // });
  }
  state = {
    isAddNew: false,
    listRole: [],
    roles: [],
    active: true,
    email: "",
    person: {},
    username: "",
    org: {},
    changePass: true,
    password: "",
    confirmPassword: "",
    provinceOfResidenceSearch: {
      pageIndex: 0,
      pageSize: 10000000,
      isGetAllCity: true,
    },
    provinceOfResidence: null,
    districtOfResidence: null,
    districtOfResidenceSearch: {},
    wardOfResidenceSearch: {},
    wardOfResidence: null,
    isCodeStatus: true,
  };

  listGender = [
    { id: "M", name: "Nam" },
    { id: "F", name: "Nữ" },
    { id: "U", name: "Không rõ" },
  ];

  handleChange = (event, source) => {
    event.persist();
    if (source === "switch") {
      this.setState({ isActive: event.target.checked });
      return;
    }
    if (source === "changePass") {
      this.setState({ changePass: event.target.checked });
      return;
    }
    if (source === "active") {
      this.setState({ active: event.target.checked });
      return;
    }
    if (source === "isCodeStatus") {
      this.setState({ codeStatus: event.target.checked });
      return;
    }
    if (source === "displayName") {
      let { person } = this.state;
      person = person ? person : {};
      person.displayName = event.target.value;
      this.setState({ person: person });
      return;
    }
    if (source === "phoneNumber") {
      let { person } = this.state;
      person = person ? person : {};
      person.phoneNumber = event.target.value;
      this.setState({ person: person });
      return;
    }

    if (source === "gender") {
      let { person } = this.state;
      person = person ? person : {};
      person.gender = event.target.value;
      this.setState({ person: person });
      return;
    }
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleFormSubmit = () => {
    let { id, user, wardOfResidence } = this.state;
    let userOrg = {};

    if (user == null) {
      user = {};
    }
    user.username = this.state.username;
    user.email = this.state.email;
    user.person = this.state.person;
    user.roles = this.state.roles;
    user.active = this.state.active;
    user.changePass = this.state.changePass;
    user.isActive = this.state.isActive;
    user.password = this.state.password;

    userOrg.user = user;
    userOrg.codeStatus = this.state.codeStatus;
    userOrg.org = this.state.org;
    userOrg.id = this.state.id;
    userOrg.administrativeUnit = wardOfResidence;

    getUserByUsername(this.state.username).then((data) => {
      if (data.data && data.data.id) {
        if (!user.id || (id && data.data.id != user.id)) {
          alert("Tên đăng nhập đã tồn tại!");
          return;
        }
      }
      saveUserOrg(userOrg).then(() => {
        this.props.handleOKEditClose();
      });
    });
  };

  selectRoles = (rolesSelected) => {
    this.setState({ roles: rolesSelected }, function () {});
  };

  componentWillMount() {
    let { open, handleClose, item } = this.props;
    if (!item.id) {
      this.setState({ isAddNew: true, user: item.user });
    }
    this.setState(item);
    this.setState({ ...item.user, org: item.org }, () => {
      this.setState({ id: item.id, user: item.user, org: item.org });
    });

    if (!UserRoles.isAdmin()) {
      getAllInfoByUserLogin().then(({ data }) => {
        console.log(data);
        let idHealthOrg = data?.userOrganization?.org?.id;
        this.setState({ idHealthOrg: idHealthOrg }, () => {
          this.getHealthOrg();
        });
      });
      getRoleUser().then(({ data }) => {
        this.setState({
          listRole: data,
        });
      });
    } else {
      this.getHealthOrg();
      this.getAdministrativeUnit();
      getAllRoles().then(({ data }) => {
        this.setState({
          listRole: data,
        });
      });
    }
  }

  getAdministrativeUnit = () => {
    let { administrativeUnit } = this.props.item;

    if (administrativeUnit) {
      getAdministrativeUnitById(administrativeUnit.id).then(({ data }) => {
        this.setState({
          wardOfResidence: administrativeUnit,
          districtOfResidence: data.parent,
          provinceOfResidence: data.parent.parent,
        });
      });
    }
  };

  getHealthOrg = () => {
    var searchObject = {};
    searchObject.text = this.state.keyword;
    searchObject.pageIndex = 0;
    searchObject.pageSize = 10000000;
    searchObject.idHealthOrg = this.state.idHealthOrg;
    getOrg(searchObject).then(({ data }) => {
      this.setState({
        listOrg: [...data.content],
        totalElements: data.totalElements,
      });
    });
  };

  componentDidMount() {
    // custom rule will have name 'isPasswordMatch'
    ValidatorForm.addValidationRule("isPasswordMatch", (value) => {
      if (value !== this.state.password) {
        return false;
      }
      return true;
    });
  }
  selectHealthOrganization = (event, labTest) => {
    this.setState({ org: labTest }, function () {});
  };

  handleSelectdministrativeUnit = (value, source) => {
    if ("provinceOfResidence" == source) {
      this.setState({ provinceOfResidence: value });

      if (value != null) {
        this.setState({
          districtOfResidenceSearch: {
            pageIndex: 0,
            pageSize: 10000000,
            parentId: value.id,
          },
          districtOfResidence: null,
          wardOfResidence: null,
        });
      } else {
        this.setState({ districtOfResidence: null });
        this.setState({ wardOfResidence: null });
        this.setState({
          districtOfResidenceSearch: { pageIndex: 0, pageSize: 10000000 },
        });
        this.setState({
          wardOfResidenceSearch: { pageIndex: 0, pageSize: 10000000 },
        });
      }
    }
    if ("districtOfResidence" == source) {
      this.setState({ districtOfResidence: value });
      if (value != null) {
        this.setState({
          wardOfResidenceSearch: {
            pageIndex: 0,
            pageSize: 10000000,
            parentId: value.id,
          },
          wardOfResidence: null,
        });
      } else {
        this.setState({ wardOfResidence: null });
        this.setState({
          wardOfResidenceSearch: { pageIndex: 0, pageSize: 10000000 },
        });
      }
    }
    if ("wardOfResidence" == source) {
      this.setState({ wardOfResidence: value });
    }
  };

  render() {
    let { open, handleClose, handleOKEditClose, t, i18n } = this.props;
    let {
      id,
      isAddNew,
      listRole,
      roles,
      active,
      email,
      person,
      username,
      org,
      changePass,
      password,
      confirmPassword,
      provinceOfResidenceSearch,
      provinceOfResidence,
      districtOfResidence,
      districtOfResidenceSearch,
      wardOfResidenceSearch,
      wardOfResidence,
      isCodeStatus,
      codeStatus
    } = this.state;
    let searchObject = { pageIndex: 0, pageSize: 100000 };
    return (
      <Dialog open={open} maxWidth={"md"} fullWidth>
        <DialogTitle
          className="styleColor"
          style={{ cursor: "move" }}
          id="draggable-dialog-title"
        >
          <span className="mb-20 styleColor">
            {" "}
            {(id ? t("general.update") : t("general.add")) + " " + t("user.title")}{" "}
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
        <ValidatorForm ref="form" onSubmit={this.handleFormSubmit}>
          <DialogContent
            dividers
            style={{
              overflow: "hidden",
            }}
          >
            <Grid className="mb-16" container spacing={2}>
               {/*------------- Họ và tên ------------------------*/}
              <Grid item sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  label={
                    <span className="font">
                      <span style={{ color: "red" }}>*</span>
                      {t("user.displayName")}
                    </span>
                  }
                  onChange={(displayName) =>
                    this.handleChange(displayName, "displayName")
                  }
                  type="text"
                  name="name"
                  variant="outlined"
                  size="small"
                  value={person ? person.displayName : ""}
                  validators={["required"]}
                  errorMessages={[t("general.required")]}
                />
              </Grid>
              {/*---------  Giới tính ------------------------*/}
              <Grid item sm={6} xs={12}>
                <FormControl fullWidth={true} variant="outlined" size="small">
                  <InputLabel htmlFor="gender-simple">
                    {
                      <span className="font">
                        {/* <span style={{ color: "red" }}>*</span> */}
                        {t("user.gender")}
                      </span>
                    }
                  </InputLabel>
                  <Select
                    label = {<span className="font">{t("user.gender")}</span>}
                    value={person ? person.gender : ""}
                    onChange={(gender) => this.handleChange(gender, "gender")}
                    inputProps={{
                      name: "gender",
                      id: "gender-simple",
                    }}
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
              {/*-------------- Tên đăng nhập -------------------*/}
              <Grid item sm={6} xs={12}>
                <TextValidator
                  InputProps={{
                    readOnly: !isAddNew,
                  }}
                  className="w-100"
                  label={
                    <span className="font">
                      <span style={{ color: "red" }}>*</span>
                      {t("user.username")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="username"
                  variant="outlined"
                  size="small"
                  value={username}
                  validators={["required"]}
                  errorMessages={[t("general.required")]}
                />
              </Grid>
                {/*------------ Email --------------------*/}
              <Grid item sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  label={
                    <span className="font">
                      <span style={{ color: "red" }}>*</span>
                      {t("user.email")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="email"
                  name="email"
                  variant="outlined"
                  size="small"
                  value={email}
                  validators={["required", "isEmail"]}
                  errorMessages={[
                    t("general.required"),
                    t("invalidEmail"),
                  ]}
                />
              </Grid>
              {/*----------- Đơn vị hành chính --------------*/}
              <Grid item lg={6} md={6} sm={6} xs={12}>
                <AsynchronousAutocomplete
                  label={
                    <span className="font">
                      <span style={{ color: "red" }}> * </span>
                      {t("Department.town")}
                    </span>
                  }
                  searchFunction={getAdministrativeUnitByPage}
                  searchObject={provinceOfResidenceSearch}
                  value={provinceOfResidence ? provinceOfResidence : null}
                  multiple={false}
                  defaultValue={
                    provinceOfResidence ? provinceOfResidence : null
                  }
                  displayLable={"name"}
                  className="w-100"
                  validators={["required"]}
                  errorMessages={[t("general.required")]}
                  onSelect={(value) => {
                    this.handleSelectdministrativeUnit(
                      value,
                      "provinceOfResidence"
                    );
                  }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item lg={6} md={6} sm={6} xs={12}>
                <AsynchronousAutocomplete
                  label={
                    <span className="font">
                      <span style={{ color: "red" }}> * </span>
                      {t("Department.district")}
                    </span>
                  }
                  searchFunction={getAdministrativeUnitByPage}
                  searchObject={districtOfResidenceSearch}
                  value={districtOfResidence ? districtOfResidence : null}
                  multiple={false}
                  defaultValue={
                    districtOfResidence ? districtOfResidence : null
                  }
                  displayLable={"name"}
                  className="w-100"
                  validators={["required"]}
                  errorMessages={[t("general.required")]}
                  onSelect={(value) => {
                    this.handleSelectdministrativeUnit(
                      value,
                      "districtOfResidence"
                    );
                  }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item lg={6} md={6} sm={6} xs={12}>
                <AsynchronousAutocomplete
                  label={
                    <span className="font">
                      <span style={{ color: "red" }}> * </span>
                      {t("Department.ward")}
                    </span>
                  }
                  searchFunction={getAdministrativeUnitByPage}
                  searchObject={wardOfResidenceSearch}
                  value={wardOfResidence ? wardOfResidence : null}
                  multiple={false}
                  defaultValue={wardOfResidence ? wardOfResidence : null}
                  displayLable={"name"}
                  className="w-100"
                  validators={["required"]}
                  errorMessages={[t("general.required")]}
                  onSelect={(value) => {
                    this.handleSelectdministrativeUnit(
                      value,
                      "wardOfResidence"
                    );
                  }}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item lg={6} md={6} sm={6} xs={12}>
                <Autocomplete
                  // className="w-100 mt-16"
                  disableClearable
                  id="combo-box"
                  options={this.state.listOrg ? this.state.listOrg : []}
                  value={this.state.org ? this.state.org : null}
                  size="small"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      value={this.state.org ? this.state.org : null}
                      label={
                        <span>
                          <span style={{ color: "red" }}></span>
                          {t("healthOrg.title")}
                        </span>
                      }
                      variant="outlined"
                    />
                  )}
                  getOptionLabel={(option) => option.name}
                  getOptionSelected={(option, value) => option.id === value.id}
                  onChange={(event, value) => {
                    this.selectHealthOrganization(event, value);
                  }}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                {listRole && (
                  <Autocomplete
                    style={{ width: "100%" }}
                    multiple
                    id="combo-box-demo"
                    defaultValue={roles}
                    options={listRole}
                    getOptionSelected={(option, value) =>
                      option.id === value.id
                    }
                    getOptionLabel={(option) => option.authority}
                    onChange={(event, value) => {
                      this.selectRoles(value);
                    }}
                    size = "small"
                    renderInput={(params) => (
                      <TextValidator
                        {...params}
                        value={roles}
                        label={
                          <span className="font">
                            <span style={{ color: "red" }}>*</span>
                            {t("user.role")}
                          </span>
                        }
                        variant="outlined"
                        size="small"
                        fullWidth
                        validators={["required"]}
                        errorMessages={[t("user.please_select_permission")]}
                      />
                    )}
                  />
                )}
              </Grid>
              {!isAddNew && (
                <Grid item sm={6} xs={12}>
                  <FormControlLabel
                    value={changePass}
                    className="mb-16"
                    name="changePass"
                    onChange={(changePass) =>
                      this.handleChange(changePass, "changePass")
                    }
                    control={<Checkbox checked={changePass} />}
                    label={t("user.changePass")}
                  />
                </Grid>
              )}
              <Grid item sm={6} xs={12}>
                <FormControlLabel
                  value={active}
                  className="mb-16"
                  name="active"
                  onChange={(active) => this.handleChange(active, "active")}
                  control={<Checkbox checked={active} />}
                  label={t("user.active")}
                />
              </Grid>
              {changePass != null && changePass == true ? (
                <Grid container spacing={2}>
                  <Grid item sm={6} xs={12}>
                    <TextValidator
                      className="mb-16 w-100"
                      label={
                        <span className="font">
                          <span style={{ color: "red" }}>*</span>
                          {t("user.pass")}
                        </span>
                      }
                      variant="outlined"
                      size="small"
                      onChange={this.handleChange}
                      name="password"
                      type="password"
                      value={password}
                      validators={["required", "matchRegexp:([A-Za-z0-9]{6,})"]}
                      errorMessages={[
                        t("general.required"),
                        t("user.passwordMessage"),
                      ]}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12}>
                    <TextValidator
                      className="mb-16 w-100"
                      label={
                        <span className="font">
                          <span style={{ color: "red" }}>*</span>
                          {t("user.re_pass")}
                        </span>
                      }
                      variant="outlined"
                      size="small"
                      onChange={this.handleChange}
                      name="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      validators={["required", "isPasswordMatch"]}
                      errorMessages={[
                        t("general.required"),
                        t("user.passwordMatchMessage"),
                      ]}
                    />
                  </Grid>
                </Grid>
              ) : (
                <div></div>
              )}
            </Grid>
          </DialogContent>
          <DialogActions spacing={4} className="flex flex-end flex-middle">
            <Grid container spacing={2} direction="row" justify="flex-end" alignItems="center" sm={12}>
              <Button
                variant="contained"
                color="secondary"
                className="mr-16 mb-16"
                onClick={() => this.props.handleClose()}
              >
                {t("general.cancel")}
              </Button>
              <Button
                variant="contained"
                className="mr-16 mb-16"
                color="primary"
                type="submit"
              >
                {t("general.save")}
              </Button>
            </Grid>
          </DialogActions>
        </ValidatorForm>
      </Dialog>
    );
  }
}

export default UserEditorDialog;

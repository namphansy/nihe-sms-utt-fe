import React, { Component, useState } from "react";
import {
  Dialog,
  Button,
  Grid,
  DialogActions,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextareaAutosize,
  Checkbox,
  TablePagination
} from "@material-ui/core";
import MaterialTable, {
  MTableToolbar,
} from "material-table";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { checkCode, updateUser, addNew, update, searchSpecimentByShipCard } from "./ShippingCardService";
import { searchByPage as searchOrg } from "../HealthOrg/HealthOrgService";
import { searchByPage as searchLabTest } from "../HealthOrg/HealthOrgService";
import HealthOrganizationPopup from "./HealthOrganizationPopup";
import SelectSpecimenPopup from "./SelectSpecimenPopup";
import Tooltip from '@material-ui/core/Tooltip';

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DateFnsUtils from '@date-io/date-fns';
import AsynchronousAutocomplete from "../utilities/AsynchronousAutocomplete"
import { getAllInfoByUserLogin } from "../User/UserService";

import { MuiPickersUtilsProvider, KeyboardDatePicker, } from "@material-ui/pickers";
import moment from "moment";

toast.configure({
  autoClose: 2000,
  draggable: false,
  limit: 3,
});

class ShippingCardDialog extends Component {
  state = {
    name: "",
    code: "",
    description: "",
    isAddnew: false,
    DVLM: {},
    DVXN: {},
    isActive: false,
    shouldOpenSelectParentPopup: false,
    item: {},
    listSpecimen: [],
    shouldOpenHealthOrganizationPopup: false,
    shouldOpenSampleCollectOrgPopup: false,
    shouldOpenSelectSpecimenPopup: false,
    autoGenCode: false,
    shippingCardType: "Normal",
    healOrgType: null,
    permissionEdit: false,
    rowsPerPage: 10,
    page: 0,
    totalElements: 0,
    listSpecimenPick: [],
    listSpecimentPagination: [],
    pageCustom: 0,
    rowsPerPageCustom: 5,
  };

  listShippingStatus = [
    { id: "Draft", name: "Chưa gửi" },
    { id: "Pending", name: "Đã gửi" },
    { id: "Accepted", name: "Đã nhận" }
  ]

  listShippingStatusDVLM = [
    { id: "Draft", name: "Chưa gửi" },
    { id: "Pending", name: "Gửi mẫu" },
  ]

  listShippingStatusAccep = [
    { id: "Accepted", name: "Đã nhận" }
  ]

  listShippingStatusDVXN = [
    { id: "Draft", name: "Chưa gửi" },
    { id: "Pending", name: "Đã gửi" },
    { id: "Accepted", name: "Đã nhận" }
  ]

  handleChange = (event, source) => {
    if (source === "shippingStatus") {
      this.setState({ shippingStatus: event.target.value });
      return;
    }
    this.setState({
      [event.target.name]: event.target.value,

    });
  };

  handleAutoGenCode = () => {
    if (this.state.autoGenCode == true) {
      this.setState({ autoGenCode: false })
    }
    if (this.state.autoGenCode == false) {
      this.setState({ code: null })
      this.setState({ autoGenCode: true })
    }

  }

  handleFormSubmit = () => {
    let { id, name, code, labTest, org, receiverDate, shipDate, receiverBy, listSpecimen, autoGenCode } = this.state;
    let object = { id: id, name: name, code: code };
    let item = {};
    item.id = this.state.id;
    item.name = this.state.name;
    item.code = this.state.code;
    item.shippingStatus = this.state.shippingStatus;
    if (this.state.DVLM != null) {
      item.org = this.state.DVLM
    }
    else {
      item.org = this.state.item.org;
    }
    if (this.state.DVXN != null) {
      item.labTest = this.state.DVXN
    }
    else {
      item.labTest = this.state.item.labTest;
    }
    item.shipDate = this.state.item.shipDate;
    item.receiverDate = this.state.item.receiverDate;
    item.receiverBy = this.state.receiverBy;
    item.listSpecimen = this.state.listSpecimenPick;
    item.type = this.state.shippingCardType;
    if (!autoGenCode) {
      checkCode(object).then((result) => {
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
    } else if (autoGenCode) {
      if (id) {
        update(
          item
        ).then(() => {
          this.props.handleOKEditClose();
          toast.success("Cập nhật thành công!")
        });

      } else {
        item.autoGenCode = true;
        addNew(
          item
        ).then(() => {
          this.props.handleOKEditClose();
          toast.success("Thêm mới thành công!")
          // this.setState()
        });
      }
    }

  };

  handleDateChange = (value, source) => {
    let { item } = this.state;
    item = item ? item : {};

    item[source] = value;
    this.setState({ item: item });
  }

  handleDialogClose = () => {
    this.setState({
      shouldOpenSelectParentPopup: false,
      shouldOpenHealthOrganizationPopup: false,
      shouldOpenEditorDialog: false,
      shouldOpenConfirmationDialog: false,
      shouldOpenNotificationPopup: false,
      shouldOpenSelectParentPopup: false,
      shouldOpenHealthOrganizationPopup: false,
      shouldOpenSampleCollectOrgPopup: false,
      shouldOpenSampleBatchDialog: false,
      shouldOpenSelectSpecimenPopup: false,
    });
  };

  handleSelectSampleCollectOrg = (org) => {
    let { item } = this.state;
    item = item ? item : {};
    if (org && org.id) {
      this.setState({ DVLM: org });
      this.state.DVLM.name = org.name;
      item["org"] = org;
      this.setState({ item: item });
      this.handleDialogClose();
    }
  }

  handleSelectHealthOrganization = (labTest) => {
    let { item } = this.state;
    item = item ? item : {};
    if (labTest && labTest.id) {
      this.setState({ DVXN: labTest })
      this.state.DVXN.name = labTest.name;
      item["labTest"] = labTest;
      this.setState({ item: item });
      this.handleDialogClose();
    }
  }

  handleSelectSpecimen = (listItem) => {
    let list = listItem.slice(0, this.state.rowsPerPageCustom);
    this.setState({ listSpecimenPick: listItem, listSpecimentPagination: list}, () => {
      this.handleDialogClose();
    });
  }

  gender = (value) => {
    //Khai báo const
    let name = "";
    if (value === "F") {
      name = "Nữ";
    } else if (value === "M") {
      name = "Nam";
    }
    return name;
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

  componentWillMount() {
    let { item } = this.props;

    if (item.id) {
      this.setState({ ...item, item: item, isAddnew: true}, () => {
        this.updatePageData();
      });
    }

    getAllInfoByUserLogin().then(({ data }) => {
      if (data?.userOrganization?.org?.orgType == 2) {
        this.setState({ DVLM: data.userOrganization.org, healOrgType: 2 })
      }
      else if (data?.userOrganization?.org?.orgType == 1) {
        this.setState({ DVXN: data.userOrganization.org, healOrgType: 1 })
      }
    });
  }

  componentWillUnmount() {
    ValidatorForm.removeValidationRule('whitespace');
  }

  updatePageData() {
    let searchObject = {};
    searchObject.pageIndex = this.state.page;
    searchObject.pageSize = this.state.rowsPerPage;
    searchObject.shippingCardId = this.state.id;
    searchSpecimentByShipCard(searchObject).then(({ data }) => {
      let itemListClone = [...data.content];
      this.setState({
        listSpecimen: itemListClone,
        totalElements: data.totalElements,
      })
    });
  }

  setPage = page => {
    this.setState({ page }, function () {
      this.updatePageData();
    })
  };

  setRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value, page: 0 }, function () {
      this.updatePageData();
    });
  };

  handleChangePage = (event, newPage) => {
    this.setPage(newPage);
  };

  handleChangePageCustom = (event, newPage) => {
    this.setPageCustom(newPage)
  }

  setRowsPerPageCustom = (event) => {
    this.setState({ rowsPerPageCustom: event.target.value, page: 0 }, function () {
        let list = this.state.listSpecimenPick.slice(0, this.state.rowsPerPageCustom)
        this.setState({ listSpecimentPagination: list })
    })
  };

  setPageCustom = page => {
    let pageStart = page * this.state.rowsPerPageCustom
    let pageEnd = this.state.rowsPerPageCustom + pageStart
    let list = this.state.listSpecimenPick.slice(pageStart, pageEnd)
    this.setState({ pageCustom: page, listSpecimentPagination: list })
  };

  render() {
    let { open, handleClose, handleOKEditClose, t, i18n } = this.props;
    let { id, item, org, labTest, receiverBy, name, code,
      shouldOpenSampleCollectOrgPopup, shouldOpenHealthOrganizationPopup, permissionEdit, listSpecimenPick,
      shouldOpenSelectSpecimenPopup, listSpecimen, shippingStatus, DVLM, DVXN, healOrgType, listSpecimentPagination
    } = this.state;
    let columns = [
      { title: t("patient.code"), field: "patientCode", width: "150" },
      { title: t("specimen.code"), field: "niheCode", width: "150" },
      { title: t("specimen.patientName"), field: "fullName", width: "150" },
      {
        title: t("patient.gender"), field: "gender", width: "150",
        render: rowData => this.gender(rowData.patient?.gender ? rowData.patient?.gender : {})
      },
      { title: t("specimen.patientAddress"), field: "patient.address", width: "150" },
      { title: t("specimen.phone"), field: "patient.phone", width: "150" },
    ];
    return (
      <Dialog open={open} fullWidth maxWidth="lg">
        <div className="p-24">
          <h4 className="mb-24">{id ? t("Cập nhật") : t("Thêm mới")}</h4>
          <ValidatorForm ref="form" onSubmit={this.handleFormSubmit}>
            <Grid className="" container spacing={2}>
              {this.state.autoGenCode && <Grid item lg={6} md={5} sm={5} xs={12}>
                <TextValidator
                  className="w-100"
                  // disabled={this.state.autoGenCode}
                  variant="outlined"
                  size="small"
                  label={<span className="font">
                    {t("Mã vận chuyển")}
                  </span>}
                  onChange={this.handleChange}
                  type="text"
                  name="code"
                  value={code}
                  disabled={permissionEdit}
                />
              </Grid>}
              {!this.state.autoGenCode && this.state.isAddnew && <Grid item lg={6} md={5} sm={5} xs={12}>
                <TextValidator
                  className="w-100"
                  // disabled={this.state.autoGenCode}
                  variant="outlined"
                  size="small"
                  label={<span className="font">
                    {t("Mã vận chuyển")}
                  </span>}
                  onChange={this.handleChange}
                  type="text"
                  name="code"
                  value={code}
                  disabled={permissionEdit}
                />
              </Grid>}

              {!this.state.isAddnew && !this.state.autoGenCode &&
                <Grid item lg={6} md={6} sm={6} xs={12}>
                  <TextValidator
                    className="w-100"
                    // disabled={this.state.autoGenCode}
                    variant="outlined"
                    size="small"
                    label={<span className="font">
                      {t("Mã vận chuyển")}
                    </span>}
                    onChange={this.handleChange}
                    type="text"
                    name="code"
                    value={code}
                    disabled={permissionEdit}
                  />
                </Grid>
              }
              {!id &&
                <Grid item lg={1} md={1} sm={6} xs={12}>
                  <Tooltip title="Tạo mẫu tự động" placement="bottom">
                    <Checkbox
                      onChange={this.handleAutoGenCode}
                      inputProps={{ 'aria-label': 'primary checkbox' }}
                      title="Tạo mẫu tự động"
                    />
                  </Tooltip>
                </Grid>
              }

              {/*------------------ Trạng thái mẫu -------------------------*/}
              <Grid item lg={6} md={6} sm={6} xs={12}>
                <FormControl fullWidth={true} variant="outlined" size="small">
                  <InputLabel htmlFor="type-simple">
                    {
                      <span className="font">
                        {t("shippingCard.shippingStatus")}
                      </span>
                    }
                  </InputLabel>
                  <Select
                    label={<span className="font">{t("shippingCard.shippingStatus")}</span>}
                    value={shippingStatus ? shippingStatus : ""}
                    onChange={(shippingStatus) => this.handleChange(shippingStatus, "shippingStatus")}
                    inputProps={{
                      name: "shippingStatus",
                      id: "shippingStatus-simple",
                    }}
                  >
                    {healOrgType == 2 && shippingStatus !== "Accepted" && this.listShippingStatusDVLM.map((item) => {
                      return (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name}
                        </MenuItem>
                      );
                    })}
                    {/* shippingStatus là accept */}
                    {healOrgType == 2 && shippingStatus === "Accepted" && this.listShippingStatusAccep.map((item) => {
                      return (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name}
                        </MenuItem>
                      );
                    })}
                    {/* nếu là đơn vị nhận mẫu */}
                    {healOrgType == 1 && this.listShippingStatusDVXN.map((item) => {
                      return (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name}
                        </MenuItem>
                      );
                    })}
                    {/* nếu là NIHE */}
                    {healOrgType != 2 && healOrgType != 1 && this.listShippingStatus.map((item) => {
                      return (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              {/*----------------- Ngày vận chuyển -----------------------*/}
              {(shippingStatus === "Pending" || shippingStatus === "Accepted") && <Grid item lg={6} md={6} sm={6} xs={12}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    size="small"
                    className="w-100"
                    margin="none"
                    id="date-picker-dialog"
                    label={
                      <span>
                        {t("Ngày vận chuyển")}
                      </span>
                    }
                    inputVariant="outlined"
                    type="text"
                    autoOk={true}
                    format="dd/MM/yyyy HH:mm"
                    value={item.shipDate ? item.shipDate : null}
                    onChange={(value) => this.handleDateChange(value, "shipDate")}
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                    }}
                    disabled={permissionEdit}
                  />
                </MuiPickersUtilsProvider>
              </Grid>}
              {/*------------ Ngày nhận -------------------*/}
              {(shippingStatus === "Accepted") && <Grid item lg={6} md={6} sm={6} xs={12}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    size="small"
                    className="w-100"
                    margin="none"
                    id="date-picker-dialog"
                    label={
                      <span>
                        {t("Ngày nhận")}
                      </span>
                    }
                    inputVariant="outlined"
                    type="text"
                    autoOk={true}
                    format="dd/MM/yyyy HH:mm"
                    value={item.receiverDate ? item.receiverDate : null}
                    onChange={(value) => this.handleDateChange(value, "receiverDate")}
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                    }}
                    disabled={permissionEdit}
                  />
                </MuiPickersUtilsProvider>
              </Grid>}
              {/*------------- Người nhận --------------*/}
              {(shippingStatus === "Accepted") && <Grid item lg={6} md={6} sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  variant="outlined"
                  size="small"
                  label={<span className="font">
                    {/* <span style={{ color: "red" }}> * </span> */}
                    {t("Người nhận")}
                  </span>}
                  onChange={this.handleChange}
                  type="text"
                  name="receiverBy"
                  value={receiverBy}
                  disabled={permissionEdit}
                // validators={["required", 'whitespace']}
                // errorMessages={["Đây là trường bắt buộc", 'phải nhập ký tự']}
                />
              </Grid>}
              <Grid container spacing={2} style={{ paddingLeft: '8px' }}>
                {/*--------------------- chọn đơn vị lấy mẫu -----------------------*/}
                {this.state.healOrgType == 2 ? (
                  <Grid item lg={6} md={6} sm={6} xs={12}>
                    <TextValidator
                      size="small"
                      variant="outlined"
                      className="w-100 "
                      label={
                        <span className="font">
                          {t("Chọn đơn vị lấy mẫu")}
                        </span>
                      }
                      name="org"
                      value={this.state.DVLM.name ? this.state.DVLM.name : ""}
                    />

                    {shouldOpenSampleCollectOrgPopup && (
                      <HealthOrganizationPopup
                        open={shouldOpenSampleCollectOrgPopup}
                        orgType={2}
                        handleSelect={this.handleSelectSampleCollectOrg}
                        item={org}
                        handleClose={this.handleDialogClose}
                        t={t} i18n={i18n}
                      ></HealthOrganizationPopup>
                    )}
                  </Grid>
                ) : (
                  <Grid item lg={6} md={6} sm={6} xs={12}>
                    <TextValidator
                      size="small"
                      variant="outlined"
                      className="w-100 "
                      label={
                        <span className="font">

                          {t("Chọn đơn vị lấy mẫu")}
                        </span>
                      }
                      name="org"
                      value={item?.org ? item.org.name : ""}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button
                              size={'small'}
                              className="align-bottom"
                              variant="contained"
                              color="primary"
                              onClick={() => this.setState({ shouldOpenSampleCollectOrgPopup: true })}
                            >
                              {t('Select')}
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
                        t={t} i18n={i18n}
                      ></HealthOrganizationPopup>
                    )}
                  </Grid>
                )}
                {/*------------------------ Chọn đơn vị xét nghiệm ------------------------*/}
                {this.state.healOrgType == 1 ? (
                  <Grid item lg={6} md={6} sm={6} xs={12}>
                    <TextValidator
                      size="small"
                      variant="outlined"
                      className="w-100 "
                      label={
                        <span className="font">
                          {t("Chọn đơn vị xét nghiệm")}
                        </span>
                      }
                      disabled={permissionEdit}
                      name="labTest"
                      value={this.state.DVXN.name ? this.state.DVXN.name : ""}
                    />
                    {shouldOpenHealthOrganizationPopup && (
                      <HealthOrganizationPopup
                        open={shouldOpenHealthOrganizationPopup}
                        orgType={1}
                        handleSelect={this.handleSelectHealthOrganization}
                        item={labTest}
                        handleClose={this.handleDialogClose}
                        t={t} i18n={i18n}
                      >
                      </HealthOrganizationPopup>

                    )}
                  </Grid>
                ) : (
                  <Grid item lg={6} md={6} sm={6} xs={12}>
                    <TextValidator
                      size="small"
                      variant="outlined"
                      className="w-100 "
                      label={
                        <span className="font">
                          {t("Chọn đơn vị xét nghiệm")}
                        </span>
                      }
                      name="labTest"
                      value={item?.labTest ? item?.labTest?.name : ""}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button
                              size={'small'}
                              className="align-bottom"
                              variant="contained"
                              color="primary"
                              disable={permissionEdit}
                              onClick={() => this.setState({ shouldOpenHealthOrganizationPopup: true })}
                            >
                              {t('Select')}
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
                        t={t} i18n={i18n}
                      ></HealthOrganizationPopup>
                    )}
                  </Grid>
                )}
              </Grid>

              <Grid className="mt-8" xs={12}>
                {/*--------------- Chọn mẫu -------------------*/}
                {this.state.healOrgType != 1 && (
                  <Button
                    variant="contained"
                    className="mr-12"
                    color="primary"
                    onClick={() => this.setState({ shouldOpenSelectSpecimenPopup: true })}
                    disabled={permissionEdit}
                  >
                    Chọn mẫu
                  </Button>
                )}

                {shouldOpenSelectSpecimenPopup && <SelectSpecimenPopup
                  t={t}
                  open={shouldOpenSelectSpecimenPopup}
                  listSpecimenPick={this.state.listSpecimenPick}
                  shippingCardType={this.state.shippingCardType}
                  handleClose={this.handleDialogClose}
                  handleSelect={this.handleSelectSpecimen}
                />}

                  {/*-------- MaterialTable số mẫu sẽ thêm mới ------------*/}
                {listSpecimentPagination.length > 0 && (
                  <fieldset>
                  <legend>Danh sách mẫu thêm mới</legend>
                  <Grid item xs={12}>
                    <MaterialTable
                      data={listSpecimentPagination}
                      columns={columns}
                      options={{
                        selection: false,
                        actionsColumnIndex: -1,
                        paging: false,
                        search: false,
                        rowStyle: rowData => ({
                          backgroundColor: (rowData.tableData.id % 2 === 1) ? '#EEE' : '#FFF',
                        }),
                        headerStyle: {
                          backgroundColor: '#358600',
                          color: '#fff',
                        },
                        padding: 'dense',
                        toolbar: false
                      }}
                      components={{
                        Toolbar: props => (
                          <div style={{ witdth: "100%" }}>
                            <MTableToolbar {...props} />
                          </div>
                        )
                      }}
                      onSelectionChange={rows => { //set
                        this.setState({ sampleCommon: rows })
                      }}
                      localization={{
                        body: {
                          emptyDataSourceMessage: `${t(
                            "general.emptyDataMessageTable"
                          )}`,
                        },
                      }}
                    />
                    <TablePagination
                      align="left"
                      className="px-16"
                      rowsPerPageOptions={[1, 2, 5, 10, 25, 50, 100]}
                      component="div"
                      labelRowsPerPage={t('general.rows_per_page')}
                      labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${t('general.of')} ${count !== -1 ? count : `more than ${to}`}`}
                      count={listSpecimenPick.length}
                      rowsPerPage={this.state.rowsPerPageCustom}
                      page={this.state.pageCustom}
                      backIconButtonProps={{
                        "aria-label": "Previous Page"
                      }}
                      nextIconButtonProps={{
                        "aria-label": "Next Page"
                      }}
                      onChangePage={this.handleChangePageCustom}
                      onChangeRowsPerPage={this.setRowsPerPageCustom}
                    />
                  </Grid>
                </fieldset>
                )}
                {/*------- MaterialTable số mẫu hiện tại --------*/}
                <fieldset>
                  <legend>Danh sách mẫu xét nghiệm</legend>
                  <Grid item xs={12}>
                    <MaterialTable
                      data={listSpecimen}
                      columns={columns}
                      options={{
                        selection: false,
                        actionsColumnIndex: -1,
                        paging: false,
                        search: false,
                        rowStyle: rowData => ({
                          backgroundColor: (rowData.tableData.id % 2 === 1) ? '#EEE' : '#FFF',
                        }),
                        headerStyle: {
                          backgroundColor: '#358600',
                          color: '#fff',
                        },
                        padding: 'dense',
                        toolbar: false
                      }}
                      components={{
                        Toolbar: props => (
                          <div style={{ witdth: "100%" }}>
                            <MTableToolbar {...props} />
                          </div>
                        )
                      }}
                      onSelectionChange={rows => { //set
                        this.setState({ sampleCommon: rows })
                      }}
                      localization={{
                        body: {
                          emptyDataSourceMessage: `${t(
                            "general.emptyDataMessageTable"
                          )}`,
                        },
                      }}
                    />
                    <TablePagination
                      align="left"
                      className="px-16"
                      rowsPerPageOptions={[1, 2, 5, 10, 25, 50, 100]}
                      component="div"
                      labelRowsPerPage={t('general.rows_per_page')}
                      labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${t('general.of')} ${count !== -1 ? count : `more than ${to}`}`}
                      count={this.state.totalElements}
                      rowsPerPage={this.state.rowsPerPage}
                      page={this.state.page}
                      backIconButtonProps={{
                        "aria-label": "Previous Page"
                      }}
                      nextIconButtonProps={{
                        "aria-label": "Next Page"
                      }}
                      onChangePage={this.handleChangePage}
                      onChangeRowsPerPage={this.setRowsPerPage}
                    />
                  </Grid>
                </fieldset>
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
                <Button 
                  variant="contained" 
                  color="primary" 
                  type="submit" 
                  disabled={permissionEdit}
                >
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


export default ShippingCardDialog;

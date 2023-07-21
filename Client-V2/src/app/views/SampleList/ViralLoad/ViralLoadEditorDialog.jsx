import DateFnsUtils from "@date-io/date-fns";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  FormControl,
  Grid,
  MenuItem,
  Select,
  TextField,
  TablePagination,
} from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import MaterialTable, { MTableToolbar } from "material-table";
import React, { Component } from "react";
import { TextValidator, ValidatorForm } from "react-material-ui-form-validator";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConstantList from "../../../appConfig";
import AutoComplete from "@material-ui/lab/AutoComplete";
import { searchReagent } from "../../Reagent/ReagentService";
import { searchByPage as searchTestMethod } from "app/views/TestMethod/TestMethodService";
import { getByIDByParentId } from "../../ReagentCode/ReagentCodeService";
import { searchByPage as searchTestMachine } from "../../TestMachine/TestMachineService";
import AsynchronousAutocomplete from "../../utilities/AsynchronousAutocomplete";
import {
  checkCode,
  deleteListLabTestClone,
  getListLabTestClone,
  saveOrUpdate,
} from "../SampleListService";
import SelectSpecimenPopup from "../SelectSpecimenPopup";
import UploadExcelDialog from "../../uploadExcel/UploadFormPopupViralLoad";
import Constant from '../Constants';

toast.configure({
  autoClose: 2000,
  draggable: false,
  limit: 3,
});

class ViralLoadEditorDialog extends Component {
  state = {
    name: "",
    code: "",
    item: {},
    testType: "VL",
    listLabTestResult: [],
    isActive: false,
    shouldOpenSelectSpecimenPopup: false,
    autoGenCode: false,
    shouldOpenImportExcelPopup: false,
    shouldOpenImportMachine4800Popup: false,
    shouldOpenImportMachine96Popup: false,
    shouldOpenImportMachineAbbotPopup: false,
    reagentSearch: {
      pageIndex: 0,
      pageSize: 10000000,
    },
    reagentCodeSearch: {},
    reagentCode: null,
    reagent: null,
    testMethod: null,
    rowsPerPage: 5,
    page: 0,
  };

  handleChange = (event, source) => {
    if (source === "testDate") {
      this.setState({ [source]: event });
      return;
    }
    if (source === "resultDate") {
      this.setState({ [source]: event });
      return;
    }
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  selectReagent = (event, value, reason) => {
    this.setState({ reagent: value });
    this.setState({ reagentCode: null });
    getByIDByParentId(value?.id).then(({ data }) => {
      this.setState({
        listReagentCode: data,
      });
    });
  };

  selectTestMethod = (event, value, reason) => {
    this.setState({ testMethod: value });
  };

  selectReagentCode = (event, value, reason) => {
    console.log(event, value, reason);
    this.setState({ reagentCode: value });
  };

  selectTestMachine = (value) => {
    this.setState({ testMachine: value });
  };

  handleAutoGenCode = () => {
    if (this.state.autoGenCode == true) {
      this.setState({ autoGenCode: false });
    }
    if (this.state.autoGenCode == false) {
      this.setState({ autoGenCode: true });
    }
  };

  handleRowDataCellChange = (rowData, event) => {
    let { listLabTestResult } = this.state;
    let { t } = this.props;
    if (listLabTestResult != null && listLabTestResult.length > 0) {
      listLabTestResult.forEach((element) => {
        if (
          element.tableData != null &&
          rowData != null &&
          rowData.tableData != null &&
          element.tableData.id == rowData.tableData.id
        ) {
          if (event.target.name == "labResult") {
            element.labResult = event.target.value;
          } else if (event.target.name == "testCode") {
            element.testCode = event.target.value;
          } else if (event.target.name == "finalResult") {
            element.finalResult = event.target.value;
          } else if (event.target.name == "thresholdValue") {
            element.thresholdValue = event.target.value;
          } else if (event.target.name == "resultStatus") {
            element.resultStatus = event.target.value;
          } else if (event.target.name == "times") {
            element.times = event.target.value;
          } else if (event.target.name == "status") {
            element.status = event.target.value;
            if (event.target.value === "Undetachable") {
              element.labResult = null;
            }
          }
        }
      });
      this.setState({ listLabTestResult: listLabTestResult });
    }
  };

  handleSelectSpecimen = (listItem) => { 
    const listLabTestResult = [];
    if (listItem != null && listItem.length > 0) {
      listItem.map((item) => {
        let labTestDetail = {};
        labTestDetail.specimen = item;
        labTestDetail.labResult = "";
        labTestDetail.thresholdValue = null;
        labTestDetail.finalResult = "";
        labTestDetail.testCode = "";
        labTestDetail.resultDate = null;
        labTestDetail.resultStatus = null;
        labTestDetail.times = null;
        labTestDetail.type = 1; //NormalVL= 1, EID =2
        listLabTestResult.push(labTestDetail);
      });
      this.setState({ 
        listLabTestResult: listLabTestResult, listSpecimenPick: listItem 
      }, () => {});  
    } else {
      this.setState({listLabTestResult: [], listSpecimenPick: []});   
    }
    this.handleDialogClose();
  };

  handleFormSubmit = () => {
    let { id, code } = this.state;
    let object = { id: id, code: code };
    let item = {};
    item.id = id;
    item.code = code;
    item.testDate = this.state.testDate;
    item.resultDate = this.state.resultDate;
    item.performer = this.state.performer;
    item.auditor = this.state.auditor;
    item.reagent = this.state.reagent;
    item.testMethod = this.state.testMethod;
    item.testMachine = this.state.testMachine;
    item.listLabTestResult = this.state.listLabTestResult;
    item.reagentCode = this.state.reagentCode;
    item.testType = "VL";

    if (this.state.autoGenCode == false) {
      checkCode(object).then((result) => {
        if (result.data) {
          toast.warning("Code đã được sử dụng");
        } else {
          if (id) {
            saveOrUpdate(item)
              .then(() => {
                toast.success("Cập nhật thành công");
                this.props.handleOKEditClose();
              })
              .catch(() => {
                toast.error("Có lỗi xảy ra khi cập nhật");
              });
          } else {
            saveOrUpdate(item)
              .then(() => {
                toast.success("Thêm mới thành công");
                this.props.handleOKEditClose();
              })
              .catch(() => {
                toast.error("Có lỗi xảy ra khi thêm mới");
              });
          }
        }
      });
    } else if (this.state.autoGenCode == true) {
      if (id) {
        saveOrUpdate(item)
          .then(() => {
            toast.success("Cập nhật thành công");
            this.props.handleOKEditClose();
          })
          .catch(() => {
            toast.error("Có lỗi xảy ra khi cập nhật");
          });
      } else {
        saveOrUpdate(item)
          .then(() => {
            toast.success("Thêm mới thành công");
            this.props.handleOKEditClose();
          })
          .catch(() => {
            toast.error("Có lỗi xảy ra khi thêm mới");
          });
      }
    }
  };

  async updateListLabTestClone() {
    let { listLabTestResult } = this.state;
    console.log(listLabTestResult);
    const { data } = await getListLabTestClone();

    data.map((item) => {
      const found = listLabTestResult.findIndex(
        (obj) => obj.specimen.niheCode == item.specimen.niheCode
      );
      if (found !== -1) {
        listLabTestResult[found].labResult = item.labResult;
        listLabTestResult[found].finalResult = item.finalResult;
      } else {
        listLabTestResult.push(item);
      }
    });
    await this.setState({
      listLabTestResult: listLabTestResult,
    });
  };

  handleDialogClose = () => {
    this.setState({
      shouldOpenEditorDialog: false,
      shouldOpenConfirmationDialog: false,
      shouldOpenNotificationPopup: false,
      shouldOpenSelectSpecimenPopup: false,
    });
  };

  reloadListLabTest() {
    this.updateListLabTestClone();
  };

  componentWillMount() {
    let { item } = this.props;
    let listSpecimen = [];
    if (
      item != null &&
      item.listLabTestResult != null &&
      item.listLabTestResult.length > 0
    ) {
      listSpecimen = item.listLabTestResult.map((item) => {
        return item.specimen;
      });
    }
    deleteListLabTestClone()
    this.setState({ ...item, listSpecimenPick: listSpecimen });
  };

  validateForm(value) {
    let whitespace = new RegExp(/[^\s]+/);
    if (!whitespace.test(value)) {
      return true;
    }
    return false;
  };

  ResultStatus = (value) => {
    if (value.labResult) {
      value.resultStatus = 2;
      return (
        <small
          className="border-radius-4 text-black px-8 py-2 "
          style={{ backgroundColor: "#83ef84" }}
        >
          {"Có kết quả"}
        </small>
      );
    } else if (!value.labResult) {
      value.resultStatus = 1;
      return (
        <small
          className="border-radius-4 px-8 py-2 "
          style={{ backgroundColor: "#FF0000", color: "#ffffff" }}
        >
          {"Chưa có kết quả"}
        </small>
      );
    }
  };

  componentDidMount() {
    ValidatorForm.addValidationRule("whitespace", (value) => {
      if (this.validateForm(value)) {
        return false;
      }
      return true;
    });
    this.updateListLabTestClone();

    let searchObject = { pageIndex: 0, pageSize: 100000 };
    searchReagent(searchObject).then(({ data }) =>
      this.setState({ listReagent: data.content })
    );

    searchTestMethod(searchObject).then(({ data }) =>
      this.setState({ listTestMethod: data.content })
    );

    if (this.state.reagent) {
      getByIDByParentId(this.state.reagent.id).then(({ data }) => {
        this.setState({
          listReagentCode: data,
        });
      });
    } else {
      this.setState({
        reagentCode: null,
      });
    }
  };

  setPage = (page) => {
    this.setState({ page });
  };

  handleChangePage = (event, newPage) => {
    this.setPage(newPage);
  };

  setRowsPerPage = (e) => {
    this.setState({
      rowsPerPage: e.target.value,
    });
  };

  componentWillUnmount() {
    ValidatorForm.removeValidationRule("whitespace");
    deleteListLabTestClone();
  };

  handleClosePopupExcel;

  render() {
    let { open, handleClose, handleOKEditClose, t, i18n } = this.props;
    let {
      id,
      name,
      code,
      performer,
      testMachine,
      shouldOpenSelectSpecimenPopup,
      autoGenCode,
      listLabTestResult,
      org,
      item,
      shouldOpenPatientPopup,
      testDate,
      resultDate,
      reagent,
      auditor,
      reagentCode,
      testMethod,
      itemListReagentCode,
      rowsPerPage,
      page,
    } = this.state;
    let searchObject = { pageIndex: 0, pageSize: 100000 };
    let columns = [
      {
        title: t("patient.code"),
        field: "specimen.patientCode",
        width: "150",
        headerStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          textAlign: "center",
        },
      },
      {
        title: t("specimen.code"),
        field: "specimen.niheCode",
        width: "150",
        headerStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          textAlign: "center",
        },
      },
      {
        title: t("EID.result") + "(cp/ml)",
        field: "labResult",
        align: "center",
        width: "100",
        headerStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          textAlign: "center",
        },
      },
      // gtri nguong
      // {
      //     title: "Giá trị Ngưỡng (ct)",
      //     field: "thresholdValue",
      //     align: "center",
      //     width: "100",
      //     headerStyle: {
      //         minWidth: "100px",
      //         paddingRight: "0px",
      //         textAlign: "center",
      //     },
      //     cellStyle: {
      //         minWidth: "100px",
      //         paddingRight: "0px",
      //         textAlign: "center",
      //     },
      //     render: rowData => (
      //         <TextValidator
      //             className="w-100"

      //             size="small"
      //             onChange={event =>
      //                 this.handleRowDataCellChange(rowData, event)
      //             }
      //             type="number"
      //             name="thresholdValue"
      //             value={rowData.thresholdValue}
      //         />
      //     )
      // },

      {
        title: t("result.status"),
        field: "resultStatus",
        align: "center",
        width: "150",
        render: (rowData) => this.ResultStatus(rowData),
      },
    ];
    console.log(this.state.listLabTestResult);
    return (
      <Dialog open={open} fullWidth maxWidth="lg">
        <div className="p-24">
          <h4 className="mb-24">
            {id ? t("general.update") : t("general.add")} {t("viralLoad.popup")}
          </h4>
          <ValidatorForm ref="form" onSubmit={this.handleFormSubmit}>
            <Grid className="mt-8" container spacing={2}>
              {this.state.autoGenCode && (
                <Grid item lg={3} md={3} sm={3} xs={12}>
                  <TextValidator
                    disabled={autoGenCode}
                    className="w-100"
                    variant="outlined"
                    size="small"
                    label={<span className="font">{t("viralLoad.code")}</span>}
                    onChange={this.handleChange}
                    type="text"
                    name="code"
                    value={code}
                  />
                </Grid>
              )}

              {!this.state.autoGenCode && !this.state.id && (
                <Grid item lg={3} md={3} sm={6} xs={12}>
                  <TextValidator
                    disabled={autoGenCode}
                    className="w-100"
                    variant="outlined"
                    size="small"
                    label={
                      <span className="font">
                        <span style={{ color: "red" }}> * </span>
                        {t("viralLoad.code")}
                      </span>
                    }
                    onChange={this.handleChange}
                    type="text"
                    name="code"
                    value={code}
                    validators={["required", "whitespace"]}
                    errorMessages={[
                      t("general.required"),
                      t("general.invalidCharacter"),
                    ]}
                  />
                </Grid>
              )}
              {this.state.id && (
                <Grid item lg={4} md={4} sm={6} xs={12}>
                  <TextValidator
                    className="w-100"
                    variant="outlined"
                    size="small"
                    label={
                      <span className="font">
                        <span style={{ color: "red" }}> * </span>
                        {t("viralLoad.code")}
                      </span>
                    }
                    onChange={this.handleChange}
                    type="text"
                    name="code"
                    value={code}
                    validators={["required", "whitespace"]}
                    errorMessages={[
                      t("general.required"),
                      t("general.invalidCharacter"),
                    ]}
                  />
                </Grid>
              )}

              {!this.state.id && (
                <Grid item lg={1} md={1} sm={6} xs={12}>
                  <Tooltip title="Tạo mẫu tự động" placement="bottom">
                    <Checkbox
                      onChange={this.handleAutoGenCode}
                      inputProps={{ "aria-label": "primary checkbox" }}
                      title="Tạo mẫu tự động"
                    />
                  </Tooltip>
                </Grid>
              )}

              {/* ngày xét nghiệm */}
              <Grid item lg={4} md={4} sm={6} xs={12}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    size="small"
                    className="w-100"
                    margin="none"
                    id="date-picker-dialog"
                    label={<span>{t("viralLoad.testDate")}</span>}
                    inputVariant="outlined"
                    type="text"
                    // autoOk={true}
                    format="dd/MM/yyyy"
                    value={testDate ? testDate : null}
                    onChange={(value) => this.handleChange(value, "testDate")}
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                    }}
                  />
                </MuiPickersUtilsProvider>
              </Grid>
              {/* Ngày có kết quả  */}
              <Grid item lg={4} md={4} sm={6} xs={12}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    size="small"
                    className="w-100"
                    margin="none"
                    id="date-picker-dialog"
                    label={<span>{t("viralLoad.resultDate")}</span>}
                    inputVariant="outlined"
                    type="text"
                    // autoOk={true}
                    format="dd/MM/yyyy"
                    value={resultDate ? resultDate : null}
                    onChange={(value) => this.handleChange(value, "resultDate")}
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                    }}
                  />
                </MuiPickersUtilsProvider>
              </Grid>
              <Grid item lg={4} md={4} sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  variant="outlined"
                  size="small"
                  label={
                    <span className="font">
                      <span style={{ color: "red" }}> * </span>
                      {t("viralLoad.performer")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="performer"
                  value={performer}
                  validators={["required", "whitespace"]}
                  errorMessages={[
                    t("general.required"),
                    t("general.invalidCharacter"),
                  ]}
                />
              </Grid>
              <Grid item lg={4} md={4} sm={6} xs={12}>
                <TextValidator
                  className="w-100"
                  variant="outlined"
                  size="small"
                  label={
                    <span className="font">
                      <span style={{ color: "red" }}> * </span>
                      {t("viralLoad.auditor")}
                    </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="auditor"
                  value={auditor}
                  validators={["required", "whitespace"]}
                  errorMessages={[
                    t("general.required"),
                    t("general.invalidCharacter"),
                  ]}
                />
              </Grid>
              <Grid item lg={4} md={4} sm={6} xs={12}>
                <AutoComplete
                  label={t("EID.reagent")}
                  size="small"
                  id="combo-box"
                  className="flex-end"
                  value={reagent}
                  options={this.state.listReagent ? this.state.listReagent : []}
                  onChange={this.selectReagent}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => (
                    <TextField
                      label={t("EID.reagent")}
                      fullWidth
                      variant="outlined"
                      {...params}
                    />
                  )}
                />
              </Grid>

              <Grid item lg={4} md={4} sm={6} xs={12}>
                <AutoComplete
                  label={t("EID.reagent")}
                  variant="outlined"
                  size="small"
                  value={reagentCode ? reagentCode : []}
                  options={
                    this.state.listReagentCode ? this.state.listReagentCode : []
                  }
                  onChange={this.selectReagentCode}
                  getOptionLabel={(option) => option.code}
                  renderInput={(params) => (
                    <TextField
                      className="font-inherit"
                      label={t("EID.reagentCode")}
                      fullWidth
                      variant="outlined"
                      {...params}
                    />
                  )}
                />
              </Grid>

              <Grid item lg={4} md={4} sm={6} xs={12}>
                <AsynchronousAutocomplete
                  label={t("viralLoad.testMachine")}
                  variant="outlined"
                  size="small"
                  searchFunction={searchTestMachine}
                  // multiple={true}
                  searchObject={searchObject}
                  defaultValue={testMachine}
                  displayLable={"name"}
                  value={testMachine}
                  onSelect={this.selectTestMachine}
                />
              </Grid>
              <Grid item lg={4} md={4} sm={6} xs={12}>
                <AutoComplete
                  size="small"
                  id="combo-box"
                  className="flex-end"
                  value={testMethod}
                  options={
                    this.state.listTestMethod ? this.state.listTestMethod : []
                  }
                  onChange={this.selectTestMethod}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => (
                    <TextField
                      label={"Kỹ thuật xét nghiệm"}
                      fullWidth
                      variant="outlined"
                      {...params}
                    />
                  )}
                />
              </Grid>

              <Grid className="mt-8" xs={12}>
                <Button
                  variant="contained"
                  className="mr-12"
                  color="primary"
                  onClick={() =>
                    this.setState({ shouldOpenSelectSpecimenPopup: true })
                  }
                >
                  Chọn mẫu
                </Button>
                <Button
                  variant="contained"
                  className="mr-12"
                  color="primary"
                  onClick={() =>
                    this.setState({ shouldOpenImportMachine96Popup: true })
                  }
                >
                  Import máy CAP/CTM
                </Button>
                <Button
                  variant="contained"
                  className="mr-12"
                  color="primary"
                  onClick={() =>
                    this.setState({ shouldOpenImportMachine4800Popup: true })
                  }
                >
                  Import máy COBAS 4800{" "}
                </Button>
                <Button
                  variant="contained"
                  className="mr-12"
                  color="primary"
                  onClick={() =>
                    this.setState({ shouldOpenImportMachineAbbotPopup: true })
                  }
                >
                  Import máy Abbott m2000sp/rt{" "}
                </Button>

                {shouldOpenSelectSpecimenPopup && ( 
                  <SelectSpecimenPopup
                    t={t}
                    patientType={4}
                    open={shouldOpenSelectSpecimenPopup}
                    listSpecimenPick={this.state.listSpecimenPick}
                    handleClose={this.handleDialogClose}
                    handleSelect={this.handleSelectSpecimen}
                  />
                )}
                {this.state.shouldOpenImportMachine4800Popup && (
                  <UploadExcelDialog
                    t={t}
                    i18n={i18n}
                    handleClose={() =>
                      this.setState({ shouldOpenImportMachine4800Popup: false })
                    }
                    open={this.state.shouldOpenImportMachine4800Popup}
                    handleOKEditClose={this.handleClosePopupExcel}
                    enableConfirm={true}
                    acceptType="xlsm;xls;xlsx"
                    uploadUrl={
                      ConstantList.API_ENPOINT +
                      "/api/uploadExcel/importMachine4800"
                    }
                    // typeUpload = {Constant.COBAS_4800}
                    reloadListLabTest={() => this.updateListLabTestClone()}
                  />
                )}
                {this.state.shouldOpenImportMachineAbbotPopup && (
                  <UploadExcelDialog
                    t={t}
                    i18n={i18n}
                    handleClose={() =>
                      this.setState({
                        shouldOpenImportMachineAbbotPopup: false,
                      })
                    }
                    open={this.state.shouldOpenImportMachineAbbotPopup}
                    handleOKEditClose={this.handleOKEditClose}
                    enableConfirm={true}
                    confirmMessage={
                      "Tải lên sẽ xóa các thuộc tính cũ của mẫu, bạn có chắc chắn?"
                    }
                    acceptType="xlsm;xls;xlsx"
                    uploadUrl={
                      ConstantList.API_ENPOINT +
                      "/api/uploadExcel/importMachineAbbott"
                    }
                    reloadListLabTest={() => this.updateListLabTestClone()}
                  />
                )}
                {this.state.shouldOpenImportMachine96Popup && (
                  <UploadExcelDialog
                    t={t}
                    i18n={i18n}
                    handleClose={() =>
                      this.setState({ shouldOpenImportMachine96Popup: false })
                    }
                    open={this.state.shouldOpenImportMachine96Popup}
                    handleOKEditClose={this.handleOKEditClose}
                    enableConfirm={true}
                    confirmMessage={
                      "Tải lên sẽ xóa các thuộc tính cũ của mẫu, bạn có chắc chắn?"
                    }
                    acceptType="xlsm;xls;xlsx"
                    uploadUrl={
                      ConstantList.API_ENPOINT +
                      "/api/uploadExcel/importMachine96/false"
                    }
                    reloadListLabTest={() => this.updateListLabTestClone()}
                  />
                )}
                <fieldset>
                  <legend>Danh sách mẫu xét nghiệm</legend>
                  <Grid item xs={12}>
                    <MaterialTable
                      data={this.state.listLabTestResult.slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )}
                      columns={columns}
                      options={{
                        selection: false,
                        actionsColumnIndex: -1,
                        paging: false,
                        search: false,
                        rowStyle: (rowData) => ({
                          backgroundColor:
                            rowData.tableData.id % 2 === 1 ? "#EEE" : "#FFF",
                        }),
                        headerStyle: {
                          backgroundColor: "#358600",
                          color: "#fff",
                        },
                        padding: "dense",
                        toolbar: false,
                      }}
                      components={{
                        Toolbar: (props) => (
                          <div style={{ witdth: "100%" }}>
                            <MTableToolbar {...props} />
                          </div>
                        ),
                      }}
                      onSelectionChange={(rows) => {
                        //set
                        this.setState({ sampleCommon: rows });
                      }}
                      localization={{
                        body: {
                          emptyDataSourceMessage: `${t(
                            "general.emptyDataMessageTable"
                          )}`,
                        },
                      }}
                    />
                  </Grid>
                </fieldset>
              </Grid>
            </Grid>
            <TablePagination
              align="left"
              className="px-16"
              rowsPerPageOptions={[1, 2, 5, 10, 25, 50, 100]}
              component="div"
              labelRowsPerPage={t("general.rows_per_page")}
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} ${t("general.of")} ${
                  count !== -1 ? count : `more than ${to}`
                }`
              }
              count={this.state.listLabTestResult.length}
              rowsPerPage={this.state.rowsPerPage}
              page={this.state.page}
              backIconButtonProps={{
                "aria-label": "Previous Page",
              }}
              nextIconButtonProps={{
                "aria-label": "Next Page",
              }}
              onChangePage={this.handleChangePage}
              onChangeRowsPerPage={this.setRowsPerPage}
            />
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

export default ViralLoadEditorDialog;

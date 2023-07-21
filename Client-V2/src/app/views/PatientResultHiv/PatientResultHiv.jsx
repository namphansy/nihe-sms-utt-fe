import React, { Component } from "react";
import {
  Grid,
  IconButton,
  Icon,
  Input,
  InputAdornment,
  TablePagination,
  Button,
  Link,
  TextField,
  FormControl,
  Collapse,
} from "@material-ui/core";
import MaterialTable, { MTableToolbar } from "material-table";
import {
  deleteItem,
  getOne,
  exportExcelResultById,
} from "./PatientResultHivService";
import { searchByPage as searchPatient } from "../Patient/PatientServices";
import { searchByPage } from "../ShippingCard/ShippingCardService";

import ResultDialog from "./PatientResultHivDialog";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Breadcrumb, ConfirmationDialog } from "egret";
import { useTranslation } from "react-i18next";
import SearchIcon from "@material-ui/icons/Search";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import moment from "moment";
import { connect } from "react-redux";
import { getLoading } from "../../redux/actions/LoadingActions";
import PatientResultHivPopup from "./PatientResultHivPopup";
import FilterListIcon from "@material-ui/icons/FilterList";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import PatientResultHivFilter from "./PatientResultHivFillter";
import ShippingCard from "./../ShippingCard/ShippingCard";

toast.configure({
  autoClose: 2000,
  draggable: false,
  limit: 3,
});

function MaterialButton(props) {
  const { t, i18n } = useTranslation();
  const item = props.item;
  return (
    <div>
      <IconButton size="small" onClick={() => props.onSelect(item, 0)}>
        <Icon fontSize="small" color="primary">
          edit
        </Icon>
      </IconButton>
    </div>
  );
}

class Result extends Component {
  state = {
    keyword: "",
    rowsPerPage: 10,
    page: 0,
    item: {},
    shouldOpenEditorDialog: false,
    shouldOpenConfirmationDialog: false,
    shouldOpenConfirmDialog: false,
    selectAllItem: false,
    selectedList: [],
    totalElements: 0,
    selectPatient: false,
    shouldOpenConfirmationDeleteAllDialog: false,
    isCheckbox: false,
    startDate: "",
    endDate: "",
    shouldOpenPatientResultPopup: false,
    PatientResult: null,
    receiverDateFilter: "",
    org: null,
    specimenType: null,
    resultDateSearchFrom: null, 
    resultDateSearchTo: null, 
    timeFormatFrom: null, 
    timeFormatTo: null
  };
  numSelected = 0;
  rowCount = 0;

  handleTextChange = (event) => {
    this.setState({ keyword: event.target.value }, function () { });
  };

  getListPatient() {
    let searchObject = {
      pageIndex: 0,
      pageSize: 100000,
      type: 3,
      patientCodeNotNull: true,
    };
    searchPatient(searchObject).then(({ data }) => {
      this.setState({ listPatient: data.content });
    });
  }

  handleKeyDownEnterSearch = (e) => {
    if (e.key === "Enter") {
      this.search();
    }
  };

  setPage = (page) => {
    this.setState({ page }, function () {
      this.updatePageData();
    });
  };

  setRowsPerPage = (event) => {
    this.setState({ rowsPerPage: event.target.value, page: 0 }, function () {
      this.updatePageData();
    });
  };

  handleChangePage = (event, newPage) => {
    this.setPage(newPage);
  };

  search() {
    this.props.getLoading(true);
    this.setState({ page: 0 }, function () {
      var searchObject = {};

      if (this.state.patient != null && this.state.patient.id != null) {
        searchObject.patientId = this.state.patient.id;
      }
      searchObject.type = 1;
      searchObject.text = this.state.keyword;
      searchObject.pageIndex = this.state.page + 1;
      searchObject.pageSize = this.state.rowsPerPage;
      if(this.state.resultDateSearchFrom){
        searchObject.startDate = this.state.resultDateSearchFrom;
      }
      if(this.state.resultDateSearchTo){
        searchObject.endDate = this.state.resultDateSearchTo;
      }
      if(this.state.timeFormatFrom){
        searchObject.typeDateSearchFrom = this.state.timeFormatFrom.id;
      }
      if(this.state.timeFormatTo){
        searchObject.typeDateSearchTo = this.state.timeFormatTo.id;
      }
      searchByPage(searchObject).then(({ data }) => {
        let itemListClone = [...data.content];
        this.setState({
          itemList: itemListClone,
          totalElements: data.totalElements,
        });
        this.props.getLoading(false);
      });
    });
  }

  updatePageData = () => {
    this.props.getLoading(true);
    var searchObject = {};
    searchObject.text = this.state.keyword;
    searchObject.pageIndex = this.state.page + 1;
    searchObject.pageSize = this.state.rowsPerPage;
    searchObject.type = 1; // NormalVL - người lớn
    searchObject.shippingCardType = "Normal";
    if(this.state.resultDateSearchFrom){
      searchObject.startDate = this.state.resultDateSearchFrom;
    }
    if(this.state.resultDateSearchTo){
      searchObject.endDate = this.state.resultDateSearchTo;
    }
    if(this.state.timeFormatFrom){
      searchObject.typeDateSearchFrom = this.state.timeFormatFrom.id;
    }
    if(this.state.timeFormatTo){
      searchObject.typeDateSearchTo = this.state.timeFormatTo.id;
    }
    if (this.state.org) {
      searchObject.orgId = this.state.org.id;
    }
    if (this.state.specimenType) {
      searchObject.specimenTypeId = this.state.specimenType.id;
    }
    if (this.state.receiverDateFilter) {
      searchObject.receiverDate = this.state.receiverDateFilter;
    }
    searchByPage(searchObject).then(({ data }) => {
      let itemListClone = [...data.content];
      this.setState({
        itemList: itemListClone,
        totalElements: data.totalElements,
      });
      this.props.getLoading(false);
    });
  };

  handleDelete = (id) => {
    this.setState({
      id,
      shouldOpenConfirmationDialog: true,
    });
  };

  handleDownload = () => {
    var blob = new Blob(["Hello, world!"], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, "hello world.txt");
  };

  handleDialogClose = () => {
    this.setState({
      shouldOpenEditorDialog: false,
      shouldOpenConfirmationDialog: false,
      shouldOpenConfirmationDeleteAllDialog: false,
      shouldOpenConfirmDialog: false,
      shouldOpenPatientResultPopup: false,
    });
  };

  handleOKEditClose = () => {
    this.setState({
      shouldOpenEditorDialog: false,
      shouldOpenConfirmationDialog: false,
    });
    this.updatePageData();
  };

  handleConfirmationResponse = () => {
    deleteItem(this.state.id).then(() => {
      this.updatePageData();
      this.handleDialogClose();
      toast.success("Xóa thành công");
    });
  };

  openPatientResultPopup = () => {
    this.setState({
      shouldOpenPatientResultPopup: true,
    });
  };

  handleSelectPatientResult = (PatientResult) => {
    this.setState({
      ...this.state,
      PatientResult: PatientResult,
      shouldOpenPatientResultPopup: false,
    });
    this.updatePageData(PatientResult);
  };

  componentDidMount() {
    this.setState({ selectPatient: false });
    this.updatePageData();
    this.getListPatient();
  }

  handleEditItem = (item) => {
    this.setState({
      item: item,
      shouldOpenEditorDialog: true,
    });
    console.log(item);
  };

  async handleDeleteList(list) {
    for (var i = 0; i < list.length; i++) {
      await deleteItem(list[i].id);
    }
  }

  handleFilter = (option, actions) => {
    this.props.getLoading(true);
    const { t } = this.props;
    const { specimenType, receiverDateFilter, org, timeFormatFrom, timeFormatTo, resultDateSearchFrom, resultDateSearchTo } = option;
    var searchObject = {};
    this.setState({
      page: 0,
      loading: true,
      specimenType: specimenType,
      receiverDateFilter: receiverDateFilter,
      org: org,
      resultDateSearchFrom: resultDateSearchFrom, 
      resultDateSearchTo: resultDateSearchTo, 
      timeFormatFrom: timeFormatFrom, 
      timeFormatTo: timeFormatTo
    });
    if (org) {
      searchObject.orgId = org.id;
    }
    if (specimenType) {
      searchObject.specimenTypeId = specimenType.id;
    }
    if (receiverDateFilter) {
      searchObject.receiverDate = receiverDateFilter;
    }
    if (resultDateSearchFrom && resultDateSearchTo && timeFormatFrom && timeFormatTo) {
      searchObject.startDate = resultDateSearchFrom;
      searchObject.endDate = resultDateSearchTo;
      searchObject.typeDateSearchFrom = timeFormatFrom.id;
      searchObject.typeDateSearchTo = timeFormatTo.id;
    }
    searchObject.belongTo = 1; // mẫu thuộc về Viral Load
    searchObject.pageIndex = this.state.page;
    searchObject.pageSize = this.state.rowsPerPage;
    searchObject.shippingCardType = "Normal";
    searchByPage(searchObject)
      .then(({ data }) => {
        let itemListClone = [...data.content];
        this.setState({
          itemList: itemListClone,
          totalElements: data.totalElements,
        });
        this.props.getLoading(false);
      })
      .catch(() => {
        this.setState({
          itemListClone: [],
          loading: false,
        });
        toast.error(t("general.error"));
        this.props.getLoading(false);
      });
  };

  handleExportExcelResultById = (id, code) => {
    if (id != null) {
      exportExcelResultById(id)
        .then((res) => {
          toast.success(this.props.t("general.successExport"));
          let blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
          });
          saveAs(blob, "XuatPhieu_" + code + ".xlsx");
        })
        .catch(() => { });
    }
  };

  handleDeleteAll = () => {
    //alert(this.data.length);
    this.handleDeleteList(this.data).then(() => {
      this.updatePageData();
      this.handleDialogClose();
    });
  };

  handleClearPatientResult = () => {
    this.setState({ PatientResult: null });

    var searchObject = {};
    searchObject.text = this.state.keyword;
    searchObject.pageIndex = this.state.page + 1;
    searchObject.pageSize = this.state.rowsPerPage;
    searchObject.shippingCardType = "Normal";
    searchByPage(searchObject).then(({ data }) => {
      this.setState({
        itemList: [...data.content],
        totalElements: data.totalElements,
      });
    });
  };

  handleCheckboxChange = () => {
    if (this.state.isCheckbox == true) {
      this.setState({
        PatientResult: null,
      });
      this.setState({ isCheckbox: false });
    }
    if (this.state.isCheckbox == false) {
      this.setState({
        startDate: "",
        endDate: "",
      });
      this.setState({ isCheckbox: true });
    }
  };

  type = (value) => {
    //Khai báo const
    let name = "";
    if (value == 1) {
      name = "NormalVL";
    } else if (value == 2) {
      name = "EID";
    }
    return name;
  };

  status = (value) => {
    let name = "";
    if (value === "HaveResulted") {
      name = "Đo được tải lượng Virus";
    } else if (value == "Undetachable") {
      name = "Không phát hiện";
    }
    return name;
  };

  handleSelectPatient = (event, value) => {
    this.setState({ selectPatient: true });
    this.setState({ patient: value });
    this.search();
  };

  handleCollapseFilter = () => {
    let { checkedFilter } = this.state;
    this.setState({ checkedFilter: !checkedFilter });
  };
  specimenStatusString = (value) => {
    //Khai báo const
    let name = "";
    if (value == 1) {
      name = "Tốt";
    } else if (value == 2) {
      name = "Tán huyết";
    } else if (value == 3) {
      name = "Thiếu thể tích";
    } else if (value == 4) {
      name = "Có máu cục đông";
    } else if (value == 5) {
      name = "Khác";
    }
    return name;
  };
  resultStatus = (value) => {
    //Khai báo const
    let name = "";
    if (value == 1) {
      name = "Âm tính";
    } else if (value == 2) {
      name = "Dương tính";
    } else if (value == 3) {
      name = "Không xác định";
    }
    return name;
  };

  render() {
    const { t, i18n } = this.props;
    let {
      keyword,
      itemList,
      patient,
      page,
      rowsPerPage,
      item,
      shouldOpenConfirmationDialog,
      shouldOpenEditorDialog,
      listPatient,
      isCheckbox,
      shouldOpenPatientResultPopup,
      PatientResult,
      checkedFilter,
    } = this.state;

    let columns = [
      {
        title: t("general.STT"),
        field: "code",
        align: "center",
        width: "60",
        render: (rowData) => page * rowsPerPage + (rowData.tableData.id + 1),
        headerStyle: {
          minWidth: "60px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "60px",
          paddingRight: "35px",
          textAlign: "center",
        },
      },
      // {
      //   title: t("general.action"),
      //   field: "custom",
      //   align: "left",
      //   width: "110",
      //   headerStyle: {
      //     minWidth: "110px",
      //     paddingRight: "0px",
      //     textAlign: "left",
      //   },
      //   cellStyle: {
      //     minWidth: "110px",
      //     paddingRight: "0px",
      //     textAlign: "left",
      //   },

      //   render: (rowData) => (
      //     <MaterialButton
      //       item={rowData}
      //       onSelect={(rowData, method) => {
      //         console.log(rowData);
      //         if (method === 0) {
      //           getOne(rowData.id).then(({ data }) => {
      //             if (data.parent === null) {
      //               data.parent = {};
      //             }
      //             this.setState({
      //               item: data,

      //               shouldOpenEditorDialog: true,
      //             });
      //             console.log("item1" + item);
      //           });
      //         } else if (method === 1) {
      //           this.handleDelete(rowData.id);
      //         } else if (method === 3) {
      //           this.handleExportExcelResultById(
      //             rowData.id,
      //             rowData.specimen?.niheCode
      //           );
      //         } else {
      //           alert("Call Selected Here:" + rowData.id);
      //         }
      //       }}
      //     />
      //   ),
      // },
      {
        title: "Đơn vị gửi mẫu",
        field: "custom",
        align: "left",
        width: "200",
        headerStyle: {
          minWidth: "200px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "200px",
          paddingRight: "0px",
          textAlign: "left",
        },
        render: (rowData) =>
          rowData.org?.name ? <span>{rowData.org?.name}</span> : <></>,
      },
      {
        title: "Số lượng mẫu",
        // field: "specimen.numberOfTests",
        align: "left",
        width: "140",
        headerStyle: {
          minWidth: "140px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "140px",
          paddingRight: "0px",
          textAlign: "left",
        },
        render: (rowData) =>
          rowData.listSpecimen ? (
            <span>{rowData.listSpecimen.length}</span>
          ) : (
            <></>
          ),
      },
      {
        title: "Loại mẫu",
        field: "custom",
        align: "left",
        width: "120",
        headerStyle: {
          minWidth: "120px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "120px",
          paddingRight: "0px",
          textAlign: "left",
        },
        render: (rowData) =>
          rowData.listSpecimen[0] ? (
            <span>{rowData.listSpecimen[0].specimenType.name}</span>
          ) : (
            <></>
          ),
      },
      {
        title: "Tình trạng mẫu",
        field: "custom",
        align: "left",
        width: "150",
        headerStyle: {
          minWidth: "150px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "150px",
          paddingRight: "0px",
          textAlign: "left",
        },
        render: (rowData) =>
          rowData.listSpecimen[0] ? (
            <span>
              {this.specimenStatusString(
                rowData.listSpecimen[0].specimenStatus
              )}
            </span>
          ) : (
            <></>
          ),
        // render: rowData => this.specimenStatusString(rowData.specimenStatus)
      },
      {
        title: "Ngày, giờ nhận mẫu",
        field: "listSpecimen.receiverDate",
        align: "left",
        width: "180",
        headerStyle: {
          minWidth: "180px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "180px",
          paddingRight: "0px",
          textAlign: "left",
        },
        render: (rowData) =>
          rowData.receiverDate ? (
            <span>{moment(rowData.receiverDate).format("DD/MM/YYYY")}</span>
          ) : (
            ""
          ),
      },
      {
        title: "Người nhận mẫu",
        field: "llistSpecimen.receiverBy",
        align: "left",
        width: "160",
        headerStyle: {
          minWidth: "160px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "160px",
          paddingRight: "0px",
          textAlign: "left",
        },
        render: (rowData) =>
          rowData ? <span>{rowData.receiverBy}</span> : <></>,
      },
      // {
      //   title: "Ngày, giờ trả kết quả",
      //   field: "labTestResult.resultDate",
      //   align: "left",
      //   width: "180",
      //   headerStyle: {
      //     minWidth: "180px",
      //     paddingRight: "0px",
      //     textAlign: "left",
      //   },
      //   cellStyle: {
      //     minWidth: "180px",
      //     paddingRight: "0px",
      //     textAlign: "left",
      //   },
      //   render: (rowData) =>
      //     rowData.labTestResult?.resultDate ? (
      //       <span>
      //         {moment(rowData.labTestResult.resultDate).format("DD/MM/YYYY")}
      //       </span>
      //     ) : (
      //       ""
      //     ),
      // },

      {
        title: "Ghi chú",
        field: "specimen.note",
        align: "left",
        width: "120",
        headerStyle: {
          minWidth: "120px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "120px",
          paddingRight: "0px",
          textAlign: "left",
        },
        render: (rowData) => (rowData ? <span>{rowData.note}</span> : <></>),
      },
    ];

    return (
      <div className="m-sm-30">
        <div className="mb-sm-30">
          <Breadcrumb routeSegments={[{ name: t("result.title") }]} />
        </div>
        <Grid container spacing={3}>
          <Grid item xs={12} container spacing={2}>
            <Grid item xs={3} spacing={2}>
              <Autocomplete
                size="small"
                id="combo-box"
                options={listPatient ? listPatient : []}
                className="pl-12"
                getOptionLabel={(option) => option.patientCode}
                onChange={this.handleSelectPatient}
                value={patient}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    size="small"
                    label={"Mã bệnh nhân"}
                  />
                )}
              />
            </Grid>
            <Grid item lg={3} md={3} sm={6} xs={6}>
              <Button
                className="btn_s_right d-inline-flex btn btn-primary-d"
                variant="contained"
                onClick={this.handleCollapseFilter}
                fullWidth
                color="primary"
              >
                <FilterListIcon />
                <span>Bộ lọc xuất File DOC</span>
                <ArrowDropDownIcon
                  style={
                    this.state.checkedFilter == true
                      ? {
                        transform: "rotate(180deg)",
                        transition: ".3s",
                        paddingRight: 5,
                      }
                      : {
                        transform: "rotate(0deg)",
                        transition: ".3s",
                        paddingLeft: 5,
                      }
                  }
                />
              </Button>
            </Grid>
            <Grid item lg={2} md={2} sm={0} xs={0}></Grid>
            <Grid item lg={4} md={4} sm={12} xs={12}>
              <FormControl fullWidth>
                <Input
                  className="mt-10 search_box w-100 stylePlaceholder"
                  type="text"
                  name="keyword"
                  value={keyword}
                  onChange={this.handleTextChange}
                  onKeyDown={this.handleKeyDownEnterSearch}
                  placeholder={t("general.enterSearch")}
                  id="search_box"
                  startAdornment={
                    <InputAdornment>
                      <Link to="#">
                        {" "}
                        <SearchIcon
                          onClick={() => this.search(keyword)}
                          style={{
                            position: "absolute",
                            top: "0",
                            right: "0",
                          }}
                        />
                      </Link>
                    </InputAdornment>
                  }
                />
              </FormControl>
            </Grid>
            <Grid item md={12} sm={12} xs={12}>
              <Collapse
                in={checkedFilter}
                style={{
                  width: "100%",
                }}
              >
                <PatientResultHivFilter
                  handleFilter={this.handleFilter}
                  t={t}
                />
              </Collapse>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <div>
              {shouldOpenPatientResultPopup && (
                <PatientResultHivPopup
                  t={t}
                  i18n={i18n}
                  handleSelect={this.handleSelectPatientResult}
                  handleClose={this.handleDialogClose}
                  open={shouldOpenPatientResultPopup}
                  handleOKEditClose={this.handleOKEditClose}
                  item={this.state.item ? this.state.item : {}}
                />
              )}
              {shouldOpenEditorDialog && (
                <ResultDialog
                  t={t}
                  i18n={i18n}
                  handleClose={this.handleDialogClose}
                  open={shouldOpenEditorDialog}
                  handleOKEditClose={this.handleOKEditClose}
                  item={this.state.item ? this.state.item : {}}
                />
              )}

              {shouldOpenConfirmationDialog && (
                <ConfirmationDialog
                  title={t("general.confirm")}
                  open={shouldOpenConfirmationDialog}
                  onConfirmDialogClose={this.handleDialogClose}
                  onYesClick={this.handleConfirmationResponse}
                  text={t("general.DeleteConfirm")}
                  Yes={t("general.Yes")}
                  No={t("general.No")}
                />
              )}
            </div>
            <MaterialTable
              title={t("")}
              data={itemList}
              columns={columns}
              // parentChildData={(row, rows) => rows.find(a => a.id === row.parentId)}
              parentChildData={(row, rows) => {
                var list = rows.find((a) => a.id === row.parentId);
                return list;
              }}
              options={{
                selection: true,
                actionsColumnIndex: -1,
                paging: false,
                search: false,
                rowStyle: (rowData, index) => ({
                  backgroundColor: index % 2 === 1 ? "#EEE" : "#FFF",
                }),
                maxBodyHeight: "450px",
                minBodyHeight: "370px",
                headerStyle: {
                  backgroundColor: "#358600",
                  color: "#fff",
                },
                padding: "dense",
                toolbar: false,
              }}
              components={{
                Toolbar: (props) => <MTableToolbar {...props} />,
              }}
              onSelectionChange={(rows) => {
                this.data = rows;
                // this.setState({selectedItems:rows});
              }}
              actions={[
                {
                  tooltip: "Remove All Selected Users",
                  icon: "delete",
                  onClick: (evt, data) => {
                    this.handleDeleteAll(data);
                    alert("You want to delete " + data.length + " rows");
                  },
                },
              ]}
            />
            <TablePagination
              align="left"
              className="px-16"
              rowsPerPageOptions={[1, 2, 5, 10, 25, 50, 100]}
              component="div"
              labelRowsPerPage={t("general.rows_per_page")}
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} ${t("general.of")} ${count !== -1 ? count : `more than ${to}`
                }`
              }
              count={this.state.totalElements}
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
          </Grid>
        </Grid>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  loading: state.loading.loading,
});

const mapDispatch = {
  getLoading,
};
export default connect(mapStateToProps, mapDispatch)(Result);

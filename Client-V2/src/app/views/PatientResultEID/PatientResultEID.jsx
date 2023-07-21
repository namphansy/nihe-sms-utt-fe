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
  InputLabel,
  Select,
  MenuItem,
  Collapse,
} from "@material-ui/core";
import MaterialTable, {
  MTableToolbar,
  Chip,
  MTableBody,
  MTableHeader,
} from "material-table";
import {
  deleteItem,
  searchByPage,
  getOne,
  exportExcel,
  exportExcelResultById,
} from "./PatientResultEIDService";
import { searchByPage as searchLabTest } from "../SampleList/SampleListService";
import ResultDialog from "./PatientResultEIDDialog";
import Autocomplete from "@material-ui/lab/Autocomplete";
import AsynchronousAutocomplete from "../utilities/AsynchronousAutocomplete";
import { Breadcrumb, ConfirmationDialog } from "egret";
import { useTranslation, withTranslation, Trans } from "react-i18next";
import SearchIcon from "@material-ui/icons/Search";
import { searchReagent } from "../ReagentCode/ReagentCodeService";
import { searchInternalTest } from "../InternalTest/InternalTestService";
import { searchByPage as searchSpecimen } from "../Specimen/SpecimenService";
import { searchByPage as searchPatient } from "../Patient/PatientServices";
import {
  exportEIDByRC,
  exportExcelEIDById,
  exportEIDByIT,
} from "../ResultEID/ResultEIDService";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import moment from "moment";
import { connect } from "react-redux";
import { getLoading } from "../../redux/actions/LoadingActions";
import PatientResultEIDFilter from "./PatientResultEIDFillter";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import FilterListIcon from "@material-ui/icons/FilterList";
import { searchByPage as searchByShippingCard } from "../ShippingCard/ShippingCardService";

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
      {/* <IconButton size="small" onClick={() => props.onSelect(item, 3)}>
      <Icon fontSize="small" color="error">
        print
      </Icon>
    </IconButton> */}
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
  getListReagentCode() {
    let searchObject = { pageIndex: 0, pageSize: 100000 };
    searchReagent(searchObject).then(({ data }) => {
      this.setState({ listReagentCode: data.content });
    });
  }
  getListInternalTest() {
    let searchObject = { pageIndex: 0, pageSize: 100000 };
    searchInternalTest(searchObject).then(({ data }) => {
      this.setState({ listInternalTest: data.content });
    });
  }
  getListSpecimen() {
    let searchObject = { pageIndex: 0, pageSize: 100000, type: 1 };
    searchSpecimen(searchObject).then(({ data }) => {
      this.setState({ listSpecimen: data.content });
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
      if (this.state.specimen != null && this.state.specimen.id != null) {
        searchObject.niheCode = this.state.specimen.niheCode;
      }
      searchObject.type = 2;
      searchObject.text = this.state.keyword;
      searchObject.pageIndex = this.state.page + 1;
      searchObject.pageSize = this.state.rowsPerPage;
      searchObject.shippingCardType = "Children";
      if (this.state.resultDateSearchFrom) {
        searchObject.startDate = this.state.resultDateSearchFrom;
      }
      if (this.state.resultDateSearchTo) {
        searchObject.endDate = this.state.resultDateSearchTo;
      }
      if (this.state.timeFormatFrom) {
        searchObject.typeDateSearchFrom = this.state.timeFormatFrom.id;
      }
      if (this.state.timeFormatTo) {
        searchObject.typeDateSearchTo = this.state.timeFormatTo.id;
      }

      searchByShippingCard(searchObject).then(({ data }) => {
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
    searchObject.type = 2;
    searchObject.pageIndex = this.state.page + 1;
    searchObject.pageSize = this.state.rowsPerPage;
    searchObject.shippingCardType = "Children";
    if (this.state.resultDateSearchFrom) {
      searchObject.startDate = this.state.resultDateSearchFrom;
    }
    if (this.state.resultDateSearchTo) {
      searchObject.endDate = this.state.resultDateSearchTo;
    }
    if (this.state.timeFormatFrom) {
      searchObject.typeDateSearchFrom = this.state.timeFormatFrom.id;
    }
    if (this.state.timeFormatTo) {
      searchObject.typeDateSearchTo = this.state.timeFormatTo.id;
    }
    searchByShippingCard(searchObject).then(({ data }) => {
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
    });
  };

  handleCollapseFilter = () => {
    let { checkedFilter } = this.state;
    this.setState({ checkedFilter: !checkedFilter });
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

  componentDidMount() {
    this.setState({ selectPatient: false });
    this.updatePageData();
    this.getListSpecimen();
    this.getListReagentCode();
    this.getListInternalTest();
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
        .catch((err) => { });
    }
  };

  handleExportExcel = () => {
    this.setState({ isLoading: true });
    this.setState({ isExportResultVoucher: false });
    if (!this.state.reagentCode) {
      this.setState({ isLoading: false });
      toast.error("Không để trống điều kiện");
    } else {
      let searchObject = {
        pageIndex: 0,
        pageSize: 1000000,
        reagentCode: this.state.reagentCode,
        type: 2,
      };
      exportEIDByRC(searchObject).then((result) => {
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          "Kiem soat chat luong" + " " + this.state.reagentCode.code + ".xlsx"
        );
        document.body.appendChild(link);
        link.click();
        this.setState({ isLoading: false });
        toast.success(this.props.t("general.successExport"));
      });
    }
  };

  handleExportExcelByInternalTest = () => {
    this.setState({ isExportResultVoucher: false });
    if (!this.state.internalTest) {
      toast.error("Không để trống điều kiện");
    } else {
      let searchObject = {
        pageIndex: 0,
        pageSize: 1000000,
        internalTest: this.state.internalTest,
        type: 2,
      };
      exportEIDByIT(searchObject).then((result) => {
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          "THEO DOI MAU NOI KIEM" + " " + this.state.internalTest.code + ".xlsx"
        );
        document.body.appendChild(link);
        link.click();
        toast.success(this.props.t("general.successExport"));
      });
    }
  };

  handleDeleteAll = (event) => {
    //alert(this.data.length);
    this.handleDeleteList(this.data).then(() => {
      this.updatePageData();
      this.handleDialogClose();
    });
  };

  handleFilter = (option, actions) => {
    this.props.getLoading(true);
    const { t } = this.props;
    const { timeFormatFrom, timeFormatTo, resultDateSearchFrom, resultDateSearchTo } = option;
    var searchObject = {};
    this.setState({ page: 0, loading: true, resultDateSearchFrom: resultDateSearchFrom, resultDateSearchTo: resultDateSearchTo, timeFormatFrom: timeFormatFrom, timeFormatTo: timeFormatTo });

    searchObject.pageIndex = this.state.page;
    searchObject.type = 2;
    searchObject.pageSize = this.state.rowsPerPage;
    searchObject.shippingCardType = "Children";
    if (resultDateSearchFrom) {
      searchObject.startDate = resultDateSearchFrom;
    }
    if (resultDateSearchTo) {
      searchObject.endDate = resultDateSearchTo;
    }
    if (timeFormatFrom) {
      searchObject.typeDateSearchFrom = timeFormatFrom.id;
    }
    if (timeFormatTo) {
      searchObject.typeDateSearchTo = timeFormatTo.id;
    }


    searchByShippingCard(searchObject)
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

  handleSelectSpecimen = (event, value) => {
    this.setState({ selectPatient: true });
    this.setState({ specimen: value });
    this.search();
  };
  handleSelectReagentCode = (event, value) => {
    this.setState({ reagentCode: value });
  };
  handleSelectInternalTest = (event, value) => {
    this.setState({ internalTest: value });
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

  render() {
    const { t, i18n } = this.props;
    let {
      keyword,
      rowsPerPage,
      page,
      itemList,
      reagentCode,
      internalTest,
      isLoading,
      specimen,
      item,
      listSpecimen,
      shouldOpenConfirmationDialog,
      listReagentCode,
      listInternalTest,
      shouldOpenEditorDialog,
      listLabTestResult,
      shouldOpenConfirmationDeleteAllDialog,
      checkedFilter,
    } = this.state;
    let searchObject = { pageIndex: 0, pageSize: 1000000 };

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
      //   width: "250",

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
        field: "specimen.niheCode",
        align: "left",
        width: "100",
        render: (rowData) =>
          rowData.org?.name ? <span>{rowData.org?.name}</span> : <></>,
      },
      {
        title: "Số lượng mẫu",
        // field: "specimen.numberOfTests",
        align: "left",
        width: "140px",
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
      }
    ];

    return (
      <div className="m-sm-30">
        <div className="mb-sm-30">
          <Breadcrumb routeSegments={[{ name: t("result.title") }]} />
        </div>

        <Grid container>
          <Grid item lg={3} md={3} sm={12} xs={12}>
            <Button
              className="btn_s_right d-inline-flex btn btn-primary-d"
              variant="contained"
              onClick={this.handleCollapseFilter}
              fullWidth
              color="primary"
            >
              <FilterListIcon />
              <span>Bộ lọc xuất Excel</span>
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
          <Grid item lg={5} md={5} sm={0} xs={0}></Grid>

          <Grid item lg={4} md={4} sm={6} xs={6}>
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

          <Grid item md={12} sm={12} xs={12} className="mt-12">
            <Collapse
              in={checkedFilter}
              style={{
                width: "100%",
              }}
            >
              <PatientResultEIDFilter handleFilter={this.handleFilter} t={t} />
            </Collapse>
          </Grid>

          <Grid item xs={12} container className="mt-12">
            <Grid item xs={12} md={8} lg={8} container>
              <Grid md={3} sm={4} xs={6} style={{ paddingRight: 10 }}>
                <Autocomplete
                  size="small"
                  id="combo-box"
                  options={listSpecimen ? listSpecimen : []}
                  className="flex-end"
                  getOptionLabel={(option) =>
                    option.niheCode ? option.niheCode.toString() : ""
                  }
                  onChange={this.handleSelectSpecimen}
                  value={specimen}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      size="small"
                      label={t("Mã nihe")}
                    />
                  )}
                />
              </Grid>
              <Grid item md={3} sm={4} xs={6} style={{ paddingRight: 10 }}>
                <Autocomplete
                  size="small"
                  id="combo-box"
                  className="flex-end"
                  options={listReagentCode ? listReagentCode : []}
                  getOptionLabel={(option) => option.code}
                  onChange={this.handleSelectReagentCode}
                  value={reagentCode}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label={t("Số lô")}
                      variant="outlined"
                    />
                  )}
                />
              </Grid>

              <Grid md={5} sm={5} xs={5}>
                <Button
                  className="mb-16 align-bottom"
                  variant="contained"
                  color="primary"
                  onClick={this.handleExportExcel}
                >
                  {"Xuất Sổ theo dõi KS chất lượng"}
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item lg={12} md={12} sm={12} xs={12} container>
            <Grid item md={2} sm={4} xs={6} style={{ paddingRight: 10 }}>
              <Autocomplete
                size="small"
                id="combo-box"
                className="flex-end"
                options={listInternalTest ? listInternalTest : []}
                getOptionLabel={(option) => option.code}
                onChange={this.handleSelectInternalTest}
                value={internalTest}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label={t("Mẫu nội kiểm")}
                    variant="outlined"
                  />
                )}
              />
            </Grid>

            <Grid md={5} sm={5} xs={5}>
              <Button
                className="mb-16 align-bottom"
                variant="contained"
                color="primary"
                onClick={this.handleExportExcelByInternalTest}
              >
                {"Xuất Sổ theo dõi Mẫu nội kiểm"}
              </Button>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <div>
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
              isLoading={this.state.isLoading}
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

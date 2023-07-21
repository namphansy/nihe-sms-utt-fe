import DateFnsUtils from "@date-io/date-fns";
import {
  Button,
  FormControl,
  Grid,
  Icon,
  IconButton,
  Input,
  InputAdornment,
  Link,
  TablePagination,
  TextField,
} from "@material-ui/core";
import ClearIcon from "@material-ui/icons/Clear";
import SearchIcon from "@material-ui/icons/Search";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import { Breadcrumb, ConfirmationDialog } from "egret";
import { saveAs } from "file-saver";
import MaterialTable, { MTableToolbar } from "material-table";
import moment from "moment";
import React, { Component } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { searchReagent } from "../ReagentCode/ReagentCodeService";
import { searchByPage as searchLabTest } from "../SampleList/SampleListService";
import ResultDialog from "./ResultEIDDialog";
import {
  deleteItem,
  exportEIDByRC,
  exportExcelEIDById,
  getOne,
  searchByPage,
} from "./ResultEIDService";
import { connect } from "react-redux";
import { getLoading } from "../../redux/actions/LoadingActions";

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
      <IconButton size="small" onClick={() => props.onSelect(item, 3)}>
        <Icon fontSize="small" color="error">
          print
        </Icon>
      </IconButton>
    </div>
  );
}

class Result extends Component {
  state = {
    keyword: "",
    resultMonthSearch: "",
    rowsPerPage: 10,
    page: 0,
    item: {},
    shouldOpenEditorDialog: false,
    shouldOpenConfirmationDialog: false,
    shouldOpenConfirmDialog: false,
    selectAllItem: false,
    selectedList: [],
    totalElements: 0,
    selectLabTest: false,
    shouldOpenConfirmationDeleteAllDialog: false,
  };
  numSelected = 0;
  rowCount = 0;

  handleTextChange = (event) => {
    this.setState({ keyword: event.target.value }, function () {});
  };

  getListLabTest() {
    let searchObject = { pageIndex: 0, pageSize: 100000 };
    searchLabTest(searchObject).then(({ data }) => {
      this.setState({ listLabTestResult: data.content });
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
      searchObject.resultMonth = this.state.resultMonthSearch;
      searchObject.type = 2; // EID
      searchObject.text = this.state.keyword;
      searchObject.pageIndex = this.state.page + 1;
      searchObject.pageSize = this.state.rowsPerPage;

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
    searchObject.type = 2; // EID
    searchObject.pageIndex = this.state.page + 1;
    searchObject.pageSize = this.state.rowsPerPage;
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

  handleExportExcel = () => {
    this.setState({ isExportResultVoucher: false });
    if (!this.state.reagentCode) {
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
        link.setAttribute("download", "KQXN nhanh" + ".xlsx");
        document.body.appendChild(link);
        link.click();
        toast.success(this.props.t("general.successExport"));
      });
    }
  };

  handleSelectReagentCode = (event, value) => {
    this.setState({ reagentCode: value });
  };

  getListReagentCode() {
    let searchObject = { pageIndex: 0, pageSize: 100000 };
    searchReagent(searchObject).then(({ data }) => {
      this.setState({ listReagentCode: data.content });
    });
  }

  componentDidMount() {
    this.setState({ selectLabTest: false });
    this.updatePageData();
    this.getListLabTest();
    this.getListReagentCode();
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

  handleDateChange = (value, source) => {
    // debugger"
    if (source === "resultMonthSearch") {
      this.state.resultMonthSearch = value;
      this.setState({ resultMonthSearch: value });
    }
    if (source === "clear") {
      this.state.resultMonthSearch = null;
      this.setState({ resultMonthSearch: null });
    }

    this.search();
  };

  handleDeleteAll = (event) => {
    this.handleDeleteList(this.data).then(() => {
      this.updatePageData();
      this.handleDialogClose();
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

  finalResult = (value) => {
    //Khai báo const
    let name = "";
    if (value == null) {
      name = "";
    } else if (value == 1) {
      name = "Dương tính";
    } else if (value == 2) {
      name = "Âm tính";
    } else if (value == 3) {
      name = "Không xác định";
    } else if (value == 4) {
      name = "Khác";
    }
    return name;
  };

  handleSelectLabTest = (event, value) => {
    this.setState({ selectLabTest: true });
    this.setState({ labTest: value });
  };
  exportExcelEIDById = (id, code) => {
    if (id != null) {
      exportExcelEIDById(id)
        .then((res) => {
          toast.success(this.props.t("general.successExport"));
          let blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
          });
          saveAs(blob, "XuatPhieuEID_" + code + ".xlsx");
        })
        .catch(() => {});
    }
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
      rowsPerPage,
      page,
      itemList,
      labTest,
      item,
      reagentCode,
      resultMonthSearch,
      listReagentCode,
      shouldOpenConfirmationDialog,
      shouldOpenEditorDialog,
      listLabTestResult,
      shouldOpenConfirmationDeleteAllDialog,
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
      {
        title: t("general.action"),
        field: "custom",
        align: "left",
        width: "250",

        render: (rowData) => (
          <MaterialButton
            item={rowData}
            onSelect={(rowData, method) => {
              console.log(rowData);
              if (method === 0) {
                getOne(rowData.id).then(({ data }) => {
                  if (data.parent === null) {
                    data.parent = {};
                  }
                  this.setState({
                    item: data,

                    shouldOpenEditorDialog: true,
                  });
                  console.log("item1" + item);
                });
              } else if (method === 1) {
                this.handleDelete(rowData.id);
                // deleteItem(rowData.id);
              } else if (method === 3) {
                this.exportExcelEIDById(rowData.id, rowData.specimen?.niheCode);
              } else {
                alert("Call Selected Here:" + rowData.id);
              }
            }}
          />
        ),
      },
      {
        title: t("specimen.code"),
        field: "specimen.niheCode",
        align: "left",
        width: "100",
      },
      {
        title: t("result.code"),
        field: "testCode",
        align: "left",
        width: "100",
      },
      // {
      //   title: t("Tình trạng đo"), field: "status", align: "left", width: "100",
      //   render: (rowData) => this.status(rowData.status)
      // },
      {
        title: t("Kết quả (cp/ml)"),
        field: "labResult",
        align: "left",
        width: "100",
      },
      {
        title: t("result.date"),
        field: "resultDate",
        align: "left",
        width: "100",
        render: (rowData) =>
          rowData.resultDate ? (
            <span>{moment(rowData.resultDate).format("DD/MM/YYYY")}</span>
          ) : (
            ""
          ),
      },
      {
        title: t("result.status"),
        field: "resultStatus",
        align: "left",
        width: "100",
        render: (rowData) => this.resultStatus(rowData.resultStatus),
      },
      // { title: t("result.times"), field: "times", align: "left", width: "100" },
      {
        title: t("result.type"),
        field: "type",
        align: "left",
        width: "100",
        render: (rowData) => this.type(rowData.type),
      },
      {
        title: t("Đơn vị gửi mẫu"),
        field: "specimen.org.name",
        align: "left",
        width: "100",
      },
      {
        title: "Ngày nhận mẫu",
        field: "receiverDate",
        align: "left",
        width: "100",
        render: (rowData) =>
          rowData.specimen.receiverDate ? (
            <span>
              {moment(rowData.specimen.receiverDate).format("DD/MM/YYYY")}
            </span>
          ) : (
            ""
          ),
      },
      {
        title: "Ngày xét nghiệm",
        field: "testDate",
        align: "left",
        width: "100",
        render: (rowData) =>
          rowData.labTestResult.testDate ? (
            <span>
              {moment(rowData.labTestResult.testDate).format("DD/MM/YYYY")}
            </span>
          ) : (
            ""
          ),
      },
      {
        title: "Kết quả cuối cùng",
        field: "finalResult",
        align: "left",
        width: "100",
        render: (rowData) => this.finalResult(rowData.finalResult),
      },
    ];

    return (
      <div className="m-sm-30">
        <div className="mb-sm-30">
          <Breadcrumb
            routeSegments={[{ name: t("Dashboard.testResult.eid") }]}
          />
        </div>

        <Grid container>
          <Grid item xs={12} container spacing={2}>
            <Grid item xs={8} container>
              <Grid md={4} sm={4} xs={4} style={{ paddingRight: 10 }}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    autoOk={true}
                    disableFuture={true}
                    size="small"
                    id="date-picker-dialog"
                    views={["year", "month"]}
                    format="MM/yyyy"
                    label={<span>Tháng và năm cần tìm</span>}
                    inputVariant="outlined"
                    value={resultMonthSearch ? resultMonthSearch : null}
                    onChange={(value) =>
                      this.handleDateChange(value, "resultMonthSearch")
                    }
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          style={{ padding: 0 }}
                          onClick={(value) =>
                            this.handleDateChange(value, "clear")
                          }
                        >
                          <ClearIcon />
                        </IconButton>
                      ),
                    }}
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                    }}
                    InputAdornmentProps={{
                      position: "start",
                    }}
                  />
                </MuiPickersUtilsProvider>
              </Grid>

              {/* <Grid item md={3} sm={4} xs={4} style={{paddingRight: 10}}>
                <Autocomplete
                  size="small"
                  id="combo-box"
                  className="flex-end"
                  options={listReagentCode ? listReagentCode : []}
                  getOptionLabel={option => option.code}
                  onChange={this.handleSelectReagentCode}
                  value={reagentCode}
                  renderInput={params => (
                    <TextField
                      {...params}
                      size="small"
                      label={t("Số lô")}
                      variant="outlined"
                    />
                  )}
                />
              </Grid>

              <Grid md={2} sm={4} xs={4}>
                <Button
                  className="mb-16 align-bottom"
                  variant="contained"
                  color="primary"
                  onClick={this.handleExportExcel}
                >
                  {"Xuất excel"}
                </Button>
              </Grid> */}
            </Grid>

            <Grid
              item
              lg={4}
              md={4}
              sm={6}
              xs={12}
              style={{ paddingBottom: 20 }}
            >
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
                  title={t("general.confirm")}
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
                `${from}-${to} ${t("general.of")} ${
                  count !== -1 ? count : `more than ${to}`
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

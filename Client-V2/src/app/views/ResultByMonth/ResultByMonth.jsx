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
} from "./ResultByMonthService";
import { searchByPage as searchLabTest } from "../SampleList/SampleListService";
import ResultDialog from "./ResultByMonthDialog";
import Autocomplete from "@material-ui/lab/Autocomplete";
import AsynchronousAutocomplete from "../utilities/AsynchronousAutocomplete";
import { Breadcrumb, ConfirmationDialog } from "egret";
import { useTranslation, withTranslation, Trans } from "react-i18next";
import SearchIcon from "@material-ui/icons/Search";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import DateFnsUtils from "@date-io/date-fns";
import ClearIcon from "@material-ui/icons/Clear";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import moment from "moment";
import { connect } from "react-redux";
import { getLoading } from "../../redux/actions/LoadingActions";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import FilterListIcon from "@material-ui/icons/FilterList";
import ResultByMonthFillter from "./ResultByMonthFillter";

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
      {/* <IconButton size="small" onClick={() => props.onSelect(item, 1)}>
      <Icon fontSize="small" color="error">delete</Icon>
    </IconButton> */}
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
    resultMonthSearch: "",
    resultType: null,
  };
  numSelected = 0;
  rowCount = 0;

  handleTextChange = (event) => {
    this.setState({ keyword: event.target.value }, function () { });
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

  handleCollapseFilter = () => {
    let { checkedFilter } = this.state;
    this.setState({ checkedFilter: !checkedFilter });
  };

  handleFilter = (option, actions) => {
    this.props.getLoading(true);
    const { t } = this.props;
    const { resultMonthSearch, resultType } = option;
    var searchObject = {};
    this.setState({ page: 0, loading: true,  resultMonthSearch: resultMonthSearch, resultType: resultType});
    if (resultType) {
      searchObject.type = resultType.type;
    }
    if(resultMonthSearch){
      searchObject.resultMonth = resultMonthSearch;
    }
    searchObject.belongTo = 1; // mẫu thuộc về Viral Load
    searchObject.pageIndex = this.state.page + 1;
    searchObject.pageSize = this.state.rowsPerPage;
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
      searchObject.text = this.state.keyword;
      searchObject.pageIndex = this.state.page + 1;
      searchObject.pageSize = this.state.rowsPerPage;
      if (this.state.resultType) {
        searchObject.type = this.state.resultType.type;
      }
      if(this.state.resultMonthSearch){
        searchObject.resultMonth = this.state.resultMonthSearch;
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
    if (this.state.resultType) {
      searchObject.type = this.state.resultType.type;
    }
    if(this.state.resultMonthSearch){
      searchObject.resultMonth = this.state.resultMonthSearch;
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

  componentDidMount() {
    this.setState({ selectLabTest: false });
    this.updatePageData();
    this.getListLabTest();
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
    //alert(this.data.length);
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

  handleSelectLabTest = (event, value) => {
    this.setState({ selectLabTest: true });
    this.setState({ labTest: value });
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
      resultMonthSearch,
      shouldOpenConfirmationDialog,
      shouldOpenEditorDialog,
      listLabTestResult,
      checkedFilter,
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
        width: "100",
        headerStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          textAlign: "left",
        },
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
        align: "center",
        width: "150",
        headerStyle: {
          minWidth: "150px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "150px",
          textAlign: "center",
        },
      },
      {
        title: t("Đơn vị"),
        field: "specimen.org.name",
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
      },
      {
        title: t("result.code"),
        field: "testCode",
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
      },
      // {
      //   title: t("Tình trạng đo"), field: "status", align: "left", width: "100",
      //   render: (rowData) => this.status(rowData.status)
      // },
      {
        title: t("Kết quả (cp/ml)"),
        field: "labResult",
        align: "left",
        width: "170",
        headerStyle: {
          minWidth: "170px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "170px",
          textAlign: "left",
        },
      },
      {
        title: t("Ngày nhận mẫu"),
        field: "receiverDate",
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
          rowData.specimen?.receiverDate ? (
            <span>
              {moment(rowData.specimen?.receiverDate).format("DD/MM/YYYY")}
            </span>
          ) : (
            ""
          ),
      },
      {
        title: "Ngày xét nghiệm",
        field: "testDate",
        align: "left",
        width: "170",
        headerStyle: {
          minWidth: "170px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "170px",
          paddingRight: "0px",
          textAlign: "left",
        },
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
        title: t("resul t.date"),
        field: "resultDate",
        align: "left",
        width: "170",
        headerStyle: {
          minWidth: "170px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "170px",
          paddingRight: "0px",
          textAlign: "left",
        },
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
        width: "180",
        headerStyle: {
          minWidth: "180px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "180px",
          textAlign: "left",
        },
        render: (rowData) => this.resultStatus(rowData.resultStatus),
      },
      // { title: t("result.times"), field: "times", align: "left", width: "100" },
      {
        title: t("result.type"),
        field: "type",
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
        render: (rowData) => this.type(rowData.type),
      },
      {
        title: "Kết quả cuối cùng",
        field: "finalResult",
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
        render: (rowData) => this.finalResult(rowData.finalResult),
      },
    ];

    return (
      <div className="m-sm-30">
        <div className="mb-sm-30">
          <Breadcrumb
            routeSegments={[{ name: t("Dashboard.testResult.byMonth") }]}
          />
        </div>

        <Grid container spacing={3}>
          <Grid item xs={12} container spacing={2}>
            {/* <Grid md={3} sm={3}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  autoOk={true}
                  disableFuture={true}
                  size="small"
                  className="w-100"
                  margin="none"
                  id="date-picker-dialog"
                  clearable
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
            </Grid> */}

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
                <ResultByMonthFillter handleFilter={this.handleFilter} t={t} />
              </Collapse>
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

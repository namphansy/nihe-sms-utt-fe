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
  Collapse,
} from "@material-ui/core";
import ClearIcon from "@material-ui/icons/Clear";
import SearchIcon from "@material-ui/icons/Search";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import { set } from "date-fns";
import { Breadcrumb, ConfirmationDialog } from "egret";
import { saveAs } from "file-saver";
import MaterialTable, { MTableToolbar } from "material-table";
import moment from "moment";
import React, { Component } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { searchReagent } from "../ReagentCode/ReagentCodeService";
import { sentSms, searchByPage } from "./ResultSmsService";
import { searchByPage as searchSmsLog } from "../SmsLog/SmsLogService";
import ResultSmsFilter from "./ResultSmsFilter";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import FilterListIcon from "@material-ui/icons/FilterList";
import LoadingOverlay from "react-loading-overlay";
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
      {/* <IconButton size="small" onClick={() => props.onSelect(item, 0)}>
      <Icon fontSize="small" color="primary">edit</Icon>
    </IconButton> */}
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
    resultMonthSearch: "",
    rowsPerPage: 10,
    page: 0,
    item: {},
    shouldOpenEditorDialog: false,
    shouldOpenConfirmationDialog: false,
    shouldOpenConfirmDialog: false,
    selectAllItem: false,
    selectedList: [],
    itemListSmsLog: [],
    totalElements: 0,
    selectLabTest: false,
    shouldOpenConfirmationSentAllDialog: false,
    loading: false,
    orgId: null,
    receiverDate: null,
  };
  numSelected = 0;
  rowCount = 0;

  handleTextChange = (event) => {
    this.setState({ keyword: event.target.value }, function () {});
  };

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

  searchFilter(searchObject) {
    this.props.getLoading(true);
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
        });
        toast.error("Đã xảy ra lỗi khi tìm kiếm");
        this.props.getLoading(false);
      });
  }

  search() {
    this.setState({ page: 0 }, function () {
      var searchObject = {};
      searchObject.resultMonth = this.state.resultMonthSearch;
      searchObject.text = this.state.keyword;
      searchObject.pageIndex = this.state.page + 1;
      searchObject.pageSize = this.state.rowsPerPage;
      searchObject.receiverDate = this.state.receiverDate;
      searchObject.orgId = this.state.orgId;

      searchByPage(searchObject).then(({ data }) => {
        let itemListClone = [...data.content];
        this.setState({
          itemList: itemListClone,
          totalElements: data.totalElements,
        });
      });
    });
  }

  updatePageData = () => {
    this.props.getLoading(true);
    var searchObject = {};
    searchObject.text = this.state.keyword;
    searchObject.pageIndex = this.state.page + 1;
    searchObject.pageSize = this.state.rowsPerPage;
    searchObject.receiverDate = this.state.receiverDate;
    searchObject.orgId = this.state.orgId;

    searchByPage(searchObject).then(({ data }) => {
      let itemListClone = [...data.content];
      this.setState(
        {
          itemList: itemListClone,
          totalElements: data.totalElements,
        },
        () => {
          this.props.getLoading(false);
        }
      );
    });

    let searchObjectLog = {};
    searchObjectLog.pageIndex = 1;
    searchObjectLog.pageSize = 1000000000;
    searchObjectLog.searchCompareResult = true;

    searchSmsLog(searchObjectLog).then(({ data }) => {
      this.props.getLoading(true);
      let list = [...data.content];
      this.setState(
        {
          itemListSmsLog: list,
        },
        () => {
          this.props.getLoading(false);
        }
      );
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
      shouldOpenConfirmationSentAllDialog: false,
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
    this.setState({ loading: true });
    this.handleDialogClose();
    sentSms(this.state.id)
      .then(() => {
        this.updatePageData();
        this.setState({ loading: false });
        toast.success("Gửi thành công");
      })
      .catch(() => {
        toast.error("Vui lòng kiểm tra lại số điện thoại hoặc đơn vị lấy mẫu");
      });
  };

  handleSelectReagentCode = (event, value) => {
    this.setState({ reagentCode: value });
  };

  componentDidMount() {
    this.setState({ selectLabTest: false });
    this.updatePageData();
  }

  handleEditItem = (item) => {
    this.setState({
      item: item,
      shouldOpenEditorDialog: true,
    });
    console.log(item);
  };

  handleSentList(selectedList) {
    this.props.getLoading(true);
    sentSms(selectedList)
      .then(() => {
        this.updatePageData();
        // toast.success("Gửi thành công");
        this.props.getLoading(false);
      })
      .catch(() => {
        toast.error("Vui lòng kiểm tra lại số điện thoại hoặc đơn vị lấy mẫu");
        this.props.getLoading(false);
      })
      .then((data) => {
        toast.success("Quá trình hoàn tất");
        this.props.getLoading(false);
      })
      .catch((reason) => {
        console.log(reason);
        if (reason.response?.status !== 200) {
          toast.error("Có lỗi xảy ra khi gửi tin nhắn!");
          console.log(reason.response?.status);
        } else {
          toast.error("Có lỗi xảy ra khi gửi tin nhắn!");
        }
        console.log(reason.message);
        this.props.getLoading(false);
      });
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

  handleSentAll = (event) => {
    let i = this.data?.length;
    let check = true;
    this.handleDialogClose();
    if (i > 0) {
      this.handleSentList(this.data);
      check = false;
    }

    if ((this.state.orgId || this.state.receiverDate) && check) {
      this.getListToSendSMSByFilter().then((data) => {
        this.handleSentList(data);
      });
    } else if (check) {
      toast.warning("Không có bản ghi nào");
      this.handleDialogClose();
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

  handleSelectLabTest = (event, value) => {
    this.setState({ selectLabTest: true });
    this.setState({ labTest: value });
  };

  gender = (value) => {
    //Khai báo const
    let name = "";
    if (value == "F") {
      name = "Nữ";
    } else if (value == "M") {
      name = "Nam";
    }
    return name;
  };

  status = (id) => {
    const itemIndex = this.state.itemListSmsLog.findIndex(
      (item) => id == item.result?.id
    );

    if (itemIndex != -1) {
      if (this.state.itemListSmsLog[itemIndex].errorCode) {
        return (
          <small
            className="border-radius-4 px-8 py-2 "
            style={{ backgroundColor: "#FF0000", color: "#ffffff" }}
          >
            {"Có lỗi"}
          </small>
        );
      } else if (!this.state.itemListSmsLog[itemIndex].errorCode) {
        return (
          <small
            className="border-radius-4 text-black px-8 py-2 "
            style={{ backgroundColor: "#83ef84" }}
          >
            {"Không có lỗi"}
          </small>
        );
      }
    } else {
      return (
        <small
          className="border-radius-4 px-8 py-2 "
          style={{ backgroundColor: "#173F5F", color: "#ffffff" }}
        >
          {"Chưa gửi"}
        </small>
      );
    }
  };

  handleFilter = (option, actions) => {
    const { receiverDate, org } = option;
    this.setState(
      {
        receiverDate: receiverDate,
        orgId: org?.id,
        page: 0,
      },
      () => {
        var searchObject = {};
        searchObject.text = this.state.keyword;
        searchObject.receiverDate = receiverDate;
        searchObject.belongTo = 1; // mẫu thuộc về Viral Load
        searchObject.pageIndex = this.state.page;
        searchObject.pageSize = this.state.rowsPerPage;
        if (org != null) {
          searchObject.orgId = org.id;
        }
        this.searchFilter(searchObject);
      }
    );
  };

  handleCollapseFilter = () => {
    let { checkedFilter } = this.state;
    this.setState({ checkedFilter: !checkedFilter });
  };

  orgSendSpecimen = (value) => {
    this.setState({ orgId: value.id });
  };

  receiverDate = (value) => {
    this.setState({ receiverDate: value });
  };

  async getListToSendSMSByFilter() {
    // debugger;
    let itemListClone = [];
    var searchObject = {};
    searchObject.pageIndex = 1;
    searchObject.pageSize = 100000000;
    searchObject.receiverDate = this.state.receiverDate;
    searchObject.orgId = this.state.orgId;

    await searchByPage(searchObject).then(({ data }) => {
      itemListClone = data.content;
    });
    return itemListClone;
  }

  render() {
    const { t, i18n } = this.props;
    let {
      keyword,
      rowsPerPage,
      page,
      itemList,
      itemListSmsLog,
      labTest,
      item,
      reagentCode,
      resultMonthSearch,
      listReagentCode,
      shouldOpenConfirmationDialog,
      shouldOpenEditorDialog,
      listLabTestResult,
      shouldOpenConfirmationSentAllDialog,
      checkedFilter,
      selectedList,
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
        title: t("specimen.code"),
        field: "specimen.niheCode",
        align: "left",
        width: "100",
      },
      {
        title: "Tên bệnh nhân",
        field: "specimen.fullName",
        align: "left",
        width: "100",
      },
      {
        title: "Mã bệnh nhân",
        field: "specimen.patientCode",
        align: "left",
        width: "100",
      },
      {
        title: t("Kết quả (cp/ml)"),
        field: "labResult",
        align: "left",
        width: "100",
      },
      {
        title: "Giới tính",
        field: "specimen.patient.gender",
        align: "left",
        width: "100",
        render: (rowData) => this.gender(rowData.specimen.patient.gender),
      },
      {
        title: "Địa chỉ",
        field: "specimen.patient.address",
        align: "left",
        width: "100",
      },

      {
        title: "Trạng thái",
        field: "",
        align: "left",
        width: "100",
        render: (rowData) => this.status(rowData.id),
      },
    ];

    return (
      <div className="m-sm-30">
        <div className="mb-sm-30">
          <Breadcrumb routeSegments={[{ name: "Sms" }]} />
        </div>
        <Grid container>
          <Grid item xs={12} container spacing={2}>
            <Grid item md={4} sm={12}>
              <Button
                className="mb-16 mr-36 align-bottom"
                variant="contained"
                color="primary"
                onClick={() =>
                  this.setState({ shouldOpenConfirmationSentAllDialog: true })
                }
              >
                {"Gửi Sms"}
              </Button>
            </Grid>

            <Grid md={2} sm={12}></Grid>

            <Grid item md={6} lg={6} sm={12} xs={12}>
              <Grid container spacing={2}>
                <Grid
                  item
                  lg={8}
                  md={8}
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
                <Grid item lg={4} md={4} sm={6} xs={6}>
                  <Button
                    className="btn_s_right d-inline-flex btn btn-primary-d"
                    variant="contained"
                    onClick={this.handleCollapseFilter}
                    fullWidth
                    color="primary"
                  >
                    <FilterListIcon />
                    <span>{t("general.filter")}</span>
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
              </Grid>
            </Grid>
            <Grid item md={12} sm={12} xs={12}>
              <Collapse
                in={checkedFilter}
                style={{
                  width: "100%",
                }}
              >
                <ResultSmsFilter
                  handleFilter={this.handleFilter}
                  t={t}
                  orgSendSpecimen={this.orgSendSpecimen}
                  receiverDate={this.receiverDate}
                />
              </Collapse>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <div>
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
            {shouldOpenConfirmationSentAllDialog && (
              <ConfirmationDialog
                open={shouldOpenConfirmationSentAllDialog}
                onConfirmDialogClose={this.handleDialogClose}
                onYesClick={this.handleSentAll}
                title={t("general.confirm")}
                text={
                  this.data?.length > 0
                    ? "Gửi tin nhắn đến bệnh nhân đã chọn?"
                    : "Gửi tin nhắn đến bệnh nhân theo bộ lọc"
                }
                Yes={t("general.Yes")}
                No={t("general.No")}
              />
            )}
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
              }}
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

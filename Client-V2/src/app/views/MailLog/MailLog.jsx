import React, { Component } from "react";
import useEffect from "react";
import {
  FormControl,
  Input,
  InputAdornment,
  Grid,
  IconButton,
  Icon,
  Button,
  MenuItem,
  Select,
  InputLabel,
  TablePagination,
} from "@material-ui/core";
import MaterialTable from "material-table";
import { searchByPage } from "./MailLogService";
// import AdministrativeUnitEditorDialog from "./AdministrativeUnitEditorDialog";
import { Breadcrumb, ConfirmationDialog } from "egret";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import DateFnsUtils from "@date-io/date-fns";
import { useTranslation } from "react-i18next";
import Tooltip from "@material-ui/core/Tooltip";
import SearchIcon from "@material-ui/icons/Search";
import ClearIcon from "@material-ui/icons/Clear";
import { saveAs } from "file-saver";
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import moment from "moment";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";

import "react-toastify/dist/ReactToastify.css";
toast.configure({
  autoClose: 1000,
  draggable: false,
  limit: 3,
});

const LightTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: theme.shadows[1],
    fontSize: 11,
    marginLeft: "-1.5em",
  },
}))(Tooltip);

class AdministrativeUnitTable extends Component {
  state = {
    rowsPerPage: 10,
    page: 0,
    resultDateSearch: "",
    logList: [],
    item: {},
    status: null,
    keyword: "",
    shouldOpenEditorDialog: false,
    shouldOpenConfirmationDialog: false,
    shouldOpenConfirmationDeleteAllDialog: false,
    loading: true,
  };
  constructor(props) {
    super(props);
    this.handleTextSearchChange = this.handleTextSearchChange.bind(this);
  }

  handleTextSearchChange = (event) => {
    this.setState({ keyword: event.target.value }, function () {
      // document.getElementById('search_box').value.length = 60;
    });

    // console.log(keyword);
  };
  handleDateChange = (value, source) => {
    if (source === "resultDateSearch") {
      this.state.resultDateSearch = value;
      this.setState({ resultDateSearch: value });
    }
    if (source === "clear") {
      this.state.resultDateSearch = null;
      this.setState({ resultDateSearch: null });
    }

    this.search();
  };
  handleKeyDownEnterSearch = (e) => {
    if (e.key === "Enter") {
      this.search();
    }
  };

  search() {
    // this.props.getLoading(true);
    this.setState({ page: 0 }, function () {
      var searchObject = {};
      searchObject.text = this.state.keyword;
      searchObject.sentDate = this.state.resultDateSearch;
      searchObject.pageIndex = this.state.page + 1;
      searchObject.pageSize = this.state.rowsPerPage;
      searchObject.status = this.state.status;
      searchByPage(searchObject).then(({ data }) => {
        let itemListClone = [...data.content];
        this.setState({
          logList: itemListClone,
          totalElements: data.totalElements,
        });
        // this.props.getLoading(false);
      });
    });
  }
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
    });
    this.updatePageData();
  };
  usingEmailStatus = (logList) => {
    let name = "";
    if (logList === true) {
      name = "Có lỗi ";
    } else if (logList == false) {
      name = "Không có lỗi";
    }
    return name;
  };

  componentDidMount() {
    this.updatePageData();
  }
  handleChangeUsingSms = (event, source) => {
    if (source === "status") {
      // console.log("sssss");
      let status = this.state;
      status = event.target.value;
      this.setState({ status: status }, () => {
        this.search();
      });
      return;
    }
  };

  updatePageData = () => {
    var searchObject = {};
    searchObject.pageIndex = this.state.page + 1;
    searchObject.pageSize = this.state.rowsPerPage;
    searchObject.text = this.state.keyword.trim();
    searchObject.status = this.state.status;
    searchByPage(searchObject).then(({ data }) => {
      if (data.content.length == 0 && this.state.page != 0) {
        this.setPage(0);
      }
      this.setState({
        logList: [...data.content],
        totalElements: data.totalElements,
        loading: false,
      });
    });
  };

  render() {
    const { t, i18n } = this.props;
    let {
      rowsPerPage,
      page,
      keyword,
      status,
      logList,
      shouldOpenConfirmationDialog,
      shouldOpenConfirmationDeleteAllDialog,
      resultDateSearch,
      shouldOpenEditorDialog,
      totalElements,
      loading,
    } = this.state;
    console.log(logList);
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
          paddingLeft: "35px",
          textAlign: "left",
        },
      },
      {
        title: "Ngày gửi",
        field: "sendDate",
        align: "left",
        width: "150",
        headerStyle: {
          minWidth: "150px",
          paddingLeft: "10px",
          paddingRight: "0px",
        },
        cellStyle: {
          minWidth: "150px",
          paddingLeft: "10px",
          paddingRight: "0px",
          textAlign: "left",
        },
        render: (logList) => (
          <span>{moment(logList.sentDate).format("DD/MM/YYYY")}</span>
        ),
      },
      {
        title: "Đối tượng",
        field: "toAddress",
        align: "left",
        width: "150",
        headerStyle: {
          minWidth: "150px",
          paddingLeft: "10px",
          paddingRight: "0px",
        },
        cellStyle: {
          minWidth: "150px",
          paddingLeft: "10px",
          paddingRight: "0px",
          textAlign: "left",
        },
      },
      {
        title: "Mã NIHE",
        field: "niheCode",
        align: "left",
        width: "150",
        headerStyle: {
          minWidth: "150px",
          paddingLeft: "10px",
          paddingRight: "0px",
        },
        cellStyle: {
          minWidth: "150px",
          paddingLeft: "10px",
          paddingRight: "0px",
          textAlign: "left",
        },
      },
      {
        title: "Trạng thái",
        field: "status",
        align: "left",
        width: "150",
        headerStyle: {
          minWidth: "150px",
          paddingLeft: "10px",
          paddingRight: "0px",
        },
        cellStyle: {
          minWidth: "150px",
          paddingLeft: "10px",
          paddingRight: "0px",
          textAlign: "left",
        },
        render: (logList) =>
          logList.status == 1 ? (
            <small
              className="border-radius-4 text-black px-8 py-2 "
              style={{ backgroundColor: "#83ef84" }}
            >
              {t("Không có lỗi")}
            </small>
          ) : (
            <small
              className="border-radius-4 px-8 py-2 "
              style={{ backgroundColor: "#FF0000", color: "#ffffff" }}
            >
              {t("Có lỗi")}
            </small>
          ),
      },
    ];
    return (
      <div className="m-sm-30">
        <div className="mb-sm-30">
          {loading}
          <Helmet>
            <title>Lịch sử hành động | {t("web_site")}</title>
          </Helmet>
          <Breadcrumb
            routeSegments={[
              { name: t("category"), path: "/directory/apartment" },
              { name: "Lịch sử hành động" },
            ]}
          />
        </div>
        <Grid container spacing={3}>
          <Grid item lg={4} md={4} sm={12} xs={12}>
            <FormControl
              fullWidth={true}
              className="mb-32"
              variant="outlined"
              size="small"
            >
              <InputLabel htmlFor="usingSms-simple">
                {t("Trạng thái")}
              </InputLabel>
              <Select
                value={status}
                label={t("patient.useSms")}
                style={{ marginBottom: "16px" }}
                onChange={(event) => this.handleChangeUsingSms(event, "status")}
                inputProps={{
                  name: "usingSms",
                  id: "usingSms-simple",
                }}
              >
                {" "}
                <MenuItem key={1} value={null}>
                  Tất cả
                </MenuItem>
                <MenuItem key={2} value={0}>
                  Có lỗi
                </MenuItem>
                <MenuItem key={3} value={1}>
                  Không có lỗi
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={3} container spacing={0}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                autoOk={true}
                disableFuture={true}
                size="small"
                className="w-100"
                margin="none"
                id="date-picker-dialog"
                clearable
                format="dd/MM/yyyy"
                label={<span>Ngày cần tìm</span>}
                inputVariant="outlined"
                value={resultDateSearch ? resultDateSearch : null}
                onChange={(value) =>
                  this.handleDateChange(value, "resultDateSearch")
                }
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={(value) => this.handleDateChange(value, "clear")}
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
          <Grid item lg={1} md={1} sm={0} xs={0}></Grid>
          <Grid item lg={4} md={4} sm={12} xs={12}>
            <FormControl fullWidth>
              <Input
                className="mt-10 search_box w-100 stylePlaceholder"
                type="text"
                name="keyword"
                value={keyword}
                onChange={this.handleTextSearchChange}
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
          <Grid item xs={12}>
            <MaterialTable
              title={t("List")}
              data={this.state.logList}
              columns={columns}
              parentChildData={(row, rows) => {
                var list = rows.find((a) => a.id === row.parentId);
                return list;
              }}
              options={{
                rowStyle: (rowData, index) => ({
                  backgroundColor: index % 2 === 1 ? "#EEE" : "#FFF",
                }),
                paging: false,
                maxBodyHeight: "450px",
                minBodyHeight: "370px",
                headerStyle: {
                  backgroundColor: "#358600",
                  color: "#fff",
                },
                padding: "dense",
                toolbar: false,
              }}
              onSelectionChange={(rows) => {
                this.data = rows;
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

export default AdministrativeUnitTable;

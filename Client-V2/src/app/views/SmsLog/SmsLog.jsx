import React, { Component } from "react";
import {
  FormControl,
  Input,
  InputAdornment,
  Grid,
  IconButton,
  Icon,
  Button,
  TablePagination,
} from "@material-ui/core";
import MaterialTable from "material-table";
import { searchByPage } from "./SmsLogService";
// import AdministrativeUnitEditorDialog from "./AdministrativeUnitEditorDialog";
import { Breadcrumb, ConfirmationDialog } from "egret";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import Tooltip from "@material-ui/core/Tooltip";
import SearchIcon from "@material-ui/icons/Search";
import { saveAs } from "file-saver";
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import { connect } from "react-redux";
import { getLoading } from "../../redux/actions/LoadingActions";

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
    logList: [],
    item: {},
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
  handleKeyDownEnterSearch = (e) => {
    if (e.key === "Enter") {
      this.search();
    }
  };

  search() {
    this.setState({ page: 0 }, function () {
      this.updatePageData();
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

  componentDidMount() {
    this.updatePageData();
  }

  updatePageData = () => {
    this.props.getLoading(true);
    var searchObject = {};
    searchObject.pageIndex = this.state.page + 1;
    searchObject.pageSize = this.state.rowsPerPage;
    searchObject.text = this.state.keyword.trim();
    searchByPage(searchObject).then(({ data }) => {
      if (data.content.length == 0 && this.state.page != 0) {
        this.setPage(0);
      }
      this.setState({
        logList: [...data.content],
        totalElements: data.totalElements,
      });
      this.props.getLoading(false);
    }).catch(() => {
      toast.error("Đã có lỗi hệ thống");
      this.props.getLoading(false);
    });;
  };

  render() {
    const { t, i18n } = this.props;
    let {
      rowsPerPage,
      page,
      keyword,
      logList,
      shouldOpenConfirmationDialog,
      shouldOpenConfirmationDeleteAllDialog,
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
          paddingRight: "30px",
          textAlign: "left",
        },
      },
      // {
      //   title: "Thời gian",
      //   width: "100",
      //   type:"datetime-local",
      //   headerStyle: {
      //     minWidth: "150px",
      //     paddingLeft: "10px",
      //     paddingRight: "0px",
      //   },
      //   cellStyle: {
      //     minWidth: "100px",
      //     paddingLeft: "10px",
      //     paddingRight: "0px",
      //     textAlign: "left",
      //   },
      //   render:(logList) => (
      //     logList.logDate[2] + "/" + logList.logDate[1] + "/"
      //     + logList.logDate[0] + " " + logList.logDate[3] +":"+ logList.logDate[4]
      //   ),
      // },
      {
        title: "Ngày gửi",
        field: "sentDate",
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
          <span>{logList.sentDate ? moment(logList.sentDate).format("DD/MM/YYYY") : ""}</span>
        ),
      },
      {
        title: "Mã nihe",
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
        title: "Số điện thoại",
        field: "phone",
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
        title: "Người gửi",
        field: "sentBy",
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
        title: "Lỗi",
        field: "errorCode",
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
        render: (rowData) =>
          rowData.errorCode == null ? (
            <small
              className="border-radius-4 text-black px-8 py-2 "
              style={{ backgroundColor: "#83ef84" }}
            >
              {t("Không có lỗi")}
            </small>
          ) : rowData.errorCode != null ? (
            <small
              className="border-radius-4 px-8 py-2 "
              style={{ backgroundColor: "#FF0000", color: "#ffffff" }}
            >
              {t("Có lỗi")}
            </small>
          ) : (
            ""
          ),
      },
      {
        title: "Lỗi chi tiết",
        field: "errorDetail",
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
          <Grid item lg={5} md={5} sm={12} xs={12}>
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
export default connect(mapStateToProps, mapDispatch)(AdministrativeUnitTable);

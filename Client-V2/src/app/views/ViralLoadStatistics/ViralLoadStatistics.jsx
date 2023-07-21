import React, { Component } from "react";
import {
  Tooltip,
  Checkbox,
  Grid,
  IconButton,
  Icon,
  Input,
  InputAdornment,
  TablePagination,
  Link,
  FormControl,
  Button,
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
  exportExcel,
} from "./ViralLoadStatisticsService";
import { Breadcrumb, ConfirmationDialog } from "egret";
import { useTranslation, withTranslation, Trans } from "react-i18next";
import SearchIcon from "@material-ui/icons/Search";
import { saveAs } from "file-saver";
import { ToastContainer, toast } from "react-toastify";
import moment from "moment";
import "react-toastify/dist/ReactToastify.css";
import DateFnsUtils from "@date-io/date-fns";

import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import { connect } from "react-redux";
import { getLoading } from "../../redux/actions/LoadingActions";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import FilterListIcon from "@material-ui/icons/FilterList";
import ViralLoadStaticsFillter from "./ViralLoadStaticsFillter";

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

class ViralLoadStatistics extends Component {
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
    shouldOpenConfirmationDeleteAllDialog: false,
    startDate: "",
    endDate: "",
    loading: false,
    isCheckbox: false,
    startDate: "",
    endDate: "",
    specimenSource: "",
  };
  numSelected = 0;
  rowCount = 0;

  handleTextChange = (event) => {
    this.setState({ keyword: event.target.value }, function () { });
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

  search() {
    this.props.getLoading(true);
    this.setState({ page: 0 }, function () {
      var searchObject = {};
      searchObject.text = this.state.keyword;
      searchObject.specimenSource = this.state.specimenSource;
      searchObject.pageIndex = this.state.page + 1;
      searchObject.pageSize = this.state.rowsPerPage;
      searchObject.type = 1; //Loại kết quả 1: NormalVL,2: EID
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
  handleDateChange = (value, source) => {
    // debugger"
    if (source === "startDate") {
      this.state.startDate = value;
      this.setState({ startDate: value });
    }
    if (source === "endDate") {
      this.state.endDate = value;
      this.setState({ endDate: value });
    }
  };

  handleSpecimenSourceChange = (actions) => {
    this.state.specimenSource = actions.target.value;
    this.setState({ specimenSource: actions.target.value });
  };

  updatePageData = () => {
    this.props.getLoading(true);
    var searchObject = {};
    searchObject.text = this.state.keyword;
    searchObject.pageIndex = this.state.page + 1;
    searchObject.pageSize = this.state.rowsPerPage;
    searchObject.type = 1; //Loại kết quả 1: NormalVL,2: EID
    searchObject.startDate = this.state.startDate;
    searchObject.endDate = this.state.endDate;
    searchObject.specimenSource = this.state.specimenSource;
    searchByPage(searchObject).then(({ data }) => {
      let itemListClone = [...data.content];
      this.setState({
        itemList: itemListClone,
        totalElements: data.totalElements,
      });
      this.props.getLoading(false);
    });
  };

  handleCollapseFilter = () => {
    let { checkedFilter } = this.state;
    this.setState({ checkedFilter: !checkedFilter });
  };

  handleFilter = (option, actions) => {
    this.props.getLoading(true);
    const { t } = this.props;
    const { startDate, endDate, specimenSource, } = option;

    var searchObject = {};
    this.setState({ page: 1, loading: true, startDate: startDate, endDate: endDate, specimenSource: specimenSource});

    if (startDate && !endDate) {
      toast.error("Không thể để trống điều kiện");
      this.props.getLoading(false);
    }else if (!startDate && endDate){
      toast.error("Không thể để trống điều kiện");
      this.props.getLoading(false);
    }else if (startDate && endDate){
      searchObject.startDate = this.state.startDate;
      searchObject.endDate = this.state.endDate;
    }

    searchObject.startDate = startDate;
    searchObject.endDate = endDate;
    searchObject.specimenSource = specimenSource;
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

  componentDidMount() {
    this.updatePageData();
  }

  handleEditItem = (item) => {
    this.setState({
      item: item,
      shouldOpenEditorDialog: true,
    });
  };

  handleCheckboxChange = () => {
    if (this.state.isCheckbox == true) {
      this.setState({
        specimenSource: "",
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

  async handleDeleteList(list) {
    for (var i = 0; i < list.length; i++) {
      await deleteItem(list[i].id);
    }
  }
  handleExportExcel = () => {
    this.setState({ isLoading: true });
    if (!this.state.isCheckbox) {
      if (this.state.startDate == "" || this.state.endDate == "") {
        this.setState({ isLoading: false });
        toast.error("Ngày lấy mẫu hoặc ngày có kết quả đang để trống");
      } else if (
        this.state.startDate > this.state.endDate &&
        this.state.startDate != "" &&
        this.state.endDate != ""
      ) {
        this.setState({ isLoading: false });
        toast.error("Ngày lấy mẫu không được lớn hơn ngày có kết quả");
      } else {
        let searchObject = {};
        searchObject.pageIndex = 1;
        searchObject.pageSize = 10000;
        searchObject.startDate = this.state.startDate;
        searchObject.endDate = this.state.endDate;
        searchObject.orderByASC = true;
        exportExcel(searchObject).then((result) => {
          this.setState({ exportStatus: true });
          const url = window.URL.createObjectURL(new Blob([result.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "Tải lượng HIV.xlsx");
          document.body.appendChild(link);
          link.click();
          this.setState({ isLoading: false });
          toast.success(this.props.t("general.successExport"));
        });
      }
    } else if (this.state.isCheckbox == true) {
      if (this.state.specimenSource == "") {
        toast.error("Không để trống điều kiện");
      } else {
        let searchObject = {};
        searchObject.pageIndex = 1;
        searchObject.pageSize = 10000;
        searchObject.specimenSource = this.state.specimenSource;
        console.log(searchObject.specimenSource);
        searchObject.orderByASC = true;
        exportExcel(searchObject).then((result) => {
          this.setState({ exportStatus: true });
          const url = window.URL.createObjectURL(new Blob([result.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "Tải lượng HIV.xlsx");
          document.body.appendChild(link);
          link.click();
          this.setState({ isLoading: false });
          toast.success(this.props.t("general.successExport"));
        });
      }
    }
  };

  type = (value) => {
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
  listGender = (value) => {
    let name = "";
    if (value === "M") {
      name = "Nam";
    } else if (value === "F") {
      name = "Nữ";
    } else if (value === "O") {
      name = "Khác";
    }
    return name;
  };
  resultStatus = (value) => {
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
      page,
      rowsPerPage,
      isLoading,
      isCheckbox,
      specimenSource,
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
      {
        title: t("specimen.patientName"),
        field: "specimen.fullName",
        align: "left",
        width: "150",
        headerStyle: {
          minWidth: "80px",
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
        title: t("specimen.patientCode"),
        field: "specimen.patientCode",
        align: "left",
        width: "100",
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
      },
      {
        title: t("patient.gender"),
        field: "specimen.patientCode",
        align: "left",
        width: "130",
        headerStyle: {
          minWidth: "130px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "130px",
          paddingRight: "0px",
          textAlign: "left",
        },
        render: (rowData) => this.listGender(rowData.specimen?.gender),
      },
      {
        title: t("specimen.yearOfBirth"),
        // field: "specimen.yearOfBirth",
        align: "left",
        width: "130",
        headerStyle: {
          minWidth: "130px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "130px",
          paddingRight: "0px",
          textAlign: "left",
        },
        render: (rowData) =>
          rowData.specimen.patient.manualBirthDate ? (
            <span>{rowData.specimen.patient.manualBirthDate}</span>
          ) : (
            <span>
              {moment(rowData.specimen.patient.birthDate).format("DD/MM/YYYY")}
            </span>
          ),
      },
      {
        title: t("Đơn vị"),
        field: "specimen.org.name",
        align: "left",
        width: "200",
        headerStyle: {
          minWidth: "200",
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
        title: t("Địa chỉ"),
        field: "specimen.address",
        align: "right",
        width: "150",
        headerStyle: {
          minWidth: "200",
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
        title: t("Lần lấy mẫu"),
        field: "specimen.numberOfTests",
        align: "left",
        width: "100",
        headerStyle: {
          minWidth: "130px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "130px",
          paddingRight: "0px",
          textAlign: "left",
        },
      },
      {
        title: t("Ngày lấy mẫu"),
        field: "specimenDate",
        align: "left",
        width: "100",
        headerStyle: {
          minWidth: "130px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "130px",
          paddingRight: "0px",
          textAlign: "left",
        },

        render: (rowData) =>
          rowData.specimen?.specimenDate ? (
            <span>
              {moment(rowData.specimen?.specimenDate).format("DD/MM/YYYY")}
            </span>
          ) : (
            ""
          ),
      },
      {
        title: t("Ngày nhận mẫu"),
        field: "receiverDate",
        align: "left",
        width: "100",
        headerStyle: {
          minWidth: "130px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "130px",
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
        title: t("result.date"),
        field: "resultDate",
        align: "left",
        width: "100",
        headerStyle: {
          minWidth: "130px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "130px",
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
        title: t("Kết quả (cp/ml)"),
        field: "labResult",
        align: "left",
        width: "100",
        headerStyle: {
          minWidth: "130px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "130px",
          paddingRight: "0px",
          textAlign: "left",
        },
      },
      {
        title: t("specimen.code"),
        field: "specimen.niheCode",
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
      },
    ];

    return (
      <div className="m-sm-30">
        <div className="mb-sm-30">
          <Breadcrumb
            routeSegments={[{ name: t("Dashboard.testResult.hiv") }]}
          />
        </div>

        <Grid container spacing={3}>
          <Grid xs={12} container spacing={0}>
            <Grid item lg={3} md={3} sm={12} xs={12}>
              <Button
                className="btn_s_right d-inline-flex btn btn-primary-d"
                variant="contained"
                onClick={this.handleCollapseFilter}
                fullWidth
                color="primary"
              >
                <FilterListIcon />
                <span>Bộ lọc</span>
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
            <Grid item md={12} sm={12} xs={12} className="mt-12">
              <Collapse
                in={checkedFilter}
                style={{
                  width: "100%",
                }}
              >
                <ViralLoadStaticsFillter
                  handleFilter={this.handleFilter} t={t}/>
              </Collapse>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <MaterialTable
              title={t("")}
              data={itemList}
              columns={columns}
              parentChildData={(row, rows) => {
                var list = rows.find((a) => a.id === row.parentId);
                return list;
              }}
              isLoading={this.state.isLoading}
              options={{
                selection: false,
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
            // actions={[
            //   {
            //     tooltip: 'Remove All Selected Users',
            //     icon: 'delete',
            //     onClick: (evt, data) => {

            //       alert('You want to delete ' + data.length + ' rows');
            //     }
            //   },
            // ]}
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
        <ToastContainer />
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
export default connect(mapStateToProps, mapDispatch)(ViralLoadStatistics);

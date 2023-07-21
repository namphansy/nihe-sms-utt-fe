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
import { deleteItem, searchByPage, getOne } from "./ShippingCardService"; //getAllEQAHealthOrgTypes,
import ShippingCardDialog from "./ShippingCardDialog";
import { Breadcrumb, ConfirmationDialog } from "egret";
import { useTranslation, withTranslation, Trans } from "react-i18next";
import SearchIcon from "@material-ui/icons/Search";
import { saveAs } from "file-saver";
import UploadExcelDialog from "../uploadExcel/UploadExcelDialog";
import { toast } from "react-toastify";
import ConstantList from "../../appConfig";
import moment from "moment";
import ShippingCardFilter from "./ShippingCardFilter";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import FilterListIcon from "@material-ui/icons/FilterList";
import { connect } from "react-redux";
import { getLoading } from "../../redux/actions/LoadingActions";
import NotificationPopup from "../Component/NotificationPopup/NotificationPopup";
import { isThisSecond } from "date-fns";
import { TextValidator } from "react-material-ui-form-validator";

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
      <IconButton size="small" onClick={() => props.onSelect(item, 1)}>
        <Icon fontSize="small" color="error">
          delete
        </Icon>
      </IconButton>
    </div>
  );
}

class ShippingCard extends Component {
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
    shippingCardType: "Normal",
    shouldOpenConfirmationDeleteAllDialog: false,
    showOpenDialogError: false,
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
      searchObject.pageIndex = this.state.page + 1;
      searchObject.pageSize = this.state.rowsPerPage;
      searchObject.shippingCardType = this.state.shippingCardType;
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
          toast.error("Đã có lỗi hệ thống");
          this.setState({ showOpenDialogError: true });
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
    searchObject.shippingCardType = this.state.shippingCardType;
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
        toast.error("Đã có lỗi hệ thống");
        this.setState({ showOpenDialogError: true });
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
    this.setState(
      {
        shouldOpenUploadExcelResultDialog: false,
        shouldOpenEditorDialog: false,
        shouldOpenConfirmationDialog: false,
        shouldOpenConfirmationDeleteAllDialog: false,
        shouldOpenConfirmDialog: false,
      },
      () => {
        this.updatePageData();
      }
    );
  };

  handleOKEditClose = () => {
    this.setState({
      shouldOpenUploadExcelResultDialog: false,
      shouldOpenEditorDialog: false,
      shouldOpenConfirmationDialog: false,
    });
    this.updatePageData();
  };

  handleConfirmationResponse = () => {
    this.props.getLoading(true);
    deleteItem(this.state.id)
      .then(({ data }) => {
        if (data == true) {
          toast.success("Xóa thành công");
          this.updatePageData();
          this.handleDialogClose();
        } else {
          toast.error("Mẫu này đã được vận chuyển, không thể xóa");
          this.handleDialogClose();
        }
        this.props.getLoading(false);
      })
      .catch(() => {
        this.props.getLoading(false);
        toast.error("Đã có lỗi khi xóa");
        this.handleDialogClose();
      });
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

  async handleDeleteList(list) {
    for (var i = 0; i < list.length; i++) {
      await deleteItem(list[i].id);
    }
  }

  handleDeleteAll = (event) => {
    this.props.getLoading(true);
    this.handleDeleteList(this.data)
      .then(() => {
        this.updatePageData();
        this.handleDialogClose();
      })
      .catch(() => {
        toast.error("Đã có lỗi hệ thống");
        this.setState({ showOpenDialogError: true });
        this.props.getLoading(false);
      });
  };

  handleFilter = (option, actions) => {
    const { t } = this.props;
    const { niheCodeFrom, niheCodeTo, shipDate, org } = option;
    var searchObject = {};
    this.setState({ page: 1, loading: true });
    // searchObject.niheCodeFrom = niheCodeFrom;
    // searchObject.niheCodeTo = niheCodeTo;
    searchObject.shipDate = shipDate;
    if (org != null) {
      searchObject.orgSearchId = org.id;
    } // searchObject.belongTo = 1; // mẫu thuộc về Viral Load
    searchObject.shippingCardType = this.state.shippingCardType;
    searchObject.pageIndex = this.state.page;
    searchObject.pageSize = 10000;
    searchByPage(searchObject)
      .then(({ data }) => {
        let itemListClone = [...data.content];
        this.setState({
          itemList: itemListClone,
          totalElements: data.totalElements,
        });
      })
      .catch(() => {
        this.setState({
          itemListClone: [],
          loading: false,
        });
        toast.error(t("general.error"));
      });

    if (actions === "clear") {
      var searchObject = {};
      searchObject.text = this.state.keyword;
      searchObject.pageIndex = 1;
      searchObject.pageSize = 10000;
      searchObject.shippingCardType = this.state.shippingCardType;
      // searchObject.belongTo = 1; // mẫu thuộc về Viral Load
      searchByPage(searchObject).then(({ data }) => {
        let itemListClone = [...data.content];
        this.setState({
          itemList: itemListClone,
          totalElements: data.totalElements,
        });
      });
      return null;
    }
  };

  handleCollapseFilter = () => {
    let { checkedFilter } = this.state;
    this.setState({ checkedFilter: !checkedFilter });
  };

  shippingStatusRender = (shippingStatus) => {
    if (shippingStatus === "Pending") {
      return (
        <small
          className="border-radius-4 px-8 py-2 "
          style={{ backgroundColor: "#EADDCA" }}
        >
          {"Đã gửi"}
        </small>
      );
    } else if (shippingStatus === "Draft") {
      return (
        <small
          className="border-radius-4 text-black px-8 py-2 "
          style={{ backgroundColor: "#FF0000" }}
        >
          {"Chưa gửi"}
        </small>
      );
    } else if (shippingStatus === "Accepted") {
      return (
        <small
          className="border-radius-4 text-black px-8 py-2 "
          style={{ backgroundColor: "#83ef84" }}
        >
          {"Đã nhận"}
        </small>
      );
    }
  };

  render() {
    const { t, i18n } = this.props;
    let {
      keyword,
      rowsPerPage,
      page,
      itemList,
      item,
      shouldOpenConfirmationDialog,
      shouldOpenEditorDialog,
      shouldOpenConfirmationDeleteAllDialog,
      checkedFilter,
      showOpenDialogError,
    } = this.state;

    let columns = [
      {
        title: t("general.STT"),
        field: "code",
        align: "center",
        width: "10",
        render: (rowData) => page * rowsPerPage + (rowData.tableData.id + 1),
        headerStyle: {
          minWidth: "10px",
          paddingRight: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "10px",
          paddingRight: "10px",
          textAlign: "center",
        },
      },
      {
        title: t("Hành động"),
        minWidth: "100px",
        field: "custom",
        align: "center",
        width: "100",

        headerStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "80px",
          textAlign: "center",
        },

        render: (rowData) => (
          <MaterialButton
            item={rowData}
            onSelect={(rowData, method) => {
              if (method === 0) {
                this.props.getLoading(true);
                getOne(rowData.id)
                  .then(({ data }) => {
                    if (data.parent === null) {
                      data.parent = {};
                    }
                    this.setState({
                      item: data,
                      shouldOpenEditorDialog: true,
                    });
                    this.props.getLoading(false);
                  })
                  .catch(() => {
                    toast.error("Đã có lỗi hệ thống");
                    this.setState({ showOpenDialogError: true });
                    this.props.getLoading(false);
                  });
              } else if (method === 1) {
                this.handleDelete(rowData.id);
              } else {
                alert("Call Selected Here:" + rowData.id);
              }
            }}
          />
        ),
      },
      {
        title: t("Mã vận chuyển"),
        field: "code",
        align: "left",
        width: "100",
        headerStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "100px",
          textAlign: "center",
        },
      },
      {
        title: t("Đơn vị lấy mẫu"),
        field: "org.name",
        align: "left",
        width: "170px",
        headerStyle: {
          minWidth: "170px",
          paddingRight: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "170px",
          textAlign: "left",
        },
      },
      {
        title: t("Đơn vị xét nghiệm"),
        field: "labTest.name",
        align: "left",
        width: "170",
        headerStyle: {
          minWidth: "170px",
          paddingRight: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "170px",
          textAlign: "left",
        },
      },
      {
        title: t("Ngày gửi"),
        field: "shipDate",
        align: "left",
        width: "70",
        headerStyle: {
          width: "70",
          minWidth: "70px",
          textAlign: "center",
        },
        cellStyle: {
          width: "70",
          minWidth: "70px",
          textAlign: "center",
        },
        render: (rowData) =>
          rowData.shipDate ? (
            <span>{moment(rowData.shipDate).format("DD/MM/YYYY")}</span>
          ) : (
            ""
          ),
      },
      {
        title: t("Ngày nhận"),
        field: "receiverDate",
        align: "left",
        width: "70",
        headerStyle: {
          minWidth: "70px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "70px",
          textAlign: "center",
        },
        render: (rowData) =>
          rowData.receiverDate ? (
            <span>{moment(rowData.receiverDate).format("DD/MM/YYYY")}</span>
          ) : (
            ""
          ),
      },
      {
        title: t("Người nhận"),
        field: "receiverBy",
        align: "left",
        width: "80",
        headerStyle: {
          minWidth: "80px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "80px",
          textAlign: "center",
        },
      },

      {
        title: t("Trạng thái"),
        field: "shippingStatus",
        align: "left",
        width: "70",
        headerStyle: {
          minWidth: "70px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "70px",
          textAlign: "center",
        },
        render: (rowData) => this.shippingStatusRender(rowData.shippingStatus),
      },
    ];

    return (
      <div className="m-sm-30">
        <div className="mb-sm-30">
          <Breadcrumb routeSegments={[{ name: t("Danh sách vận chuyển") }]} />
        </div>
        <Grid container spacing={3}>
          <Grid item xs={12} container spacing={2}>
            <Grid item lg={6} md={6} sm={12} xs={12}>
              <Button
                className="mb-16 mr-16 align-bottom"
                variant="contained"
                color="primary"
                onClick={() => {
                  this.handleEditItem({
                    startDate: new Date(),
                    endDate: new Date(),
                    isAddnew: true,
                    shippingCardType: this.state.shippingCardType,
                  });
                }}
              >
                {t("Thêm mới")}
              </Button>
              <Button
                className="mb-16 mr-36 align-bottom"
                variant="contained"
                color="primary"
                onClick={() =>
                  this.setState({ shouldOpenConfirmationDeleteAllDialog: true })
                }
              >
                {t("Xóa")}
              </Button>
              <Button
                className="mb-16 mr-16 align-bottom"
                variant="contained"
                color="primary"
                onClick={() =>
                  this.setState({ shouldOpenUploadExcelResultDialog: true })
                }
              >
                {t("general.importExcel")}
              </Button>
            </Grid>

            {/* <Grid item lg={4} md={4} sm={12} xs={12}>

            </Grid> */}
            {shouldOpenConfirmationDeleteAllDialog && (
              <ConfirmationDialog
                open={shouldOpenConfirmationDeleteAllDialog}
                onConfirmDialogClose={this.handleDialogClose}
                onYesClick={this.handleDeleteAll}
                title={t("confirm")}
                text={t("DeleteAllConfirm")}
                Yes={t("general.Yes")}
                No={t("general.No")}
              />
            )}
            <Grid item md={6} lg={6} sm={12} xs={12}>
              <Grid container spacing={2}>
                <Grid item lg={8} md={8} sm={6} xs={6}>
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
                <ShippingCardFilter handleFilter={this.handleFilter} t={t} />
              </Collapse>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <div>
              {shouldOpenEditorDialog && (
                <ShippingCardDialog
                  t={t}
                  i18n={i18n}
                  handleClose={this.handleDialogClose}
                  open={shouldOpenEditorDialog}
                  handleOKEditClose={this.handleOKEditClose}
                  item={this.state.item ? this.state.item : {}}
                />
              )}
              {this.state.shouldOpenUploadExcelResultDialog && (
                <UploadExcelDialog
                  t={t}
                  i18n={i18n}
                  handleClose={this.handleDialogClose}
                  open={this.state.shouldOpenUploadExcelResultDialog}
                  handleOKEditClose={this.handleOKEditClose}
                  enableConfirm={true}
                  confirmMessage={
                    "Tải lên sẽ xóa các thuộc tính cũ của mẫu, bạn có chắc chắn?"
                  }
                  acceptType="xlsm;xls;xlsx"
                  uploadUrl={
                    ConstantList.API_ENPOINT +
                    "/api/uploadExcel/shipping-card/false"
                  }
                />
              )}

              {shouldOpenConfirmationDialog && (
                <ConfirmationDialog
                  title={t("confirm")}
                  open={shouldOpenConfirmationDialog}
                  onConfirmDialogClose={this.handleDialogClose}
                  onYesClick={this.handleConfirmationResponse}
                  text={t("DeleteConfirm")}
                  Yes={t("general.Yes")}
                  No={t("general.No")}
                />
              )}
            </div>
            <MaterialTable
              title={t("")}
              data={itemList}
              columns={columns}
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
        {showOpenDialogError && (
          <NotificationPopup
            title={t("general.noti")}
            open={true}
            onYesClick={this.setState({ showOpenDialogError: false })}
            text={"Đã có lỗi hệ thống"}
            size="lg"
            agree={t("confirm")}
          />
        )}
        
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
export default connect(mapStateToProps, mapDispatch)(ShippingCard);

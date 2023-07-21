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
  FormControl,
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
  getById,
  deleteByList,
} from "./SpecimenService";
import SpecimenEditorDialog from "./SpecimenEditorDialog";
import { Breadcrumb, ConfirmationDialog } from "egret";
import { useTranslation, withTranslation, Trans } from "react-i18next";
import SearchIcon from "@material-ui/icons/Search";
import UploadExcelDialog from "../uploadExcel/UploadExcelDialog";
import { saveAs } from "file-saver";
import ConstantList from "../../appConfig";
import moment from "moment";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SpecimenFilter from "./SpecimentFilter";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import FilterListIcon from "@material-ui/icons/FilterList";
import { connect } from "react-redux";
import { getLoading } from "../../redux/actions/LoadingActions";
import NotificationPopup from "../Component/NotificationPopup/NotificationPopup";

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
};

class Specimen extends Component {
  state = {
    keyword: "",
    rowsPerPage: 10,
    page: 0,
    item: {},
    shouldOpenEditorDialog: false,
    shouldOpenConfirmationDialog: false,
    selectAllItem: false,
    selectedList: [],
    totalElements: 0,
    shouldOpenConfirmationDeleteAllDialog: false,
    loading: true,
    showOpenDialogError: false,
  };

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

  specimenTypeString = (value) => {
    //Khai báo const
    let name = "";
    if (value == 1) {
      name = "Mẫu máu toàn phần";
    } else if (value == 2) {
      name = "Huyết tương";
    } else if (value == 3) {
      name = "Huyết thanh";
    } else if (value == 4) {
      name = "DBS";
    } else if (value == 5) {
      name = "Khác";
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

  search() {
    this.props.getLoading(true);
    this.setState({ page: 0 }, function () {
      var searchObject = {};
      searchObject.text = this.state.keyword;
      searchObject.pageIndex = this.state.page + 1;
      searchObject.pageSize = this.state.rowsPerPage;
      searchObject.belongTo = 1; // mẫu thuộc về Viral Load
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
    searchObject.belongTo = 1; // mẫu thuộc về Viral Load

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
        openPopupShowResult: false,
        textPopup: "",
      },
      () => this.updatePageData()
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
    let { t } = this.props;
    this.props.getLoading(true);
    this.handleDialogClose();
    deleteItem(this.state.id)
      .then((result) => {
        if (result.data) {
          this.updatePageData();
          toast.success(t("deleteSuccess"));
        } else {
          toast.warning("Mẫu đã được gửi, không thể xóa");
        }
        this.props.getLoading(false);
      })
      .catch(() => {
        this.props.getLoading(false);
        toast.warning("Đã có lỗi khi xóa");
        this.handleDialogClose();
      });
  };

  componentDidMount() {
    this.updatePageData();
  };

  handleEditItem = (item) => {
    this.setState({
      item: item,
      shouldOpenEditorDialog: true,
    });
  };

  handleDelete = (id) => {
    this.setState({
      id,
      shouldOpenConfirmationDialog: true,
    });
  };

  handleDeleteAll = (event) => {
    this.props.getLoading(true);
    this.setState({ shouldOpenConfirmationDeleteAllDialog: false });
    deleteByList(this.data)
      .then((result) => {
        this.setState({
          isLoading: false,
          openPopupShowResult: true,
          textPopup: (
            <pre dangerouslySetInnerHTML={{ __html: result.data.message }} />
          ),
        });
        this.props.getLoading(false);
      })
      .catch(() => {
        toast.error("Đã có lỗi hệ thống");
        this.setState({ showOpenDialogError: true });
        this.props.getLoading(false);
        this.updatePageData();
      });
  };

  handleCollapseFilter = () => {
    let { checkedFilter } = this.state;
    this.setState({ checkedFilter: !checkedFilter });
  };

  handleFilter = (option, actions) => {
    const { t } = this.props;
    const { niheCodeFrom, niheCodeTo, receiverDateFilter, org } = option;
    var searchObject = {};
    this.setState({ page: 1, loading: true });
    searchObject.niheCodeFrom = niheCodeFrom;
    searchObject.niheCodeTo = niheCodeTo;
    searchObject.receiverDate = receiverDateFilter;
    searchObject.filterOrg = org;
    searchObject.belongTo = 1; // mẫu thuộc về Viral Load
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
      searchObject.belongTo = 1; // mẫu thuộc về Viral Load
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

  render() {
    const { t, i18n } = this.props;
    let {
      keyword,
      itemList,
      page,
      rowsPerPage,
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
        width: "60",
        render: (rowData) => page * rowsPerPage + (rowData.tableData.id + 1),
        headerStyle: {
          minWidth: "60px",
          paddingRight: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "60px",
          paddingRight: "50px",
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
              if (method === 0) {
                this.props.getLoading(true);
                getById(rowData.id)
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
        title: t("specimen.code"),
        field: "niheCode",
        width: "150",
        headerStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "100px",
          // paddingLeft: "10px",
          paddingRight: "0px",
          textAlign: "center",
        },
      },
      {
        title: t("specimen.numberOfTest"),
        field: "numberOfTests",
        width: "150",
        headerStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "100px",
          // paddingLeft: "10px",
          paddingRight: "0px",
          textAlign: "center",
        },
      },
      {
        title: t("specimen.type"),
        field: "specimenType.name", //nó đang là 1 đối tượng -> chuyển 1 trường trong 1 đói tượng
        align: "left",
        width: "150",
        headerStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "100px",
          // paddingLeft: "10px",
          paddingRight: "0px",
          textAlign: "center",
        },
      },
      {
        title: t("Mã bệnh nhân"),
        field: "patientCode",
        width: "150",
        headerStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "100px",
          // paddingLeft: "10px",
          paddingRight: "0px",
          textAlign: "center",
        },
      },
      // {
      //   title: t("Loại mẫu"),
      //   field: "specimenType",
      //   align: "left",
      //   width: "150",
      //   headerStyle: {
      //     minWidth: "100px",
      //     paddingRight: "0px",
      //     textAlign: "center",
      //   },
      //   cellStyle: {
      //     minWidth: "100px",
      //     // paddingLeft: "10px",
      //     paddingRight: "0px",
      //     textAlign: "center",
      //   },
      //   render: rowData => this.specimenTypeString(rowData.specimenType)
      // },
      {
        title: t("specimen.specimenDate"),
        field: "specimenDate",
        align: "center",
        width: "150",
        headerStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "100px",
          // paddingLeft: "10px",
          paddingRight: "0px",
          // textAlign: "center",
        },
        render: (rowData) =>
          rowData.specimenDate ? (
            <span>{moment(rowData.specimenDate).format("DD/MM/YYYY")}</span>
          ) : (
            ""
          ),
      },
      {
        title: t("specimen.receiverDate"),
        field: "receiverDate",
        align: "center",
        width: "150",
        headerStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "100px",
          // paddingLeft: "10px",
          paddingRight: "0px",
          // textAlign: "center",
        },
        render: (rowData) =>
          rowData.receiverDate ? (
            <span>{moment(rowData.receiverDate).format("DD/MM/YYYY")}</span>
          ) : (
            ""
          ),
      },
      {
        title: t("specimen.status"),
        field: "specimenStatus",
        align: "center",
        width: "150",
        headerStyle: {
          minWidth: "100px",
          paddingRight: "0px",
        },
        cellStyle: {
          minWidth: "100px",
          // paddingLeft: "10px",
          paddingRight: "0px",
          // textAlign: "center",
        },
        render: (rowData) => this.specimenStatusString(rowData.specimenStatus),
      },
    ];

    return (
      <div className="m-sm-30">
        <div className="mb-sm-30">
          <Breadcrumb routeSegments={[{ name: t("specimen.titleName") }]} />
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
                  });
                }}
              >
                {t("general.add")}
              </Button>
              <Button
                className="mb-16 mr-36 align-bottom"
                variant="contained"
                color="primary"
                onClick={() =>
                  this.setState({ shouldOpenConfirmationDeleteAllDialog: true })
                }
              >
                {t("general.delete")}
              </Button>
              {/* import excel */}
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
            {shouldOpenConfirmationDeleteAllDialog && (
              <ConfirmationDialog
                open={shouldOpenConfirmationDeleteAllDialog}
                onConfirmDialogClose={this.handleDialogClose}
                onYesClick={this.handleDeleteAll}
                title={t("general.confirm")}
                text={t("Xác nhận xóa")}
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
                <SpecimenFilter handleFilter={this.handleFilter} t={t} />
              </Collapse>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <div>
              {shouldOpenEditorDialog && (
                <SpecimenEditorDialog
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
                  uploadUrl={  ConstantList.API_ENPOINT + "/api/uploadExcel/specimen/false" }
                  saveListDataUrl = { ConstantList.API_ENPOINT + "/api/specimen/saveOrUpdateList"} 
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

              {this.state.openPopupShowResult && (
                <NotificationPopup
                  title={t("general.noti")}
                  open={this.state.openPopupShowResult}
                  onYesClick={this.handleDialogClose}
                  text={this.state.textPopup}
                  size="lg"
                  agree={t("general.agree")}
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
          {showOpenDialogError && (
            <NotificationPopup
              title={t("general.noti")}
              open={this.state.showOpenDialogError}
              onYesClick={this.setState({ showOpenDialogError: false })}
              text={"Đã có lỗi hệ thống"}
              size="lg"
              agree={t("confirm")}
            />
          )}
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
export default connect(mapStateToProps, mapDispatch)(Specimen);

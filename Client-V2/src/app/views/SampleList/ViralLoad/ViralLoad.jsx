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
} from "@material-ui/core";
import MaterialTable, {
  MTableToolbar,
} from "material-table";
import {
  deleteItem,
  searchByPage,
  getById,
  exportLabTestToExcel,
} from "../SampleListService";
import ViralLoadEditorDialog from "./ViralLoadEditorDialog";
import { Breadcrumb, ConfirmationDialog } from "egret";
import { useTranslation } from "react-i18next";
import SearchIcon from "@material-ui/icons/Search";
import { saveAs } from "file-saver";
import UploadExcelDialog from "../../uploadExcel/UploadFormPopupProperties";
import ConstantList from "../../../appConfig";
import { toast } from "react-toastify";
import moment from "moment";
import { connect } from "react-redux";
import { getLoading } from "../../../redux/actions/LoadingActions";

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
          print
        </Icon>
      </IconButton>
    </div>
  )
};

class ViralLoad extends Component {
  state = {
    keyword: "",
    rowsPerPage: 10,
    page: 0,
    item: {},
    testType: "VL",
    shouldOpenEditorDialog: false,
    shouldOpenConfirmationDialog: false,
    selectAllItem: false,
    selectedList: [],
    totalElements: 0,
    shouldOpenConfirmationDeleteAllDialog: false,
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

  search() {
    this.props.getLoading(true);
    this.setState({ page: 0 }, function () {
      var searchObject = {};
      searchObject.text = this.state.keyword;
      searchObject.pageIndex = this.state.page + 1;
      searchObject.pageSize = this.state.rowsPerPage;
      searchObject.testType = this.state.testType;
      searchByPage(searchObject).then(({ data }) => {
        let itemListClone = [...data.content];
        this.setState({
          itemList: itemListClone,
          totalElements: data.totalElements,
        });
        this.props.getLoading(false);
      }).catch(() => {
        toast.error("Đã có lỗi hệ thống");
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
    searchObject.testType = this.state.testType;
    searchByPage(searchObject).then(({ data }) => {
      let itemListClone = [...data.content];
      this.setState({
        itemList: itemListClone,
        totalElements: data.totalElements,
      });
      this.props.getLoading(false);
    }).catch(() => {
      toast.error("Đã có lỗi hệ thống");
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
    deleteItem(this.state.id).then(() => {
      this.updatePageData();
      this.handleDialogClose();
    });
  };

  componentDidMount() {
    this.updatePageData();
  };

  handleExportExcel = (id, code) => {
    if (id != null) {
      exportLabTestToExcel(id)
        .then((res) => {
          toast.success(this.props.t("general.successExport"));
          let blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
          });
          saveAs(blob, "XuatPhieu_" + code + ".xlsx");
        })
        .catch((err) => {});
    }
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

  async handleDeleteList(list) {
    for (var i = 0; i < list.length; i++) {
      await deleteItem(list[i].id);
    }
  }

  handleDeleteAll = (event) => {
    this.handleDeleteList(this.data).then(() => {
      this.updatePageData();
      this.handleDialogClose();
    });
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
        title: t("general.action"),
        field: "custom",
        align: "left",
        width: "250",
        headerStyle: {
          minWidth: "70px",
          paddingRight: "0px",
          paddingLeft: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "70px",
          paddingRight: "0px",
          paddingLeft: "0px",
          textAlign: "center",
        },
        render: (rowData) => (
          <MaterialButton
            item={rowData}
            onSelect={(rowData, method) => {
              if (method === 0) {
                this.props.getLoading(true);
                getById(rowData.id).then(({ data }) => {
                  if (data.parent === null) {
                    data.parent = {};
                  }
                  this.setState({
                    item: data,
                    shouldOpenEditorDialog: true,
                  });
                  this.props.getLoading(false);
                }).catch(() => {
                  toast.error("Đã có lỗi hệ thống");
                  this.props.getLoading(false);
                });
              } else if (method === 1) {
                this.handleExportExcel(rowData.id, rowData.code);
              } else {
                alert("Call Selected Here:" + rowData.id);
              }
            }}
          />
        ),
      },
      {
        title: t("viralLoad.code"),
        field: "code",
        width: "150",
        headerStyle: {
          minWidth: "150px",
          paddingRight: "0px",
          paddingLeft: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "150px",
          paddingRight: "0px",
          paddingLeft: "0px",
          textAlign: "center",
        },
      },

      {
        title: t("viralLoad.testDate"),
        field: "testDate",
        align: "center",
        width: "150",
        headerStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          paddingLeft: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          paddingLeft: "0px",
        },
        render: (rowData) =>
          rowData.testDate ? (
            <span>{moment(rowData.testDate).format("DD/MM/YYYY")}</span>
          ) : (
            ""
          ),
      },
      {
        title: t("Ngày có kết quả"),
        field: "resultDate",
        align: "center",
        width: "150",
        headerStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          paddingLeft: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          paddingLeft: "0px",
        },
        render: (rowData) =>
          rowData.resultDate ? (
            <span>{moment(rowData.resultDate).format("DD/MM/YYYY")}</span>
          ) : (
            ""
          ),
      },
      {
        title: t("viralLoad.performer"),
        field: "performer",
        align: "center",
        width: "150",
        headerStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          paddingLeft: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          paddingLeft: "0px",
        },
      },
      {
        title: t("viralLoad.auditor"),
        field: "auditor",
        align: "center",
        width: "150",
        headerStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          paddingLeft: "0px",
        },
        cellStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          paddingLeft: "0px",
        },
      },
      {
        title: t("viralLoad.reagent"),
        field: "reagent.name",
        align: "center",
        width: "150",
        headerStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          paddingLeft: "0px",
        },
        cellStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          paddingLeft: "0px",
        },
      },
      {
        title: t("viralLoad.testMachine"),
        field: "testMachine.name",
        align: "center",
        width: "150",
        headerStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          paddingLeft: "0px",
        },
        cellStyle: {
          minWidth: "100px",
          paddingRight: "0px",
          paddingLeft: "0px",
        },
      },
    ];

    return (
      <div className="m-sm-30">
        <div className="mb-sm-30">
          <Breadcrumb routeSegments={[{ name: t("viralLoad.title") }]} />
        </div>

        <Grid container spacing={3}>
          <Grid item xs={12} container spacing={2}>
            <Grid md={4} sm={12}>
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

            <Grid item lg={4} md={4} sm={12} xs={12}></Grid>
            {shouldOpenConfirmationDeleteAllDialog && (
              <ConfirmationDialog
                open={shouldOpenConfirmationDeleteAllDialog}
                onConfirmDialogClose={this.handleDialogClose}
                onYesClick={this.handleDeleteAll}
                title={t("general.confirm")}
                text={t("general.DeleteAllConfirm")}
                Yes={t("general.Yes")}
                No={t("general.No")}
              />
            )}
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
          </Grid>
          <Grid item xs={12}>
            <div>
              {shouldOpenEditorDialog && (
                <ViralLoadEditorDialog
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
                    "/api/uploadExcel/lab-test-result/false"
                  }
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
export default connect(mapStateToProps, mapDispatch)(ViralLoad);
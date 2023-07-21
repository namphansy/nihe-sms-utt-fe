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
  Chip,
  MTableBody,
  MTableHeader,
} from "material-table";
import {
  deleteItem,
  searchByPage,
  getById,
  exportSpeOver18MById,
  exportSpeOver18MByIdPDF,
} from "./SpecimenOver18mEIDService";
import SpecimenOver18mEIDDialog from "./SpecimenOver18mEIDDialog";
import { Breadcrumb, ConfirmationDialog } from "egret";
import { useTranslation, withTranslation, Trans } from "react-i18next";
import SearchIcon from "@material-ui/icons/Search";
import UploadFormPopupProperties from "./UploadFormPopupProperties";
import { saveAs } from "file-saver";
import moment from "moment";
import ConstantList from "../../appConfig";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
      <IconButton size="small" onClick={() => props.onSelect(item, 1)}>
        <Icon fontSize="small" color="error">
          delete
        </Icon>
      </IconButton>
      <IconButton size="small" onClick={() => props.onSelect(item, 3)}>
        <Icon fontSize="small" color="error">
          print
        </Icon>
      </IconButton>
      <IconButton size="small" onClick={() => props.onSelect(item, 4)}>
        <Icon fontSize="small" color="error">
          picture_as_pdf
        </Icon>
      </IconButton>
    </div>
  );
}

class SpecimenOver18mEID extends Component {
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
      searchObject.belongTo = 2; // mẫu thuộc về EID
      searchObject.patientType = ConstantList.adults;
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
    searchObject.belongTo = 2; // mẫu thuộc về EID
    searchObject.patientType = ConstantList.adults;
    searchByPage(searchObject).then(({ data }) => {
      let itemListClone = [...data.content];
      this.setState({
        itemList: itemListClone,
        totalElements: data.totalElements,
      });
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
    this.setState({
      shouldOpenEditorDialog: false,
      shouldOpenConfirmationDialog: false,
      shouldOpenConfirmationDeleteAllDialog: false,
      shouldOpenUploadExcelResultDialog: false,
    });
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
    deleteItem(this.state.id)
      .then(() => {
        this.updatePageData();
        this.handleDialogClose();
        toast.success(t("deleteSuccess"));
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
  }

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

  exportSpeOver18MById = (id) => {
    this.props.getLoading(true);
    if (id != null) {
      exportSpeOver18MById(id)
        .then((res) => {
          toast.success(this.props.t("general.successExport"));
          let blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
          });
          saveAs(blob, " PHIẾU XÉT NGHIỆM PCR ĐỊNH TÍNH HIV CHO TRẺ" + ".xlsx");
          this.props.getLoading(false);
        })
        .catch((err) => {
          this.props.getLoading(false);
        });
    }
  };

  exportSpeOver18MByIdPDF = (id) => {
    this.props.getLoading(true);
    if (id != null) {
      exportSpeOver18MByIdPDF(id)
        .then((res) => {
          toast.success(this.props.t("general.successExport"));
          let blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
          });
          saveAs(blob, " PHIẾU XÉT NGHIỆM PCR ĐỊNH TÍNH HIV CHO TRẺ" + ".pdf");
          this.props.getLoading(false);
        })
        .catch((err) => {
          this.props.getLoading(false);
        });
    }
  };

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
      page,
      rowsPerPage,
      itemList,
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
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "60px",
          paddingRight: "40px",
          textAlign: "center",
        },
      },
      {
        title: t("specimen.action"),
        field: "custom",
        align: "left",
        width: "250",
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
                });
              } else if (method === 1) {
                this.handleDelete(rowData.id);
              } else if (method === 3) {
                this.exportSpeOver18MById(rowData.id);
              } else if (method === 4) {
                this.exportSpeOver18MByIdPDF(rowData.id);
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
        title: t("specimen.patientName"),
        field: "patient.fullName",
        width: "150",
        headerStyle: {
          minWidth: "100px",
          paddingLeft: "0px",
          paddingRight: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "100px",
          paddingLeft: "0px",
          paddingRight: "0px",
          textAlign: "center",
        },
      },
      {
        title: t("specimen.birthDate"),
        field: "patient.birthDate",
        width: "150",
        headerStyle: {
          minWidth: "100px",
          paddingLeft: "0px",
          paddingRight: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "100px",
          paddingLeft: "0px",
          paddingRight: "0px",
          textAlign: "center",
        },
        render: (rowData) =>
          rowData.patient?.birthDate ? (
            <span>
              {moment(rowData.patient?.birthDate).format("DD/MM/YYYY")}
            </span>
          ) : rowData?.patient?.manualBirthDate ? (
            rowData?.patient?.manualBirthDate
          ) : (
            ""
          ),
      },
      // {
      //   title: t("specimen.type"),
      //   field: "specimenType.name",
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
          <Breadcrumb routeSegments={[{ name: t("specimenOver18M.title") }]} />
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
              {/* import excel */}
              {/* <Button
                className="mb-16 mr-16 align-bottom"
                variant="contained"
                color="primary"
                onClick={() =>
                  this.setState({ shouldOpenUploadExcelResultDialog: true })
                }
              >
                {t("general.importExcel")}
              </Button> */}
            </Grid>

            <Grid item lg={4} md={4} sm={12} xs={12}></Grid>
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
                <SpecimenOver18mEIDDialog
                  t={t}
                  i18n={i18n}
                  handleClose={this.handleDialogClose}
                  open={shouldOpenEditorDialog}
                  handleOKEditClose={this.handleOKEditClose}
                  item={this.state.item ? this.state.item : {}}
                />
              )}
              {this.state.shouldOpenUploadExcelResultDialog && (
                <UploadFormPopupProperties
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
                    ConstantList.API_ENPOINT + "/api/uploadExcel/specimen/true"
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
export default connect(mapStateToProps, mapDispatch)(SpecimenOver18mEID);

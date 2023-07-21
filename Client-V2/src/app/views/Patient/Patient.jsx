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
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";
import MaterialTable, {
  MTableToolbar,
} from "material-table";
import { deleteItem, searchByPage, getOne, deleteByList } from "./PatientServices";
import HivPatientDialog from "./PatientDialog";
import { Breadcrumb, ConfirmationDialog } from "egret";
import Constant from "./Constant";
import { useTranslation, withTranslation, Trans } from "react-i18next";
import SearchIcon from "@material-ui/icons/Search";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import moment from "moment";
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
}

class Patient extends Component {
  state = {
    keyword: "",
    rowsPerPage: 10,
    page: 0,
    orgType: 0,
    item: {},
    shouldOpenEditorDialog: false,
    shouldOpenConfirmationDialog: false,
    shouldOpenConfirmDialog: false,
    selectAllItem: false,
    selectedList: [],
    totalElements: 0,
    shouldOpenConfirmationDeleteAllDialog: false,
    openPopupShowResult: false
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
      searchObject.usingSms = this.state.usingSms;
      searchByPage(searchObject).then(({ data }) => {
        let itemListClone = [...data.content];
        this.setState({
          itemList: itemListClone,
          totalElements: data.totalElements,
        });
        this.props.getLoading(false);
      }).catch(() => {
        this.props.getLoading(false);
        toast.warning("Đã có lỗi khi xóa");
        this.handleDialogClose();
      });
    });
  }

  updatePageData = () => {
    this.props.getLoading(true);
    var searchObject = {};
    searchObject.text = this.state.keyword;
    searchObject.pageIndex = this.state.page + 1;
    searchObject.pageSize = this.state.rowsPerPage;
    searchObject.orgType = this.state.orgType;
    searchByPage(searchObject).then(({ data }) => {
      var treeValues = [];
      let itemListClone = [...data.content];
      itemListClone.forEach((item) => {
        var items = this.getListItemChild(item);
        treeValues.push(...items);
      });
      this.setState({
        itemList: itemListClone,
        totalElements: data.totalElements,
      });
      this.props.getLoading(false);
    }).catch(() => {
      this.props.getLoading(false);
      toast.warning("Đã có lỗi khi xóa");
      this.handleDialogClose();
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
      openPopupShowResult: false
    }, () => {
      this.updatePageData();
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
    this.props.getLoading(true);
    deleteItem(this.state.id)
      .then((result) => {
        if (result.data) {
          this.updatePageData();
          toast.success("Xóa thành công");
        } else {
          toast.warning("Bệnh nhân đã có mẫu xét nghiệm không thể xóa");
        }
        this.handleDialogClose();
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
    console.log(item);
  };

  async handleDeleteList(list) {
    for (var i = 0; i < list.length; i++) {
      await deleteItem(list[i].id);
    }
  }

  handleChangeOrgType = (event, source) => {
    if (source === "orgType") {
      let orgType = this.state;

      orgType = event.target.value; // set value cho orgType
      console.log(orgType);
      this.setState({ orgType: orgType }, () => {
        // set var orgType là orgType
        this.search();
      });
      return;
    }
  };

  handleChangeUsingSms = (event, source) => {
    if (source === "usingSms") {
      // console.log("sssss");
      let usingSms = this.state;
      if (event.target.value === -1) {
        event.target.value = null;
      }
      usingSms = event.target.value;
      console.log(usingSms);
      this.setState({ usingSms: usingSms }, () => {
        this.search();
      });
      return;
    }
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
        this.props.getLoading(false);
        this.updatePageData();
      });
  };

  getListItemChild(item) {
    // debugger
    var result = [];
    var root = {};
    root.name = item.name;
    root.code = item.code;
    root.id = item.id;
    root.description = item.description;
    root.displayOrder = item.displayOrder;
    root.foundedDate = item.foundedDate;
    root.parentId = item.parentId;
    result.push(root);
    if (item.children) {
      item.children.forEach((child) => {
        var childs = this.getListItemChild(child);
        result.push(...childs);
      });
    }
    return result;
  }

  listGender = (value) => {
    let name = "";
    if (value === "M") {
      name = "Nam";
    } else if (value === "F") {
      name = "Nữ";
    } else if (value === "U") {
      name = "Không rõ";
    }
    return name;
  };

  usingSmsStatus = (value) => {
    let name = "";
    if (value === true) {
      name = "Có sử dụng";
    } else if (value == false) {
      name = "Không sử dụng";
    }
    return name;
  };

  patientType = (value) => {
    let name = " ";
    if (value === 1) {
      name = "Bệnh nhân dưới 18 tháng tuổi";
    } else if (value === 2) {
      name = "Bệnh nhân trên 18 tháng tuổi";
    } else if (value === 3) {
      name = "Bệnh nhân đang điều trị HIV";
    }
    return name;
  };

  render() {
    const { t, i18n } = this.props;
    let {
      keyword,
      rowsPerPage,
      page,
      orgType,
      totalElements,
      itemList,
      usingSms,
      item,
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
          paddingRight: "35x",
          textAlign: "center",
        },
      },
      {
        title: t("general.action"),
        field: "custom",
        align: "left",
        width: "80",
        headerStyle: {
          minWidth: "80px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "80px",
          paddingRight: "0px",
          textAlign: "left",
        },
        render: (rowData) => (
          <MaterialButton
            item={rowData}
            onSelect={(rowData, method) => {
              console.log(rowData);
              if (method === 0) {
                this.props.getLoading(true);
                getOne(rowData.id).then(({ data }) => {
                  if (data.parent === null) {
                    data.parent = {};
                  }
                  this.setState({
                    item: data,
                    shouldOpenEditorDialog: true,
                  });
                  this.props.getLoading(false);
                }).catch(() => {
                  this.props.getLoading(false);
                  toast.warning("Đã có lỗi khi xóa");
                  this.handleDialogClose();
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
        title: t("patient.code"),
        field: "patientCode",
        align: "center",
        width: "80",
        headerStyle: {
          minWidth: "80px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "80px",
          paddingRight: "0px",
          textAlign: "left",
        },
      },
      {
        title: t("patient.name"),
        field: "fullName",
        align: "center",
        width: "160",
        headerStyle: {
          minWidth: "160px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "160px",
          paddingRight: "0px",
          textAlign: "left",
        },
      },

      {
        title: t("patient.type"),
        field: "type",
        align: "center",
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
        render: (rowData) => this.patientType(rowData.type),
      },
      {
        title: t("general.dob"),
        field: "birthDate",
        align: "center",
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
        render: (rowData) =>
          rowData.birthDate ? (
            <span>{moment(rowData.birthDate).format("DD/MM/YYYY")}</span>
          ) : (
            <span>
              {rowData.manualBirthDate ? rowData.manualBirthDate : ""}
            </span>
          ),
      },
      {
        title: t("patient.gender"),
        field: "gender",
        align: "center",
        width: "50",
        headerStyle: {
          minWidth: "50px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "50px",
          paddingRight: "0px",
          textAlign: "left",
        },
        render: (rowData) => this.listGender(rowData.gender),
      },
      {
        title: t("patient.address"),
        field: "address",
        align: "center",
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
      },
      {
        title: t("patient.phone"),
        field: "phone",
        align: "center",
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
      {
        title: t("patient.useSms"),
        field: "usingSms",
        align: "center",
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
        render: (rowData) => this.usingSmsStatus(rowData.usingSms),
      },
    ];

    return (
      <div className="m-sm-30">
        <div className="mb-sm-30">
          <Breadcrumb routeSegments={[{ name: t("patient.titleHIV") }]} />
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
            </Grid>

            <Grid item lg={4} md={4} sm={12} xs={12}>
              <FormControl
                fullWidth={true}
                className="mb-32"
                variant="outlined"
                size="small"
              >
                <InputLabel htmlFor="usingSms-simple">
                  {t("patient.useSms")}
                </InputLabel>
                <Select
                  value={usingSms}
                  label={t("patient.useSms")}
                  // style={{marginBottom: '16px'}}
                  onChange={(usingSms) =>
                    this.handleChangeUsingSms(usingSms, "usingSms")
                  }
                  inputProps={{
                    name: "usingSms",
                    id: "usingSms-simple",
                  }}
                >
                  <MenuItem key={-1} value={-1}>
                    Hiện tất cả
                  </MenuItem>
                  {Constant.listSmsType.map((item) => {
                    return (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            {shouldOpenConfirmationDeleteAllDialog && (
              <ConfirmationDialog
                open={shouldOpenConfirmationDeleteAllDialog}
                onConfirmDialogClose={this.handleDialogClose}
                onYesClick={this.handleDeleteAll}
                title={t("general.confirm")}
                text={"Xóa bản ghi đã chọn"}
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
                <HivPatientDialog
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
                // this.setState({selectedItems:rows});
              }}
              actions={[
                {
                  tooltip: "Xóa bản ghi đã chọn",
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
export default connect(mapStateToProps, mapDispatch)(Patient);

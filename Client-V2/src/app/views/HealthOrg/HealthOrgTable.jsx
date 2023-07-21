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
} from "@material-ui/core";
import MaterialTable, {
  MTableToolbar,
  Chip,
  MTableBody,
  MTableHeader,
} from "material-table";
import {
  getAllEQAHealthOrgTypes,
  deleteItem,
  searchByPage,
  getOne,
} from "./HealthOrgService";
import HealthOrgEditorDialog from "./HealthOrgEditorDialog";
import { Breadcrumb, ConfirmationDialog } from "egret";
import Constant from "./Constant";
import { useTranslation, withTranslation, Trans } from "react-i18next";
import SearchIcon from "@material-ui/icons/Search";
import { saveAs } from "file-saver";
import { connect } from "react-redux";
import { getLoading } from "../../redux/actions/LoadingActions";

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

class HealthOrgLevelTable extends Component {
  state = {
    keyword: "",
    rowsPerPage: 10,
    page: 0,
    orgType: 0,
    eQAHealthOrgType: [],
    item: {},
    shouldOpenEditorDialog: false,
    shouldOpenConfirmationDialog: false,
    selectAllItem: false,
    selectedList: [],
    totalElements: 0,
    shouldOpenConfirmationDeleteAllDialog: false,
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

  search() {
    this.props.getLoading(true);
    this.setState({ page: 0 }, function () {
      var searchObject = {};
      searchObject.text = this.state.keyword;
      searchObject.pageIndex = this.state.page + 1;
      searchObject.pageSize = this.state.rowsPerPage;
      searchObject.orgType = this.state.orgType;
      searchByPage(searchObject).then(({ data }) => {
        // this.setState({ itemList: [...data.content], totalElements: data.totalElements })
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
      // this.setState({ itemList: [...data.content], totalElements: data.totalElements })
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
    });
  };

  handleOKEditClose = () => {
    this.setState({
      shouldOpenEditorDialog: false,
      shouldOpenConfirmationDialog: false,
    });
    this.updatePageData();
  };

  handleDeleteEQAHealthOrgType = (id) => {
    this.setState({
      id,
      shouldOpenConfirmationDialog: true,
    });
  };

  handleEditEQAHealthOrgType = (item) => {
    getOne(item.id).then((result) => {
      this.setState({
        item: result.data,
        shouldOpenEditorDialog: true,
      });
    });
  };

  handleConfirmationResponse = () => {
    deleteItem(this.state.id).then(() => {
      this.updatePageData();
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

  handleClick = (event, item) => {
    let { eQAHealthOrgType } = this.state;
    if (item.checked == null) {
      item.checked = true;
    } else {
      item.checked = !item.checked;
    }
    var selectAllItem = true;
    for (var i = 0; i < eQAHealthOrgType.length; i++) {
      if (
        eQAHealthOrgType[i].checked == null ||
        eQAHealthOrgType[i].checked == false
      ) {
        selectAllItem = false;
      }
      if (eQAHealthOrgType[i].id == item.id) {
        eQAHealthOrgType[i] = item;
      }
    }
    this.setState({
      selectAllItem: selectAllItem,
      eQAHealthOrgType: eQAHealthOrgType,
    });
  };
  handleSelectAllClick = (event) => {
    let { eQAHealthOrgType } = this.state;
    for (var i = 0; i < eQAHealthOrgType.length; i++) {
      eQAHealthOrgType[i].checked = !this.state.selectAllItem;
    }
    this.setState({
      selectAllItem: !this.state.selectAllItem,
      eQAHealthOrgType: eQAHealthOrgType,
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
  handleChangeOrgType = (event, source) => {
    if (source === "orgType") {
      let orgType = this.state;
      orgType = event.target.value;
      this.setState({ orgType: orgType }, () => {
        this.search();
      });
      return;
    }
  };
  handleDeleteAll = (event) => {
    //alert(this.data.length);
    this.handleDeleteList(this.data).then(() => {
      this.updatePageData();
      this.handleDialogClose();
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
  render() {
    const { t, i18n } = this.props;
    let {
      keyword,
      rowsPerPage,
      page,
      orgType,
      totalElements,
      itemList,
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
        render: (rowData) => (
          <MaterialButton
            item={rowData}
            onSelect={(rowData, method) => {
              if (method === 0) {
                getOne(rowData.id).then(({ data }) => {
                  if (data.parent === null) {
                    data.parent = {};
                  }
                  this.setState({
                    item: data,
                    shouldOpenEditorDialog: true,
                  });
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
        title: t("org.name"),
        field: "name",
        align: "center",
        width: "150",
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
        title: t("org.code"),
        field: "code",
        align: "center",
        width: "150",
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
        title: t("org.type"),
        headerStyle: {
          minWidth: "200px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "150px",
          paddingRight: "0px",
          textAlign: "left",
        },

        field: "orgType",
        align: "center",
        width: "150",
        render: (rowData) =>
          rowData.orgType == 1 ? (
            <p>Đơn vị xét nghiệm</p>
          ) : rowData.orgType == 2 ? (
            <p>Đơn vị lấy mẫu</p>
          ) : (
            ""
          ),
      },
      {
        title: t("org.phone"),
        field: "phone",
        align: "center",
        width: "150",
        headerStyle: {
          minWidth: "200px",
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
        title: t("org.address"),
        field: "address",
        align: "center",
        width: "150",
        headerStyle: {
          minWidth: "200px",
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
        title: t("org.email"),
        field: "email",
        align: "center",
        width: "150",
        headerStyle: {
          minWidth: "200px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "150px",
          paddingRight: "0px",
          textAlign: "left",
        },
      },
    ];

    return (
      <div className="m-sm-30">
        <div className="mb-sm-30">
          <Breadcrumb
            routeSegments={[
              { name: t("Dashboard.category"), path: "/directory/apartment" },
              { name: t("healthOrg.title") },
            ]}
          />
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
                variant="standard"
                size="small"
              >
                <InputLabel htmlFor="sampleType-simple">
                  {t("org.type")}
                </InputLabel>
                <Select
                  value={orgType}
                  label={t("org.type")}
                  // style={{marginBottom: '16px'}}
                  onChange={(orgType) =>
                    this.handleChangeOrgType(orgType, "orgType")
                  }
                  inputProps={{
                    name: "sampleType",
                    id: "sampleType-simple",
                  }}
                >
                  <MenuItem key={0} value={0}>
                    Hiện tất cả
                  </MenuItem>
                  {Constant.listOrgType.map((item) => {
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
                text={t("general.DeleteAllConfirm")}
                Yes={t("general.Yes")}
                No={t("general.No")}
              />
            )}
            <Grid item lg={4} md={4} sm={12} xs={12}>
              {/* <TextField
                label={t('EnterSearch')}
                className="mb-16 mr-10"
                type="text"
                name="keyword"
                value={keyword}
                onKeyDown={this.handleKeyDownEnterSearch}
                onChange={this.handleTextChange} />
              <Button
                className="mb-16 mr-16 align-bottom"
                variant="contained"
                color="primary" onClick={() => this.search(keyword)}>
                {t('Tìm kiếm')}
              </Button> */}
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
                <HealthOrgEditorDialog
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
                  title={t("general.confirm")}
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
export default connect(mapStateToProps, mapDispatch)(HealthOrgLevelTable);

import React, { Component } from "react";
import moment from "moment";
import {
  IconButton,
  Grid,
  Radio,
  Icon,
  TablePagination,
  Button,
  TextField,
  InputAdornment,
  Input,
  Checkbox,
} from "@material-ui/core";
import MaterialTable, {
  MTableToolbar,
  Chip,
  MTableBody,
  MTableHeader,
} from "material-table";
import {
  getAllReagents,
  deleteItem,
  searchAppConfig,
  getItemById,
} from "./appConfigService";
import AppConfigEditorDialog from "./appConfigDialog";
import { Breadcrumb, ConfirmationDialog } from "egret";
import { useTranslation, withTranslation, Trans } from "react-i18next";
import { withStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import shortid from "shortid";
import { saveAs } from "file-saver";
import { Link } from "react-router-dom";
import SearchIcon from "@material-ui/icons/Search";
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
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

function MaterialButton(props) {
  const { t, i18n } = useTranslation();
  const item = props.item;
  return (
    <div className="none_wrap">
      <LightTooltip
        title={t("Edit")}
        placement="right-end"
        enterDelay={300}
        leaveDelay={200}
        PopperProps={{
          popperOptions: {
            modifiers: { offset: { enabled: true, offset: "10px, 0px" } },
          },
        }}
      >
        <IconButton size="small" onClick={() => props.onSelect(item, 0)}>
          <Icon fontSize="small" color="primary">
            edit
          </Icon>
        </IconButton>
      </LightTooltip>
      <LightTooltip
        title={t("Delete")}
        placement="right-end"
        enterDelay={300}
        leaveDelay={200}
        PopperProps={{
          popperOptions: {
            modifiers: { offset: { enabled: true, offset: "10px, 0px" } },
          },
        }}
      >
        <IconButton size="small" onClick={() => props.onSelect(item, 1)}>
          <Icon fontSize="small" color="error">
            delete
          </Icon>
        </IconButton>
      </LightTooltip>
    </div>
  );
}

class appConfig extends Component {
  state = {
    keyword: "",
    rowsPerPage: 10,
    page: 0,
    reagentList: [],
    item: {},
    shouldOpenEditorDialog: false,
    shouldOpenConfirmationDialog: false,
    selectAllItem: false,
    selectedList: [],
    totalElements: 0,
    shouldOpenConfirmationDeleteAllDialog: false,
    loading: true,
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
    this.setState({ page: 0 }, function () {
      var searchObject = {};
      searchObject.text = this.state.keyword;
      searchObject.pageIndex = this.state.page + 1;
      searchObject.pageSize = this.state.rowsPerPage;
      searchAppConfig(
        searchObject,
        this.state.page,
        this.state.rowsPerPage
      ).then(({ data }) => {
        this.setState({
          itemList: [...data.content],
          totalElements: data.totalElements,
          loading: false,
        });
      });
    });
  }

  updatePageData = () => {
    var searchObject = {};
    searchObject.text = this.state.keyword;
    searchObject.pageIndex = this.state.page + 1;
    searchObject.pageSize = this.state.rowsPerPage;
    searchAppConfig(searchObject, this.state.page, this.state.rowsPerPage).then(
      ({ data }) => {
        if (data.content.length == 0 && this.state.page != 0) {
          this.setPage(0);
        }
        this.setState({
          itemList: [...data.content],
          totalElements: data.totalElements,
          loading: false,
        });
      }
    );
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
    // this.setPage(0);
  };

  handleOKEditClose = () => {
    this.setState({
      shouldOpenEditorDialog: false,
      shouldOpenConfirmationDialog: false,
    });
    this.updatePageData();
  };

  handleDeleteReagent = (id) => {
    this.setState({
      id,
      shouldOpenConfirmationDialog: true,
    });
  };

  handleEditReagent = (item) => {
    getItemById(item.id).then((result) => {
      this.setState({
        item: result.data,
        shouldOpenEditorDialog: true,
      });
    });
  };

  handleConfirmationResponse = () => {
    let { t } = this.props;
    deleteItem(this.state.id)
      .then(() => {
        this.updatePageData();
        this.handleDialogClose();
        toast.success(t("deleteSuccess"));
      })
      .catch(() => {
        toast.warning(t("error"));
        this.handleDialogClose();
      });
  };

  componentDidMount() {
    this.updatePageData();
  }

  handleClick = (event, item) => {
    let { reagentList } = this.state;
    if (item.checked == null) {
      item.checked = true;
    } else {
      item.checked = !item.checked;
    }
    var selectAllItem = true;
    for (var i = 0; i < reagentList.length; i++) {
      if (reagentList[i].checked == null || reagentList[i].checked == false) {
        selectAllItem = false;
      }
      if (reagentList[i].id == item.id) {
        reagentList[i] = item;
      }
    }
    this.setState({ selectAllItem: selectAllItem, reagentList: reagentList });
  };

  handleSelectAllClick = (event) => {
    let { reagentList } = this.state;
    for (var i = 0; i < reagentList.length; i++) {
      reagentList[i].checked = !this.state.selectAllItem;
    }
    this.setState({
      selectAllItem: !this.state.selectAllItem,
      reagentList: reagentList,
    });
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
    let { t } = this.props;
    let demSuccess = 0,
      demError = 0;
    for (var i = 0; i < list.length; i++) {
      await deleteItem(list[i].id)
        .then((res) => {
          demSuccess++;
          // toast.success(t("deleteSuccess") + " " + list[i].code);
          this.updatePageData();
          this.handleDialogClose();
        })
        .catch((err) => {
          demError++;
          // toast.warning(t('error'));
          this.handleDialogClose();
        });
    }
    if (demSuccess != 0) {
      toast.success(t("deleteSuccess") + " " + demSuccess);
    }
    if (demError != 0) {
      toast.warning(t("error") + " " + demError);
    }
  }

  handleDeleteAll = (event) => {
    let { t } = this.props;
    if (this.data != null) {
      this.handleDeleteList(this.data).then(() => {
        this.updatePageData();
        this.handleDialogClose();
      });
    } else {
      toast.warning(t("general.select_data"));
      this.handleDialogClose();
    }
  };

  render() {
    const { t, i18n } = this.props;
    let {
      keyword,
      rowsPerPage,
      page,
      totalElements,
      itemList,
      item,
      shouldOpenConfirmationDialog,
      shouldOpenEditorDialog,
      shouldOpenConfirmationDeleteAllDialog,
      loading,
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
        title: t("Action"),
        field: "custom",
        align: "center",
        width: "250",
        headerStyle: {
          paddingLeft: "20px",
          paddingRight: "0px",
        },
        cellStyle: {
          paddingLeft: "10px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: { whiteSpace: "nowrap" },
        render: (rowData) => (
          <MaterialButton
            item={rowData}
            onSelect={(rowData, method) => {
              if (method === 0) {
                getItemById(rowData.id).then(({ data }) => {
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
        title: t("appConfig.code"),
        field: "code",
        align: "center",
        width: "150",
        headerStyle: {
          paddingLeft: "10px",
          paddingRight: "0px",
        },
        cellStyle: {
          paddingLeft: "10px",
          paddingRight: "0px",
          textAlign: "center",
        },
      },

      {
        title: t("appConfig.name"),
        field: "name",
        align: "center",
        width: "150",
        headerStyle: {
          paddingLeft: "30px",
          paddingRight: "0px",
        },
        cellStyle: {
          paddingLeft: "10px",
          paddingRight: "0px",
          textAlign: "center",
        },
      },

      {
        title: t("appConfig.value"),
        field: "value",
        align: "center",
        width: "150",
        headerStyle: {
          paddingLeft: "10px",
          paddingRight: "0px",
        },
        cellStyle: {
          paddingLeft: "10px",
          paddingRight: "0px",
          textAlign: "center",
        },
      },

      {
        title: t("appConfig.activeAppConfig"),
        field: "active",
        align: "center",
        width: "150",
        headerStyle: {
          paddingLeft: "10px",
          paddingRight: "0px",
        },
        cellStyle: {
          paddingLeft: "10px",
          paddingRight: "0px",
          textAlign: "center",
        },
        render: (rowData) => (
          <Radio
            name="radSelected"
            value={rowData.active}
            checked={rowData.active}
          ></Radio>
        ),
      },
    ];

    return (
      <div className="m-sm-30">
        <Helmet>
          <title>
            {t("manage.appConfig")} | {t("web_site")}
          </title>
        </Helmet>
        <div className="mb-sm-30">
          <Breadcrumb
            routeSegments={[
              { name: t("Dashboard.manager"), path: "/directory/apartment" },
              { name: t("manage.appConfig") },
            ]}
          />
        </div>

        <Grid container spacing={3}>
          <Grid item md={7} sm={12} xs={12}>
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
              {t("Add")}
            </Button>
            <Button
              className="mb-16 mr-36 align-bottom"
              variant="contained"
              color="primary"
              onClick={() =>
                this.setState({ shouldOpenConfirmationDeleteAllDialog: true })
              }
            >
              {t("Delete")}
            </Button>

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
          </Grid>
          <Grid item md={5} sm={12} xs={12}>
            <Input
              label={t("EnterSearch")}
              type="text"
              name="keyword"
              value={keyword}
              onChange={this.handleTextChange}
              onKeyDown={this.handleKeyDownEnterSearch}
              className="w-100 mb-16 mr-10 stylePlaceholder"
              id="search_box"
              placeholder={t("general.enterSearch")}
              startAdornment={
                <InputAdornment>
                  <Link to="#">
                    {" "}
                    <SearchIcon
                      onClick={() => this.search()}
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
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <div>
            {shouldOpenEditorDialog && (
              <AppConfigEditorDialog
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
            title={t("List")}
            data={itemList}
            columns={columns}
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
                whiteSpace: "nowrap",
              }),
              maxBodyHeight: "450px",
              minBodyHeight: "370px",
              headerStyle: {
                backgroundColor: "#358600",
                color: "#fff",
                whiteSpace: "nowrap",
              },
              margin: "dense",
              toolbar: false,
            }}
            components={{
              Toolbar: (props) => <MTableToolbar {...props} />,
            }}
            onSelectionChange={(rows) => {
              this.data = rows;
            }}
            localization={{
              body: {
                emptyDataSourceMessage: `${t("general.emptyDataMessageTable")}`,
              },
            }}
          />
          <TablePagination
            align="left"
            className="px-16"
            rowsPerPageOptions={[1, 2, 3, 5, 10, 25, 50, 100]}
            component="div"
            labelRowsPerPage={t("general.rows_per_page")}
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} ${t("general.of")} ${
                count !== -1 ? count : `more than ${to}`
              }`
            }
            count={totalElements}
            rowsPerPage={rowsPerPage}
            page={page}
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
      </div>
    );
  }
}

export default appConfig;

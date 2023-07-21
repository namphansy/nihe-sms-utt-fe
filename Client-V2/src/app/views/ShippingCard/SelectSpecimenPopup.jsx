import {
  Grid,
  FormControl,
  InputLabel,
  Button,
  Icon,
  Input,
  Checkbox,
  TablePagination,
  InputAdornment,
  Dialog,
  DialogActions,
  IconButton,
  Select,
  MenuItem
} from "@material-ui/core";
import React, { Component } from "react";
import SearchIcon from "@material-ui/icons/Search";
import MaterialTable, {
  MTableToolbar,
} from "material-table";
import { useTranslation } from 'react-i18next';
import { searchByPage } from "../Specimen/SpecimenService";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Draggable from "react-draggable";
import Paper from "@material-ui/core/Paper";
import moment from 'moment';
import { toast } from "react-toastify";

function PaperComponent(props) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

class SelectSpecimenPopup extends React.Component {
  state = {
    keyword: null,
    rowsPerPage: 10,
    page: 0,
    listSpecimenChoose: []
  }

  componentDidMount() {
    this.updatePageData();
  }
  setPage = page => {
    this.setState({ page }, function () {
      this.updatePageData();
    });
  };

  setRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value, page: 0 }, function () {
      this.updatePageData();
    });
  };

  handleChangePage = (event, newPage) => {
    this.setPage(newPage);
  };
  componentWillMount() {
    let { open, handleClose, selectedItem, listSpecimenPick } = this.props;
    if (listSpecimenPick != null && listSpecimenPick.length > 0) {
      const sampleCommon = [...listSpecimenPick];
      console.log(sampleCommon);
      this.setState({ listSpecimenChoose: sampleCommon });
    }
  }
  handleClick = (event, item) => {
    item.isCheck = event.target.checked;
    let { listSpecimenChoose } = this.state;
    if (listSpecimenChoose == null) {
      listSpecimenChoose = [];
    }
    if (listSpecimenChoose != null && listSpecimenChoose.length == 0 && item.isCheck == true) {
      listSpecimenChoose.push(item);
    } else {
      let itemInList = false;
      listSpecimenChoose.forEach(el => {
        if (el.id == item.id) {
          itemInList = true;
        }
      });
      if (!itemInList && item.isCheck == true) {
        listSpecimenChoose.push(item);
      } else {
        if (item.isCheck === false) {
          listSpecimenChoose = listSpecimenChoose.filter(
            proper => proper.id !== item.id
          );
        }
      }
    }
    this.setState({ listSpecimenChoose });
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
  }

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
  }

  handleKeyDownEnterSearch = e => {
    if (e.key === 'Enter') {
      this.search();
    }
  };

  searchBetweenTwoNiheCode() {
    this.setState({ page: 0 }, function () {
      var searchObject = {};
      searchObject.niheCodeFrom = this.state.niheCodeFrom;
      searchObject.niheCodeTo = this.state.niheCodeTo;
      searchObject.text = this.state.keyword;
      searchObject.pageIndex = 1;
      searchObject.pageSize = 100000;
      searchObject.isShippingCard = true;
      searchObject.belongTo = 1; // thuộc về ViralLoad
      searchObject.patientType = this.props.patientType;
      let listCheck = this.state.itemList;
      searchByPage(searchObject).then(({ data }) => {
        let itemListClone = [...data.content];
        itemListClone.map(item => {
          item.isCheck = true;
        });
        this.setState({ itemList: itemListClone, totalElements: data.totalElements, listSpecimenChoose: itemListClone })
      });
    });
  }

  search() {
    this.setState({ page: 0 }, function () {
      var searchObject = {};
      searchObject.text = this.state.keyword;
      searchObject.pageIndex = this.state.page + 1;
      searchObject.pageSize = this.state.rowsPerPage;
      searchObject.isShippingCard = true;
      searchObject.org = this.state.org;
      searchObject.labTest = this.state.labTest;
      searchObject.specimenStatus = this.state.specimenStatus;
      searchObject.belongTo = 1; // thuộc về ViralLoad
      let listCheck = this.state.itemList;
      searchByPage(searchObject).then(({ data }) => {
        let { listSpecimenChoose } = this.state;
        let itemListClone = [...data.content];
        itemListClone.map(item => {
          const found = listSpecimenChoose.find(
            obj => obj.id == item.id
          );
          if (found) {
            item.isCheck = true;
          } else {
            item.isCheck = false;
          }
        });
        this.setState({ itemList: itemListClone, totalElements: data.totalElements })

      });
    });
  }

  updatePageData = () => {
    var searchObject = {};
    searchObject.text = this.state.keyword;
    searchObject.pageIndex = this.state.page + 1;
    searchObject.pageSize = this.state.rowsPerPage;
    searchObject.isShippingCard = true;
    searchObject.org = this.state.org;
    searchObject.labTest = this.state.labTest;
    searchObject.specimenStatus = this.state.specimenStatus;
    searchObject.belongTo = 1; // thuộc về ViralLoad
    searchByPage(searchObject).then(({ data }) => {
      let { listSpecimenChoose } = this.state;
      let itemListClone = [...data.content];
      itemListClone.map(item => {
        const found = listSpecimenChoose.find(
          obj => obj.id == item.id
        );
        if (found) {
          item.isCheck = true;
        } else {
          item.isCheck = false;
        }
      });
      this.setState({ itemList: itemListClone, totalElements: data.totalElements })
    }
    );
  };

  handleNiheCodeFrom = (event) => {
    this.setState({ niheCodeFrom: event.target.value });
  }

  handleChange = (event, source) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  handleNiheCodeTo = (event) => {
    this.setState({ niheCodeTo: event.target.value });
  }

  handleSelectSpecimenStatus = (event) => {
    this.setState({
      specimenStatus: event.target.value
    });
  }

  handleSelectNiheCode = () => {
    if (!this.state.niheCodeFrom || !this.state.niheCodeTo) {
      toast.error("Mã Nihe đang để trống");
    } else {
      this.searchBetweenTwoNiheCode();
    }
  }

  render() {

    const { t, i18n, handleClose, handleSelect, open } = this.props;
    let {
      text,
      itemList,
      keyword,
      niheCodeFrom,
      niheCodeTo,
      fromDate,
      toDate,
      checkAll,
      listSpecimenChoose,
    } = this.state;

    let columns = [
      {
        title: t("general.select"),
        field: "custom",
        align: "left",
        width: "250",
        render: rowData => (
          <Checkbox
            id={`radio${rowData.id}`}
            name="radSelected"
            value={rowData.id}
            checked={rowData.isCheck}
            onClick={event => this.handleClick(event, rowData)}
          />
        )
      },
      {
        title: t("specimen.code"),
        field: "niheCode",
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
        }
      },
      {
        title: t("specimen.type"),
        field: "specimenType",
        align: "left",
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
        render: (rowData) => rowData.specimenType?.name ? (
          <span>{rowData.specimenType?.name}</span>
        ) :
          (""),
      },
      {
        title: t("specimen.specimenDate"),
        field: "specimenDate",
        align: "center",
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
          paddingLeft: "0px",
          paddingRight: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "100px",
          paddingLeft: "0px",
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
          paddingLeft: "0px",
          paddingRight: "0px",
        },
        cellStyle: {
          minWidth: "100px",
          paddingLeft: "0px",
          paddingRight: "0px",
          // textAlign: "center",
        },
        render: rowData => this.specimenStatusString(rowData.specimenStatus)
      },
    ];

    return (
      <Dialog
        // onClose={handleClose}
        open={open}
        PaperComponent={PaperComponent}
        maxWidth={"md"}
        fullWidth
      >
        <DialogTitle className="styleColor" style={{ cursor: "move" }} id="draggable-dialog-title">
          <span className="mb-20 styleColor">
            {t("specimen.selectTitle")}
          </span>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={2}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel htmlFor="standard-adornment-amount">
                  {/* {t("general.codeFrom")} */} From
                </InputLabel>
                <Input
                  name="niheCodeFrom"
                  value={niheCodeFrom}
                  size="small"
                  type="text"
                  required
                  onChange={this.handleNiheCodeFrom}
                />
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={2}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel htmlFor="standard-adornment-amount">
                  {/* {t("general.codeTo")} */} To
                </InputLabel>
                <Input
                  name="niheCodeTo"
                  value={niheCodeTo}
                  size="small"
                  type="text"
                  required
                  onChange={this.handleNiheCodeTo}
                />
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Button
                className="mb-16 mr-16 align-bottom"
                variant="contained"
                color="primary"
                onClick={this.handleSelectNiheCode}
              >
                {t("general.select")}
              </Button>
            </Grid>

            <Grid item xs={6} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel htmlFor="standard-adornment-amount">
                  {t("Tình trạng mẫu")}
                </InputLabel>
                <Select
                  name="specimenStatus"
                  value={this.state.specimenStatus}
                  onChange={this.handleSelectSpecimenStatus}
                >
                  <MenuItem value="null">Không</MenuItem>
                  <MenuItem value="1">Tốt</MenuItem>
                  <MenuItem value="2">Tán huyết</MenuItem>
                  <MenuItem value="3">Thiếu thể tích</MenuItem>
                  <MenuItem value="4">Có cục máu đông</MenuItem>
                  <MenuItem value="5">Khác</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item sx={6} sm={4}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel htmlFor="standard-adornment-amount">
                  {t("general.search")}
                </InputLabel>
                <Input
                  id="standard-adornment-amount"
                  name="keyword"
                  value={keyword}
                  onKeyDown={this.handleKeyDownEnterSearch}
                  onChange={this.handleChange}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton>
                        <SearchIcon onClick={() => this.search(keyword)} />
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>

            </Grid>
            <Grid item xs={12}>
              {/* <Button
                  className="mb-16 mr-16"
                  variant="contained"
                  color="primary"
                  onClick={() => this.handleClickAll()}
                >
                  {checkAll ? "Bỏ chọn tất cả " : "Chọn tất cả "}
                  ({this.state.totalElements} mẫu)
                </Button> */}
              <MaterialTable
                data={itemList}
                columns={columns}
                options={{
                  selection: false,
                  actionsColumnIndex: -1,
                  paging: false,
                  search: false,
                  rowStyle: rowData => ({
                    backgroundColor: (rowData.tableData.id % 2 === 1) ? '#EEE' : '#FFF',
                  }),
                  headerStyle: {
                    backgroundColor: '#358600',
                    color: '#fff',
                  },
                  padding: 'dense',
                  toolbar: false
                }}
                components={{
                  Toolbar: props => (
                    <div style={{ witdth: "100%" }}>
                      <MTableToolbar {...props} />
                    </div>
                  )
                }}
                onSelectionChange={rows => { //set
                  this.setState({ sampleCommon: rows })
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
                rowsPerPageOptions={[1, 2, 3, 5, 10, 25]}
                component="div"
                labelRowsPerPage={t('general.rows_per_page')}
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${t('general.of')} ${count !== -1 ? count : `more than ${to}`}`}
                count={this.state.totalElements}
                rowsPerPage={this.state.rowsPerPage}
                page={this.state.page}
                labelRowsPerPage={t("general.rows_per_page")}
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} ${t("general.of")} ${count !== -1 ? count : `more than ${to}`
                  }`
                }
                backIconButtonProps={{
                  "aria-label": "Previous Page"
                }}
                nextIconButtonProps={{
                  "aria-label": "Next Page"
                }}
                onChangePage={this.handleChangePage}
                onChangeRowsPerPage={this.setRowsPerPage}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            className="mb-16 mr-36 align-bottom"
            variant="contained"
            color="secondary"
            onClick={() => handleClose()}
          >
            {t("general.cancel")}
          </Button>
          <Button
            className="mb-16 mr-16 align-bottom"
            variant="contained"
            color="primary"
            onClick={() => handleSelect(listSpecimenChoose)}
          >
            {t("general.select")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

}
export default SelectSpecimenPopup;

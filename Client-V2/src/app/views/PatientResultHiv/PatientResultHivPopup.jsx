import {
    Grid,
    InputAdornment,
    Input,
    Button,
    TablePagination,
    Radio,
    Dialog,
    DialogActions,
    IconButton,
    Icon
  } from "@material-ui/core";
  import React from "react";
  import MaterialTable, { MTableToolbar } from 'material-table';
  import DialogContent from '@material-ui/core/DialogContent';
  import DialogTitle from '@material-ui/core/DialogTitle';
  import Draggable from 'react-draggable';
  import Paper from '@material-ui/core/Paper';
  import { searchByPage } from "../HealthOrg/HealthOrgService";
  import { Link } from "react-router-dom";
  import SearchIcon from '@material-ui/icons/Search';
  function PaperComponent(props) {
    return (
      <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
        <Paper {...props} />
      </Draggable>
    );
  }
  class PatientResultHivPopup extends React.Component {
    constructor(props) {
      super(props);
      this.handleChange = this.handleChange.bind(this);
    }
    state = {
      rowsPerPage: 5,
      page: 0,
      data: [],
      totalElements: 0,
      itemList: [],
      shouldOpenEditorDialog: false,
      shouldOpenConfirmationDialog: false,
      selectedItem: {},
      keyword: '',
      shouldOpenProductDialog: false,
      item: null
    };
  
    setPage = page => {
      this.setState({ page }, function () {
        this.updatePageData();
      })
    };
  
    setRowsPerPage = event => {
      this.setState({ rowsPerPage: event.target.value, page: 0 }, function () {
        this.updatePageData();
      })
    };
  
    handleChangePage = (event, newPage) => {
      this.setPage(newPage);
    };
  
    updatePageData = () => {
      let searchObject = {};
      searchObject.text = this.state.keyword;
      searchObject.pageIndex = this.state.page + 1;
      searchObject.pageSize = this.state.rowsPerPage;
      searchByPage(searchObject).then(({ data }) => {
        this.setState({ itemList: [...data.content], totalElements: data.totalElements })
      });
    }
  
    componentDidMount() {
      this.updatePageData();
    }
  
    handleClick = (event, item) => {
      if (item.id != null) {
        this.setState({ selectedValue: item.id, selectedItem: item });
      } else {
        this.setState({ selectedValue: null, selectedItem: null });
      }
    }
  
    componentWillMount() {
      let { open, handleClose, selectedItem } = this.props;
    //   this.setState({ selectedValue: selectedItem.id });
    }
  
    handleKeyDownEnterSearch = e => {
      if (e.key === 'Enter') {
        this.search();
      }
    };
  
    search() {
      this.setPage(0, function () {
        var searchObject = {};
        searchObject.text = this.state.keyword;
        searchObject.pageIndex = this.state.page;
        searchObject.pageSize = this.state.rowsPerPage;
        searchByPage(searchObject).then(({ data }) => {
          this.setState({ itemList: [...data.content], totalElements: data.totalElements })
        });
      });
    };
  
    handleChange = (event, source) => {
      event.persist();
      this.setState({
        [event.target.name]: event.target.value
      }, function () {
        this.search();
      });
    };
  
    handleOpenProductDialog = () => {
      this.setState({
        shouldOpenProductDialog: true
      })
    }
  
    handleDialogProductClose = () => {
      this.setState({
        shouldOpenProductDialog: false
      })
    }
  
    handleOKEditClose = () => {
      this.setState({
        shouldOpenProductDialog: false
      });
      this.updatePageData();
    };
  
    onClickRow = (selectedRow) => {
      document.querySelector(`#radio${selectedRow.id}`).click();
    }
  
    render() {
      const { t, i18n, handleClose, handleSelect, selectedItem, open } = this.props;
      let { keyword, shouldOpenProductDialog, itemList } = this.state;
      let columns = [
        {
          title: "Chọn",
          field: "custom",
          align: "left",
          width: "250",
          render: rowData => <Radio id={`radio${rowData.id}`} name="radSelected" value={rowData.id} checked={this.state.selectedValue === rowData.id} onClick={(event) => this.handleClick(event, rowData)}
          />
        },
        { title: "Mã đơn vị", field: "code", align: "left", width: "150" },
        { title: "Tên đơn vị", field: "name", width: "150" },
      ];
      return (
        <Dialog onClose={handleClose} open={open} PaperComponent={PaperComponent} maxWidth={'md'} fullWidth>
          <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
            <span className="mb-20">{t("general.list")}</span>
            <IconButton
              style={{ position: 'absolute', right: '10px', top: '10px' }}
              onClick={() => handleClose()}
            >
              <Icon color="error" title={t('close')}>
                close
              </Icon>
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={1}>
              <Grid md={8} sm={8} xs={6}>
              </Grid>
  
              <Grid item md={4} sm={4} xs={6}>
                <Input
                  label={t('general.enterSearch')}
                  type="text"
                  name="keyword"
                  value={keyword}
                  onChange={this.handleChange}
                  onKeyDown={this.handleKeyDownEnterSearch}
                  onKeyUp={this.handleKeyUp}
                  className="w-100 mb-16 mr-12"
                  id="search_box"
                  placeholder={t('general.enterSearch')}
                  startAdornment={
                    <InputAdornment >
                      <Link to="#"> <SearchIcon
                        onClick={() => this.search(keyword)}
                        style={{
                          position: "absolute",
                          top: "0",
                          right: "0"
                        }} /></Link>
                    </InputAdornment>
                  }
                />
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <MaterialTable
                data={itemList}
                columns={columns}
                onRowClick={((evt, selectedRow) => this.onClickRow(selectedRow))}
  
                parentChildData={(row, rows) => {
                  var list = rows.find(a => a.id === row.parentId);
                  return list;
                }}
                options={{
                  toolbar: false,
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
                  toolbar: false,
                  draggable: false,
                }}
                components={{
                  Toolbar: props => (
                    <div style={{ witdth: "100%" }}>
                      <MTableToolbar {...props} />
                    </div>
                  ),
                }}
                onSelectionChange={(rows) => {
                  this.data = rows;
                }}
              />
              <TablePagination
                align="left"
                className="px-16"
                rowsPerPageOptions={[1, 2, 3, 5, 10, 25]}
                component="div"
                count={this.state.totalElements}
                rowsPerPage={this.state.rowsPerPage}
                labelRowsPerPage={t('general.rows_per_page')}
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${t('general.of')} ${count !== -1 ? count : `more than ${to}`}`}
                page={this.state.page}
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
          </DialogContent>
          <DialogActions>
            <div className="flex flex-space-between flex-middle mt-10">
              <Button
                className="mr-12"
                variant="contained"
                color="secondary"
                onClick={() => handleClose()}>{t('general.cancel')}
              </Button>
              <Button
                style={{ marginRight: '15px' }}
                variant="contained"
                color="primary"
                onClick={() => handleSelect(this.state.selectedItem)}>
                {t('general.select')}
              </Button>
            </div>
          </DialogActions>
        </Dialog>
      )
    }
  }
  export default PatientResultHivPopup;
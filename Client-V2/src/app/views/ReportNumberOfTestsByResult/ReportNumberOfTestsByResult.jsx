import React, { Component } from "react";
// import React, { useState } from 'react';
import {
    Grid,
    IconButton,
    Icon,
    TablePagination,
    Button,
    TextField
} from "@material-ui/core";
import MaterialTable, { MTableToolbar, Chip, MTableBody, MTableHeader } from 'material-table';
import { reportNumberOfTestsByResult,
    reportNumberOrgOfTestsByResult, 
    exportExcelReportNumberOfTestsByResult
} from "./ReportNumberOrgOfTestsByResultService";
import ReportNumberOrgOfTestsByResult from "./ReportNumberOrgOfTestsByResult";
import { Breadcrumb, ConfirmationDialog } from "egret";
import { useTranslation, withTranslation, Trans } from 'react-i18next';
import { saveAs } from 'file-saver';
import { toast } from "react-toastify";
import VisibilityIcon from '@material-ui/icons/Visibility';
import DateFnsUtils from '@date-io/date-fns'
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from "@material-ui/pickers";
function MaterialButton(props) {
    const { t, i18n } = useTranslation();
    const item = props.item;
    return <div>
        {/* <IconButton size="small" onClick={() => props.onSelect(item, 0)}>
            <Icon fontSize="small" color="primary">edit</Icon>
        </IconButton>
        <IconButton size="small" onClick={() => props.onSelect(item, 1)}>
            <Icon fontSize="small" color="error">delete</Icon>
        </IconButton> */}
        <IconButton onClick={() => props.onSelect(item, 0)}>
            <Icon color="primary"><VisibilityIcon /></Icon>
        </IconButton>
    </div>;
}

class ReportNumberOfTestsByResult extends Component {
    state = {
        keyword: '',
        rowsPerPage: 10,
        page: 0,
        eQAHealthOrgType: [],
        item: {},
        shouldOpenEditorDialog: false,
        shouldOpenConfirmationDialog: false,
        selectAllItem: false,
        selectedList: [],
        totalElements: 0,
        shouldOpenConfirmationDeleteAllDialog: false
    };
    numSelected = 0;
    rowCount = 0;

    handleTextChange = event => {
        this.setState({ keyword: event.target.value }, function () {
        })
    };

    handleKeyDownEnterSearch = e => {
        if (e.key === 'Enter') {
            this.search();
        }
    };

    setPage = page => {
        this.setState({ page }, function () {
            this.updatePageData();
        })
    };

    setRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value, page: 0 }, function () {
            this.updatePageData();
        });
    };

    handleChangePage = (event, newPage) => {
        this.setPage(newPage);
    };

    search() {
        console.log(this.state.itemList);
        this.setState({ page: 1 }, function () {
            var date = new Date("2000/01/01");
            console.log(date)
            var searchObject = {};
            searchObject.text = this.state.keyword;
            searchObject.pageIndex = this.state.page;
            searchObject.pageSize = this.state.rowsPerPage;
            searchObject.fromDate = this.state.fromDate ;
            searchObject.toDate = this.state.toDate ;
            reportNumberOfTestsByResult(searchObject).then(({ data }) => {
                this.setState({ itemList: [...data] })
            });
        });
    }
    handleDateChange = (event, source)=>{
        if(source === "toDate" || source === "fromDate"){
            if(source === "fromDate" && event != null){
                event.setHours("00");
                event.setMinutes("00");
                event.setSeconds("00");
            }
            if (source === "toDate" && event != null) {
                event.setHours("23");
                event.setMinutes("59");
                event.setSeconds("00");
            }
            this.setState({[source]: event},()=>{
                this.search()
            })
        }
    }
    updatePageData = () => {
        var date = new Date("2000/01/01");
        console.log(date)
        var searchObject = {};
        searchObject.text = this.state.keyword;
        searchObject.pageIndex = this.state.page;
        searchObject.pageSize = this.state.rowsPerPage;
        searchObject.fromDate = this.state.fromDate;
        searchObject.toDate = this.state.toDate ;
        searchObject.isChidren = false; //lấy mẫu thường
        reportNumberOfTestsByResult(searchObject).then(({ data }) => {
            this.setState({ itemList: [...data] })
        });
    };

    handleDownload = () => {
        var blob = new Blob(["Hello, world!"], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "hello world.txt");
    }

    handleDialogClose = () => {
        this.setState({
            shouldOpenEditorDialog: false,
            shouldOpenConfirmationDialog: false,
            shouldOpenConfirmationDeleteAllDialog: false
        });
    };

    handleOKEditClose = () => {
        this.setState({
            shouldOpenEditorDialog: false,
            shouldOpenConfirmationDialog: false
        });
        this.updatePageData();
    };

    // handleConfirmationResponse = () => {
    //     deleteItem(this.state.id).then(() => {
    //         this.updatePageData();
    //         this.handleDialogClose();
    //     });
    // };

    componentDidMount() {
        this.updatePageData();
    }

    handleEditItem = item => {
        this.setState({
            item: item,
            shouldOpenEditorDialog: true
        });
    };

    handleDelete = id => {
        this.setState({
            id,
            shouldOpenConfirmationDialog: true
        });
    };

    // async handleDeleteList(list) {
    //     if(list && list.length > 0) {
    //         for (var i = 0; i < list.length; i++) {
    //             await deleteItem(list[i].id);
    //         }
    //     } else {
    //         toast.warn("Bạn chưa chọn dữ liệu");
    //     }
    // }

    handleDeleteAll = (event) => {
        //alert(this.data.length);
        this.handleDeleteList(this.data).then(() => {
            this.updatePageData();
            this.handleDialogClose();
        }
        );
    };

    exportExcel = () => {
        var date = new Date("2000/01/01");
        var searchObject = {};
        searchObject.text = this.state.keyword;
        searchObject.pageIndex = this.state.page;
        searchObject.pageSize = this.state.rowsPerPage;
        searchObject.fromDate = this.state.fromDate;
        searchObject.toDate = this.state.toDate ;
        searchObject.isChidren = false; 
        exportExcelReportNumberOfTestsByResult(searchObject).then((result) => {
            const url = window.URL.createObjectURL(
                new Blob([result.data], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                })
                );
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "Báo Cáo Tổng Hợp Mẫu Theo Kết Quả Mẫu.xlsx");
                document.body.appendChild(link);
                link.click();
            }) .catch((err) => {
                alert('Đã có lỗi')
            });
    }

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
            shouldOpenConfirmationDeleteAllDialog
        } = this.state;

        let columns = [
            // { title: t("Tên đơn vị"), field: "labTestName", width: "150" },
            { title: t("report.statusName"), field: "statusName", align: "left", width: "150",
                render: rowData => {
                    if (rowData.statusName == 'Checking') return <span>Dương tính chờ xác nhận</span>;
                    else if (rowData.statusName == 'Positive') return <span>Dương tính</span>;
                    else if (rowData.statusName == 'Negative') return <span>Âm tính</span>;
                    else  return <span>Chưa có kết quả</span>;
                    
                },
            },
            { title: t("report.totalSample"), field: "totalSample", align: "left", width: "150" },

            {
                title: t("general.action"),
                field: "custom",
                align: "left",
                width: "250",
                render: rowData => <MaterialButton item={rowData}
                    onSelect={(rowData, method) => {
                        if (method === 0) {
                            var date = new Date("2000/01/01");

                            var searchObject = {};
                            searchObject.text = this.state.keyword;
                            searchObject.pageIndex = this.state.page;
                            searchObject.pageSize = this.state.rowsPerPage;
                            searchObject.sampleStatus = rowData.statusName;
                            searchObject.isChidren = false; //lấy mẫu thường
                            searchObject.fromDate = this.state.fromDate;
                            searchObject.toDate = this.state.toDate;
                            reportNumberOrgOfTestsByResult(searchObject).then(({ data }) => {
                                if (data.parent === null) {
                                    data.parent = {};
                                }
                                this.setState({
                                    item: [...data],
                                    shouldOpenEditorDialog: true
                                });
                            })
                        }
                    }}
                />
            },
        ];

        return (
            <div className="m-sm-30">

                <div className="mb-sm-30">
                    <Breadcrumb routeSegments={[{ name: t('report.title') }, { name: t('numberOfTestsByResult.title') }]} />
                </div>

                <Grid container spacing={3}>
                    <Grid item xs={12} container spacing={2}>
                        <Grid item md={2} sm={6} xs={12}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                    size="small"
                                    className="w-100"
                                    margin="none"
                                    id="date-picker-dialog"
                                    label={
                                        <span>
                                            <span style={{ color: "red" }}></span>
                                            {t("report.fromDate")}
                                        </span>
                                    }
                                    inputVariant="outlined"
                                    type="text"
                                    autoOk={true}
                                    format="dd/MM/yyyy"
                                    inputProps={{
                                        // readOnly: formReadonly.fromDate
                                    }}
                                    value={this.state.fromDate ? this.state.fromDate : null}
                                    onChange={(value)  => this.handleDateChange(value, "fromDate")}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                        // disabled: formReadonly.fromDate
                                    }}
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item md={2} sm={6} xs={12}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                    size="small"
                                    className="w-100"
                                    margin="none"
                                    id="date-picker-dialog"
                                    label={
                                        <span>
                                            <span style={{ color: "red" }}></span>
                                            {t("report.fromDate")}
                                        </span>
                                    }
                                    inputVariant="outlined"
                                    type="text"
                                    autoOk={true}
                                    format="dd/MM/yyyy"
                                    inputProps={{
                                        // readOnly: formReadonly.toDate
                                    }}
                                    value={this.state.toDate ? this.state.toDate : null}
                                    onChange={(value)  => this.handleDateChange(value, "toDate")}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                        // disabled: formReadonly.toDate
                                    }}

                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid>
                            <Button
                                className="mt-10 ml-8"
                                variant="contained"
                                color="primary"
                                onClick={this.exportExcel}
                            >
                                Xuất Excel
                            </Button>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <div>
                            {shouldOpenEditorDialog && (
                                <ReportNumberOrgOfTestsByResult t={t} i18n={i18n}
                                    handleClose={this.handleDialogClose}
                                    open={shouldOpenEditorDialog}
                                    handleOKEditClose={this.handleOKEditClose}
                                    item={item}
                                />
                            )}

                            {shouldOpenConfirmationDialog && (
                                <ConfirmationDialog
                                    title={t("general.confirm")}
                                    open={this.state.shouldOpenConfirmationDialog}
                                    onConfirmDialogClose={this.handleDialogClose}
                                    onYesClick={this.handleConfirmationResponse}
                                    title={t("general.confirm")}
                                    text={t('general.DeleteConfirm')}
                                    Yes={t('Yes')}
                                    No={t('No')}
                                />
                            )}
                        </div>
                        <MaterialTable
                            title={t('Danh sách Yếu Tố Dịch Tễ')}
                            data={itemList}
                            columns={columns}
                            //parentChildData={(row, rows) => rows.find(a => a.id === row.parentId)}
                            // parentChildData={(row, rows) => {
                            //     var list = rows.find(a => a.id === row.parentId);
                            //     return list;
                            // }}
                            options={{
                                selection: false,
                                actionsColumnIndex: -1,
                                paging: false,
                                search: false,
                                padding: 'dense',
                                toolbar: false
                            }}
                            components={{
                                Toolbar: props => (
                                    <MTableToolbar {...props} />
                                ),
                            }}
                            onSelectionChange={(rows) => {
                                this.data = rows;
                                // this.setState({selectedItems:rows});
                            }}
                            localization={{
                                body: {
                                    emptyDataSourceMessage: `${t(
                                        "general.emptyDataMessageTable"
                                    )}`,
                                },
                            }}
                        />
                        {/* <TablePagination
                            align="left"
                            className="px-16"
                            rowsPerPageOptions={[1, 2, 5, 10, 25, 50, 100]}
                            component="div"
                            labelRowsPerPage={t('general.rows_per_page')}
                            labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${t('general.of')} ${count !== -1 ? count : `more than ${to}`}`}
                            count={this.state.totalElements}
                            rowsPerPage={this.state.rowsPerPage}
                            page={this.state.page}
                            backIconButtonProps={{
                                "aria-label": "Previous Page"
                            }}
                            nextIconButtonProps={{
                                "aria-label": "Next Page"
                            }}
                            onChangePage={this.handleChangePage}
                            onChangeRowsPerPage={this.setRowsPerPage}
                            /> */}
                    </Grid>
                </Grid>
            </div>
        );
    }
}
export default ReportNumberOfTestsByResult;
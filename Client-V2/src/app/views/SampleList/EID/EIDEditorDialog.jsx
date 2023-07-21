import DateFnsUtils from '@date-io/date-fns';
import {
    Button, Checkbox, Dialog, DialogActions, FormControl, Grid, MenuItem, Select, TextField
} from "@material-ui/core";
import Tooltip from '@material-ui/core/Tooltip';
import Autocomplete from "@material-ui/lab/Autocomplete";
import {
    KeyboardDatePicker, MuiPickersUtilsProvider
} from "@material-ui/pickers";
import MaterialTable, {
    MTableToolbar
} from "material-table";
import React, { Component } from "react";
import { TextValidator, ValidatorForm } from "react-material-ui-form-validator";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConstantList from "../../../appConfig";
import { searchReagent } from "../../Reagent/ReagentService";
import { getByIDByParentId, searchReagent as searchReagentCode } from "../../ReagentCode/ReagentCodeService";
import { searchByPage as searchTestMethod } from 'app/views/TestMethod/TestMethodService';
import AutoComplete from "@material-ui/lab/AutoComplete";
import { searchByPage as searchTestMachine } from "../../TestMachine/TestMachineService";
import AsynchronousAutocomplete from '../../utilities/AsynchronousAutocomplete';
import Constant from '../Constants';
import { checkCode, deleteListLabTestClone, getListLabTestClone, saveOrUpdate, getReagentCodeClone, deleteReagentCodeClone,getInternalTestClone,deleteInternalTestClone} from '../SampleListService';
import SelectSpecimenPopup from "../SelectSpecimenPopup";
import UploadEIDExcel from '../../uploadExcel/UploadEIDExcel';
import {searchInternalTest} from "../../InternalTest/InternalTestService";

toast.configure({
    autoClose: 2000,
    draggable: false,
    limit: 3,
});

class EIDEditorDialog extends Component {
    state = {
        name: "",
        code: "",
        item: {},
        testType: "EID",
        listLabTestResult: [],
        isActive: false,
        shouldOpenSelectSpecimenPopup: false,
        autoGenCode: false,
        reagentSearch: {
            pageIndex: 0,
            pageSize: 10000000,
        },
        reagentCodeSearch: {},
        reagentCode: null,
        reagent: null,
        ncResult: "",
        pcResult: "",
        testMethod : null,
        internalTest: null,
    };

    handleChange = (event, source) => {
        if (source === "testDate") {
            this.setState({ [source]: event });
            return;
        }
        if (source === "resultDate") {
            this.setState({ [source]: event });
            return;
        }

        this.setState({
            [event.target.name]: event.target.value
        });
    };

    handleNcResultChange = (event) => {
        let { reagentCode } = this.state;
        reagentCode.ncResult = event.target.data
        this.setState({ reagentCode: reagentCode });
    };

    handlePcResultChange = (event) => {
        let { reagentCode } = this.state;
        reagentCode.pcResult = event.target.data
        this.setState({ reagentCode: reagentCode });
    };

    selectTestMethod = (event, value, reason) => {
        this.setState({ testMethod: value });  
    };

    selectTestMachine = (value) => {
        this.setState({ testMachine: value });
    };

    handleRowDataCellChange = (rowData, event) => {
        let { listLabTestResult } = this.state;
        let { t } = this.props;
        if (listLabTestResult != null && listLabTestResult.length > 0) {
            listLabTestResult.forEach(element => {
                if (element.tableData != null && rowData != null && rowData.tableData != null
                    && element.tableData.id == rowData.tableData.id) {
                    if (event.target.name == "labResult") {
                        element.labResult = event.target.value;
                    } else if (event.target.name == "testCode") {
                        element.testCode = event.target.value;
                    }
                    else if (event.target.name == "finalResult") {
                        element.finalResult = event.target.value;
                    }
                    else if (event.target.name == "resultDescription") {
                        element.resultDescription = event.target.value;
                    }
                    else if (event.target.name == "thresholdValue") {
                        element.thresholdValue = event.target.value;
                    } else if (event.target.name == "resultStatus") {
                        element.resultStatus = event.target.value
                    } else if (event.target.name == "times") {
                        element.times = event.target.value
                    } else if (event.target.name == "status") {
                        element.status = event.target.value
                        if (event.target.value === "Undetachable") {
                            element.labResult = null;
                        }
                    }
                }
            });
            this.setState({ listLabTestResult: listLabTestResult });
        }
    };

    handleSelectSpecimen = (listItem) => {
        const listLabTestClone = []
        if (listItem != null && listItem.length > 0) {
            listItem.map(item => {
                let labTestDetail = {};
                labTestDetail.specimen = item;
                labTestDetail.labResult = "";
                labTestDetail.testCode = "";
                labTestDetail.resultDate = null;
                labTestDetail.resultStatus = null;
                labTestDetail.thresholdValue = null;
                labTestDetail.finalResult = null;
                labTestDetail.resultDescription = "";
                labTestDetail.times = null;
                labTestDetail.type = 2; //NormalVL= 1, EID =2
                listLabTestClone.push(labTestDetail);
            })
            this.setState({ listLabTestResult: listLabTestClone, listSpecimenPick: listItem }, () => {
            })
        }

        this.handleDialogClose();
    };

    async updateListLabTestClone() {
        let { listLabTestResult } = this.state;
        console.log(listLabTestResult)
        const { data } = await getListLabTestClone();

        data.map((item) => {
            const found = listLabTestResult.findIndex(
                obj => obj.specimen.niheCode == item.specimen.niheCode
            );
            if (found !== -1) {
                listLabTestResult[found].labResult = item.labResult;
                listLabTestResult[found].finalResult = item.finalResult;
            } else {
                listLabTestResult.push(item);
            }
        });
        await this.setState({
            listLabTestResult: listLabTestResult,
        })
    };

    async updateReagentCodeClone() {
        let { reagentCode, reagent } = this.state;
        console.log(reagentCode)
        const { data } = await getReagentCodeClone();
        if (data) {
            reagentCode = data;
            reagent = data.reagent;
        }
        await this.setState({ reagentCode: reagentCode, reagent: reagent })
    };

    async updateInternalTestClone() {
        let { internalTest } = this.state;
        const { data } = await getInternalTestClone();
        if (data) {
            internalTest = data;
        }
        await this.setState({ internalTest : internalTest})
    };

    reloadInternalTest() {
        this.updateInternalTestClone()
    };

    reloadListLabTest() {
        this.updateListLabTestClone()
    };

    reloadReagentCode() {
        this.updateReagentCodeClone()

    };

    handleDialogClose = () => {
        this.setState({
            shouldOpenEditorDialog: false,
            shouldOpenConfirmationDialog: false,
            shouldOpenNotificationPopup: false,
            shouldOpenSelectSpecimenPopup: false,
        })
    };

    handleAutoGenCode = () => {
        if (this.state.autoGenCode == true) {
            this.setState({ autoGenCode: false })
        }
        if (this.state.autoGenCode == false) {
            this.setState({ autoGenCode: true })
        }

    };

    handleFormSubmit = () => {
        let { id, code } = this.state;
        let object = { id: id, code: code };
        let item = {};
        item.id = id;
        item.code = code;
        item.testDate = this.state.testDate;
        item.resultDate = this.state.resultDate;
        item.performer = this.state.performer;
        item.auditor = this.state.auditor;
        item.reagent = this.state.reagent;
        item.reagentCode = this.state.reagentCode;
        item.testMachine = this.state.testMachine;
        if(this.state.listLabTestResult[0]?.labResult)
        {
            console.log("hieu")
            let {listLabTestResult} = this.state
            if(listLabTestResult[0]?.labResult)
            {
                listLabTestResult.resultStatus = 2;
            }
            else if(!listLabTestResult[0]?.labResult )
            {
                listLabTestResult.resultStatus = 1;

            }
        }
        item.listLabTestResult = this.state.listLabTestResult;
        item.testMethod = this.state.testMethod;
        item.internalTest = this.state.internalTest;
        item.testType = "EID";
        if (this.state.autoGenCode == false) {
            checkCode(object).then((result) => {
                if (result.data) {
                    toast.warning("Code đã được sử dụng");
                } else {
                    if (id) {
                        saveOrUpdate(item).then(() => {
                            toast.success("Cập nhật thành công");
                            this.props.handleOKEditClose();
                        }).catch(() => {
                            toast.error("Có lỗi xảy ra khi cập nhật");
                        });
                    } else {
                        saveOrUpdate(item).then(() => {
                            toast.success("Thêm mới thành công");
                            this.props.handleOKEditClose();
                        }).catch(() => {
                            toast.error("Có lỗi xảy ra khi thêm mới");
                        });
                    }
                }
            })
        } else if (this.state.autoGenCode == true) {
            if (id) {
                saveOrUpdate(item).then(() => {
                    toast.success("Cập nhật thành công");
                    this.props.handleOKEditClose();
                }).catch(() => {
                    toast.error("Có lỗi xảy ra khi cập nhật");
                });
            } else {
                saveOrUpdate(item).then(() => {
                    toast.success("Thêm mới thành công");
                    this.props.handleOKEditClose();
                }).catch(() => {
                    toast.error("Có lỗi xảy ra khi thêm mới");
                });
            }
        }
    };

    selectReagent = (event, value, reason) => {
        this.setState({ reagent: value });
        this.setState({ reagentCode: null });
        getByIDByParentId(value?.id).then(
            ({ data }) => {
                this.setState({
                    listReagentCode: data,
                })
            }
        );
    };
    //selectInternalTest
    selectInternalTest = (event, value, reason) => {
        this.setState({ internalTest: value });
    };
    
    selectReagentCode = (event, value, reason) => {
        console.log(event, value, reason);
        this.setState({
            reagentCode: value
        });
    };

    componentWillMount() {
        let { open, handleClose, item } = this.props;
        let listSpecimen = [];
        if (item != null && item.listLabTestResult != null && item.listLabTestResult.length > 0) {
            listSpecimen = item.listLabTestResult.map(item => {
                return item.specimen;
            })
        }
        this.setState({ ...item, listSpecimenPick: listSpecimen });
        
        deleteListLabTestClone();
        deleteReagentCodeClone();
        deleteInternalTestClone();
    };

    componentDidMount() {
        ValidatorForm.addValidationRule('whitespace', (value) => {
            if (this.validateForm(value)) {
                return false;
            }
            return true;
        });
        this.updateListLabTestClone();
        this.updateReagentCodeClone();
        this.updateInternalTestClone();
        let searchObject = { pageIndex: 0, pageSize: 100000 }
        searchReagent(searchObject).then(({ data }) => this.setState({ listReagent: data.content }));
        searchTestMethod(searchObject).then(({data}) => this.setState({listTestMethod: data.content}));
        searchInternalTest(searchObject).then(({data}) => this.setState({listInternalTest: data.content}));

        if (this.state.reagent) {
            getByIDByParentId(this.state.reagent.id).then(
                ({ data }) => {
                    this.setState({ listReagentCode: data })
                }
            );
        }
    };

    ResultStatus = (value) => {
        if (value.labResult) {
            value.resultStatus = 2 ;
            return (
                <small
                    className="border-radius-4 text-black px-8 py-2 "
                    style={{ backgroundColor: "#83ef84" }}
                >
                    {"Có kết quả"}
                </small>
            )
        }
        else if (!value.labResult) {
            value.resultStatus = 1 ;
            return (
                <small
                    className="border-radius-4 px-8 py-2 "
                    style={{ backgroundColor: "#FF0000", color: "#ffffff" }}
                >
                    {"Chưa có kết quả"}
                </small>
            )
        }
    };

    componentWillUnmount() {
        ValidatorForm.removeValidationRule('whitespace');
        deleteListLabTestClone();
        deleteReagentCodeClone();
        deleteInternalTestClone();
    };

    validateForm(value) {
        let whitespace = new RegExp(/[^\s]+/);
        if (!whitespace.test(value)) {
            return true
        }
        return false
    };

    render() {
        let { open, t, i18n } = this.props;
        let {
            id, code, performer, testMachine, shouldOpenSelectSpecimenPopup, autoGenCode, resultDate,
            listLabTestResult, testDate, reagent, auditor, reagentCode, testMethod, internalTest
        } = this.state;
        let searchObject = { pageIndex: 0, pageSize: 100000 }
        let columns = [
            {
                title: t("patient.code"),
                field: "specimen.patientCode",
                width: "150",
                headerStyle: {
                    minWidth: "100px",
                    paddingRight: "0px",
                    textAlign: "center",
                },
                cellStyle: {
                    minWidth: "100px",
                    paddingRight: "0px",
                    textAlign: "center",
                },
            },
            {
                title: t("specimen.code"),
                field: "specimen.niheCode",
                width: "150",
                headerStyle: {
                    minWidth: "100px",
                    paddingRight: "0px",
                    textAlign: "center",
                },
                cellStyle: {
                    minWidth: "100px",
                    paddingRight: "0px",
                    textAlign: "center",
                },
            },

            {
                title: t("EID.result"),
                field: "labResult",
                align: "center",
                width: "100",
                headerStyle: {
                    minWidth: "100px",
                    paddingRight: "0px",
                    textAlign: "center",
                },
                cellStyle: {
                    minWidth: "100px",
                    paddingRight: "0px",
                    textAlign: "center",
                },
            },
            {
                title: "Giá trị Ngưỡng (ct)",
                field: "thresholdValue",
                align: "center",
                width: "100",
                headerStyle: {
                    minWidth: "100px",
                    paddingRight: "0px",
                    textAlign: "center",
                },
                cellStyle: {
                    minWidth: "100px",
                    paddingRight: "0px",
                    textAlign: "center",
                },
                render: rowData => (
                    <TextValidator
                        className="w-100"

                        size="small"
                        onChange={event =>
                            this.handleRowDataCellChange(rowData, event)
                        }
                        type="number"
                        name="thresholdValue"
                        value={rowData.thresholdValue}
                    />
                )
            },
            {
                title: "Kết quả cuối cùng",
                field: "finalResult",
                align: "center",
                width: "100",
                headerStyle: {
                    minWidth: "100px",
                    paddingRight: "0px",
                    textAlign: "center",
                },
                cellStyle: {
                    minWidth: "100px",
                    paddingRight: "0px",
                    textAlign: "center",
                },
                render: rowData => (
                    <FormControl fullWidth={true} size="small">

                        <Select
                            value={rowData.finalResult}
                            label={"Kết quả cuối cùng"}
                            onChange={finalResult => this.handleRowDataCellChange(rowData, finalResult)}
                            inputProps={{
                                name: "finalResult",
                                id: "finalResult-simple",
                            }}
                        >
                            {Constant.listFinalResult.map((item) => {
                                return (
                                    <MenuItem key={item.id} value={item.id}>
                                        {item.name}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                )
            },
            {
                title: "Mô tả kết quả",
                field: "resultDescription",
                align: "center",
                width: "100",
                headerStyle: {
                    minWidth: "100px",
                    paddingRight: "0px",
                    textAlign: "center",
                },
                cellStyle: {
                    minWidth: "100px",
                    paddingRight: "0px",
                    textAlign: "center",
                },
                render: rowData => (
                    <TextValidator
                        className="w-100"
                        disabled={rowData.finalResult == 4 ? false : true}
                        size="small"
                        onChange={resultDescription => this.handleRowDataCellChange(rowData, resultDescription)}
                        type="text"
                        name="resultDescription"
                        value={rowData.resultDescription}
                    />
                )
            },
            {
                title: t("result.status"),
                field: "resultStatus",
                align: "center",
                width: "150",
                render: (rowData) => this.ResultStatus(rowData)
            },
        ];
        return (
            <Dialog open={open} fullWidth maxWidth="lg">
                <div className="p-24">
                    <h4 className="mb-24">{id ? t("general.update") : t("general.add")} {t("EID.popup")}</h4>
                    <ValidatorForm ref="form" onSubmit={this.handleFormSubmit}>
                        <Grid className="mt-8" container spacing={2}>
                            {this.state.autoGenCode && <Grid item lg={3} md={3} sm={3} xs={12}>
                                <TextValidator
                                    disabled={autoGenCode}
                                    className="w-100"
                                    variant="outlined"
                                    size="small"
                                    label={<span className="font">
                                        {t("EID.code")}
                                    </span>}
                                    onChange={this.handleChange}
                                    type="text"
                                    name="code"
                                    value={code}
                                />
                            </Grid>
                            }
                            {!this.state.autoGenCode && !this.state.id &&
                                <Grid item lg={3} md={3} sm={6} xs={12}>
                                    <TextValidator
                                        disabled={autoGenCode}
                                        className="w-100"
                                        variant="outlined"
                                        size="small"
                                        label={<span className="font">
                                            <span style={{ color: "red" }}> * </span>
                                            {t("EID.code")}
                                        </span>}
                                        onChange={this.handleChange}
                                        type="text"
                                        name="code"
                                        value={code}
                                        validators={["required", 'whitespace']}
                                        errorMessages={[t("general.required"), t("general.invalidCharacter")]}
                                    />
                                </Grid>
                            }
                            {this.state.id &&
                                <Grid item lg={4} md={4} sm={6} xs={12}>
                                    <TextValidator
                                        className="w-100"
                                        variant="outlined"
                                        size="small"
                                        label={<span className="font">
                                            <span style={{ color: "red" }}> * </span>
                                            {t("EID.code")}
                                        </span>}
                                        onChange={this.handleChange}
                                        type="text"
                                        name="code"
                                        value={code}
                                        validators={["required", 'whitespace']}
                                        errorMessages={[t("general.required"), t("general.invalidCharacter")]}
                                    />
                                </Grid>
                            }
                            {!this.state.id && <>
                                <Grid item lg={1} md={1} sm={6} xs={12}>
                                    <Tooltip title="Tạo mẫu tự động" placement="bottom">
                                        <Checkbox
                                            onChange={this.handleAutoGenCode}
                                            inputProps={{ 'aria-label': 'primary checkbox' }}
                                            title="Tạo mẫu tự động"
                                        />
                                    </Tooltip>

                                </Grid>
                            </>
                            }
                            <Grid item lg={4} md={4} sm={6} xs={12}>
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <KeyboardDatePicker
                                        size="small"
                                        className="w-100"
                                        margin="none"
                                        id="date-picker-dialog"
                                        label={
                                            <span>
                                                {t("EID.testDate")}
                                            </span>
                                        }
                                        inputVariant="outlined"
                                        type="text"
                                        // autoOk={true}
                                        format="dd/MM/yyyy"
                                        value={testDate ? testDate : null}
                                        onChange={(value) => this.handleChange(value, "testDate")}
                                        KeyboardButtonProps={{
                                            'aria-label': 'change date',
                                        }}
                                    />
                                </MuiPickersUtilsProvider>
                            </Grid>
                            <Grid item lg={4} md={4} sm={6} xs={12}>
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <KeyboardDatePicker
                                        size="small"
                                        className="w-100"
                                        margin="none"
                                        id="date-picker-dialog"
                                        label={
                                            <span>
                                                {t("viralLoad.resultDate")}
                                            </span>
                                        }
                                        inputVariant="outlined"
                                        type="text"
                                        format="dd/MM/yyyy"
                                        value={resultDate ? resultDate : null}
                                        onChange={(value) => this.handleChange(value, "resultDate")}
                                        KeyboardButtonProps={{
                                            'aria-label': 'change date',
                                        }}
                                    />
                                </MuiPickersUtilsProvider>
                            </Grid>
                            <Grid item lg={4} md={4} sm={6} xs={12}>
                                <TextValidator
                                    className="w-100"
                                    variant="outlined"
                                    size="small"
                                    label={<span className="font">
                                        <span style={{ color: "red" }}> * </span>
                                        {t("EID.performer")}
                                    </span>}
                                    onChange={this.handleChange}
                                    type="text"
                                    name="performer"
                                    value={performer}
                                    validators={["required", 'whitespace']}
                                    errorMessages={[t("general.required"), t("general.invalidCharacter")]}
                                />
                            </Grid>
                            <Grid item lg={4} md={4} sm={6} xs={12}>
                                <TextValidator
                                    className="w-100"
                                    variant="outlined"
                                    size="small"
                                    label={<span className="font">
                                        <span style={{ color: "red" }}> * </span>
                                        {t("EID.auditor")}
                                    </span>}
                                    onChange={this.handleChange}
                                    type="text"
                                    name="auditor"
                                    value={auditor}
                                    validators={["required", 'whitespace']}
                                    errorMessages={[t("general.required"), t("general.invalidCharacter")]}
                                />
                            </Grid>
                            <Grid item lg={4} md={4} sm={6} xs={12}>
                                <Autocomplete
                                    label={t('EID.reagent')}
                                    size="small"
                                    id="combo-box"
                                    className="flex-end"
                                    value={reagent}
                                    options={this.state.listReagent ? this.state.listReagent : []}
                                    onChange={this.selectReagent}
                                    getOptionLabel={option => option.name}
                                    renderInput={(params) => (
                                        <TextField
                                            label={t('EID.reagent')}
                                            fullWidth
                                            variant="outlined"
                                            {...params}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item lg={4} md={4} sm={6} xs={12}>
                                <Autocomplete
                                    label={t('EID.reagentCode')}
                                    variant="outlined"
                                    size="small"
                                    value={reagentCode ? reagentCode : []}
                                    options={this.state.listReagentCode ? this.state.listReagentCode : []}
                                    onChange={this.selectReagentCode}
                                    getOptionLabel={option => option.code}
                                    renderInput={(params) => (
                                        <TextField
                                            className="font-inherit"
                                            multiple
                                            label={t('EID.reagentCode')}
                                            fullWidth
                                            variant="outlined"
                                            {...params}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item lg={4} md={4} sm={6} xs={12}>
                                <TextValidator
                                    className="w-100"
                                    label={
                                        <span className="font">
                                            {t("reagentCode.ncResult")}
                                        </span>
                                    }
                                    disabled={false}
                                    type="text"
                                    multiline
                                    rowsMax={4}
                                    name="ncResult"
                                    value={this.state.reagentCode?.ncResult ? this.state.reagentCode?.ncResult : ""}
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>

                            <Grid item lg={4} md={4} sm={6} xs={12}>
                                <TextValidator
                                    className="w-100"
                                    label={
                                        <span className="font">
                                            {t("reagentCode.pcResult")}
                                        </span>
                                    }
                                    disabled={false}
                                    type="text"
                                    name="pcResult"
                                    multiline
                                    rowsMax={4}
                                    value={this.state.reagentCode?.pcResult ? this.state.reagentCode?.pcResult : ""}
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>

                            <Grid item lg={4} md={4} sm={6} xs={12}>
                                <AutoComplete
                                    size="small"
                                    id="combo-box"
                                    className="flex-end"
                                    value={internalTest}
                                    options={this.state.listInternalTest ? this.state.listInternalTest : []}
                                    onChange={this.selectInternalTest}
                                    getOptionLabel={option => option.code}
                                    renderInput={(params) => (
                                        <TextField
                                            label={"Mẫu nội kiểm"}
                                            fullWidth
                                            variant="outlined"
                                            {...params}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item lg={4} md={4} sm={6} xs={12}>
                                <AsynchronousAutocomplete
                                    label={t('EID.testMachine')}
                                    variant="outlined"
                                    size="small"
                                    searchFunction={searchTestMachine}
                                    searchObject={searchObject}
                                    defaultValue={testMachine}
                                    displayLable={'name'}
                                    value={testMachine}
                                    onSelect={this.selectTestMachine}
                                />
                            </Grid>

                            <Grid item lg={4} md={4} sm={6} xs={12}>
                                <AutoComplete
                                    size="small"
                                    id="combo-box"
                                    className="flex-end"
                                    value={testMethod}
                                    options={this.state.listTestMethod ? this.state.listTestMethod : []}
                                    onChange={this.selectTestMethod}
                                    getOptionLabel={option => option.name}
                                    renderInput={(params) => (
                                        <TextField
                                            label={"Kỹ thuật xét nghiệm"}
                                            fullWidth
                                            variant="outlined"
                                            {...params}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid className="mt-8" xs={12}>
                                <Button
                                    variant="contained"
                                    className="mr-12"
                                    color="primary"
                                    onClick={() => this.setState({ shouldOpenSelectSpecimenPopup: true })}
                                >Chọn mẫu</Button>
                                <Button
                                    variant="contained"
                                    className="mr-12"
                                    color="primary"
                                    onClick={() => this.setState({ shouldOpenImportExcelPopup: true })}
                                >Import máy CAP/CTM </Button>
                                {this.state.shouldOpenImportExcelPopup &&
                                    <UploadEIDExcel
                                        t={t}
                                        i18n={i18n}
                                        handleClose={() => this.setState({ shouldOpenImportExcelPopup: false })}
                                        open={this.state.shouldOpenImportExcelPopup}
                                        handleOKEditClose={this.handleOKEditClose}
                                        enableConfirm={true}
                                        confirmMessage={"Tải lên sẽ xóa các thuộc tính cũ của mẫu, bạn có chắc chắn?"}
                                        acceptType="xlsm;xls;xlsx"
                                        uploadUrl={
                                            ConstantList.API_ENPOINT +
                                            "/api/uploadExcel/importMachine96/true"
                                        }
                                        reloadListLabTest={() => this.updateListLabTestClone()}
                                        reloadReagentCode={() => this.updateReagentCodeClone()}
                                        reloadInternalTest={() => this.updateInternalTestClone()}
                                    />
                                }
                                {shouldOpenSelectSpecimenPopup && <SelectSpecimenPopup
                                    t={t}
                                    open={shouldOpenSelectSpecimenPopup}
                                    patientType={4}
                                    listSpecimenPick={this.state.listSpecimenPick}
                                    handleClose={this.handleDialogClose}
                                    handleSelect={this.handleSelectSpecimen}
                                />}
                                <fieldset>
                                    <legend>Danh sách mẫu xét nghiệm</legend>
                                    <Grid item xs={12}>
                                        <MaterialTable
                                            data={listLabTestResult}
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
                                    </Grid>
                                </fieldset>
                            </Grid>
                        </Grid>
                        <DialogActions style={{ paddingRight: "0px" }}>
                            <div className="flex flex-space-between flex-middle mt-24">
                                <Button
                                    variant="contained"
                                    className="mr-12"
                                    color="secondary"
                                    onClick={() => this.props.handleClose()}
                                >
                                    {t("general.cancel")}
                                </Button>
                                <Button variant="contained" color="primary" type="submit">
                                    {t("general.save")}
                                </Button>
                            </div>
                        </DialogActions>
                    </ValidatorForm>
                </div>
            </Dialog>
        );
    }
}

export default EIDEditorDialog;

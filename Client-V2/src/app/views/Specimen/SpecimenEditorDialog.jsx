import React, { Component } from "react";
import {
    Dialog,
    Button,
    Grid,
    DialogActions,
    InputAdornment,
    FormControlLabel,
    Switch,
    Checkbox,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    FormGroup,
    LinearProgress
} from "@material-ui/core";
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from "@material-ui/pickers";
import DateFnsUtils from '@date-io/date-fns'
import ConstantList from "../../appConfig";
import Tooltip from '@material-ui/core/Tooltip';
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { saveOrUpdate, checkCode } from "./SpecimenService";
import { checkCode as checkCodePatient } from "../Patient/PatientServices";
import Autocomplete from "@material-ui/lab/Autocomplete";
import HealthOrganizationPopup from "./HealthOrganizationPopup";
import PatientSearchDialog from "./PatientSearchDialog";
import { toast } from "react-toastify";
import AsynchronousAutocomplete from '../../views/utilities/AsynchronousAutocomplete'
import { searchByPage as searchSpecimenType } from '../SpecimenType/SpecimenTypeService'
import "react-toastify/dist/ReactToastify.css";
import { getAllInfoByUserLogin } from "../User/UserService";
import { stubString } from "lodash-es";
import UserRoles from "app/services/UserRoles";

toast.configure({
    autoClose: 2000,
    draggable: false,
    limit: 3,
});

class SpecimenEditorDialog extends Component {
    state = {
        name: "",
        code: "",
        item: {},
        DVLM: {},
        DVXN: {},
        isActive: false,
        autoGenCode: false,
        shouldOpenHealthOrganizationPopup: false,
        shouldOpenSampleCollectOrgPopup: false,
        manualBirthDateCheck: false,
        disabled: false,
        isLoading: false,
        niheCodeInput: null,
        shouldOpenSampleCollectOpcPopup: false,
    };

    listGender = [
        { id: "M", name: "Nam" },
        { id: "F", name: "Nữ" },
        { id: "U", name: "Không rõ" },
    ];

    listType = [
        // { id: 1, name: "Trẻ dưới 18 tháng" },
        { id: 2, name: "Trẻ từ 18 tháng tuổi" },
        { id: 3, name: "Người đã xét nghiệm đo tải lượng HIV" }
    ]

    listSpecimenType = [
        { id: 1, name: "Mẫu máu toàn phần" },
        { id: 2, name: "Huyết tương" },
        { id: 3, name: "Huyết thanh" },
        { id: 4, name: "DBS" },
        { id: 5, name: "Khác" },
    ];

    listSpecimenStatus = [
        { id: 1, name: "Tốt" },
        { id: 2, name: "Tán huyết" },
        { id: 3, name: "Thiếu thể tích" },
        { id: 4, name: "Có cục đông" },
        { id: 5, name: "Khác" },
    ]

    listArvTreatment = [
        { id: 1, name: "Có" },
        { id: 2, name: "Không" },
        { id: 3, name: "Không xác định" }
    ]

    listShippingStatus = [
        { id: 'Draft', name: "Tạo mới" },
        { id: 'Pending', name: "Chờ xử lý" },
        { id: 'Accepted', name: "Đã được chấp nhận" },
        { id: 'Resulted', name: "Đã có kết quả" }
    ]

    handleSelectSampleCollectOrg = (sampleCollectOrg) => {
        let { item } = this.state;
        item = item ? item : {};
        if (sampleCollectOrg && sampleCollectOrg.id) {
            this.setState({ DVLM: sampleCollectOrg });
            // this.state.DVLM.name = sampleCollectOrg.name;
            item["org"] = sampleCollectOrg;
            this.setState({ item: item });
            this.handleDialogClose();
        }
    };

    handleSelectSampleCollectOpc = (sampleCollectOpc) => {
        let { item } = this.state;
        item = item ? item : {};
        if (sampleCollectOpc && sampleCollectOpc.id) {
            item["opc"] = sampleCollectOpc;
            this.setState({ item: item });
            this.handleDialogClose();
        }
    };

    handleSelectHealthOrganization = (labTest) => {
        let { item } = this.state;
        item = item ? item : {};
        if (labTest && labTest.id) {
            this.setState({ DVXN: labTest })
            // this.state.DVXN.name = labTest.name;
            item["labTest"] = labTest;
            this.setState({ item: item });
            this.handleDialogClose();
        }
    };

    handleAutoGenCode = () => {
        let { item } = this.state;
        if (this.state.autoGenCode == true) {
            item.niheCode = null;
            this.setState({ autoGenCode: false })
            this.setState({ item: item })
        }
        if (this.state.autoGenCode == false) {
            item.niheCode = null;
            this.setState({ autoGenCode: true })
            this.setState({ item: item })
        }
    };

    handleChange = (event, source) => {
        let { item } = this.state;
        item = item ? item : {};

        if (source == "niheCode") {
            let niheCode = event.target.value;
            if (niheCode.length < 7) {
                item.niheCodeInput = niheCode;
                this.setState({ item: item });
            }
            return;
        }

        if (source === "specimenType") {
            item.specimenType = event.target.value;
            this.setState({ item: item });
            return;
        }

        if (source === "specimenStatus") {
            item.specimenStatus = event.target.value;
            this.setState({ item: item });
            return;
        }
        if (source === "arvTreatment") {
            item.arvTreatment = event.target.value;
            this.setState({ item: item });
            return;
        }
        if (source === "shippingStatus") {
            item.shippingStatus = event.target.value;
            this.setState({ item: item })
            return;
        }
        if (source === "manualBirthDate") {
            item.patient.manualBirthDate = event.target.value;
            this.setState({ item: item })
            return;
        }
        item[event.target.name] = event.target.value
        this.setState({
            item: item
        });
    };

    handleSelectPatient = (patient) => {
        let { item } = this.state;
        item.patient = patient

        if (item?.patient?.manualBirthDate != null) {
            this.setState({ item: item,  manualBirthDateCheck: true }, () => {
                this.handlePatientClose();
            });
        } else {
            this.setState({ item: item,  manualBirthDateCheck: false }, () => {
                this.handlePatientClose();
            });
        }
    };

    selectSpecimenType = (value) => {
        this.setState({ specimenType: value })
    };

    handleChangePatient = (event, source) => {
        let { item } = this.state;
        // let { patient } = this.state.item;
        item = item ? item : {};
        item.patient = item.patient ? item.patient : {};

        if (source === "gender") {
            item.patient.gender = event.target.value;
            this.setState({ item: item });
            return;
        }

        if (source === "type") {
            item.patient.type = event.target.value;
            this.setState({ item: item });
            return;
        }

        if (source === "usingSms") {
            item.patient.usingSms = event.target.checked;
            this.setState({ item: item });
            return;
        }

        item.patient[event.target.name] = event.target.value
        this.setState({
            item: item
        }, () => { console.log(this.state.item) });
    };

    handleDialogClose = () => {
        this.setState({
            shouldOpenEditorDialog: false,
            shouldOpenConfirmationDialog: false,
            shouldOpenNotificationPopup: false,
            shouldOpenSelectParentPopup: false,
            shouldOpenHealthOrganizationPopup: false,
            shouldOpenSampleCollectOrgPopup: false,
            shouldOpenSampleBatchDialog: false,
            shouldOpenSampleCollectOpcPopup: false
            // autoGenCode: false
        })
    };

    handlePatientClose = () => {
        this.setState({
            shouldOpenPatientPopup: false
        })
    };

    handleFormSubmit = () => {
        this.setState({ permissionEdit: true, isLoading: true });
        let { id, niheCode, patient, niheCodeInput } = this.state.item;
        let autoGenCode = this.state.autoGenCode
        if (this.state.specimenType != null) {
            this.state.item.specimenType = this.state.specimenType;
        }
        let idPatient = patient?.id;
        let codePatient = patient?.patientCode;
        let objectPatient = { id: idPatient, patientCode: codePatient };
        this.state.item.belongTo = 1; // thuộc về viral Load

        let { item } = this.state
        item.autoGenCode = this.state.autoGenCode;
        this.setState({ item: item })

        if (this.state.DVLM) {
            this.state.item.org = this.state.DVLM
        }
        if (this.state.DVXN) {
            this.state.item.labTest = this.state.DVXN
        }

        if (this.state.item?.manualBirthDate) {
            let { item } = this.state;
            item.birthDate = null;
            this.setState({ item: item })
        }
        else if (this.state.item?.birthDate) {
            let { item } = this.state;
            item.manualBirthDate = null;
            this.setState({ item: item })
        }

        if (this.state.manualBirthDateCheck && this.state.manualBirthDate) {
            this.state.patient.birthDate = null;
        }
        if (!this.state.manualBirthDateCheck && this.state.birthDate) {
            this.state.patient.manualBirthDate = null;
        }

        if (!autoGenCode && this.state.item.niheCode) {
            if (item.niheCodeInput.length != 6) {
                toast.warning("Code mẫu phải nhập đủ 6 chữ số");
                this.setState({ permissionEdit: false, isLoading: false });
                return;
            }
            checkCode(niheCode, niheCodeInput, id).then((result) => {
                if (result.data) {
                    toast.warning("Code mẫu đã được sử dụng");
                    this.setState({ permissionEdit: false, isLoading: false });
                } else {
                    checkCodePatient(objectPatient).then((res) => {
                        if (res.data) {
                            toast.warning("Code bệnh nhân mẫu đã được sử dụng");
                            this.setState({ permissionEdit: false, isLoading: false });
                        } else {
                            if (id) {
                                saveOrUpdate({
                                    ...this.state.item,
                                }).then((data) => {
                                    if (data.data.errorMessage == "409") {
                                        toast.warning("Mã NIHE đã được sử dụng");
                                    } else if (data.data.errorMessage == "500") {
                                        toast.error("Có lỗi xảy ra khi cập nhật");
                                        this.setState({ permissionEdit: false, isLoading: false });
                                    } else {
                                        toast.success("Cập nhật thành công");
                                        this.props.handleOKEditClose();
                                    }
                                    this.setState({ permissionEdit: false, isLoading: false });

                                }).catch(() => {
                                    this.setState({ permissionEdit: false, isLoading: false });
                                    toast.error("Có lỗi xảy ra khi cập nhật");
                                });
                            } else {
                                saveOrUpdate({
                                    ...this.state.item,
                                }).then(() => {
                                    this.setState({ permissionEdit: false, isLoading: false });
                                    toast.success("Thêm mới thành công");
                                    this.props.handleOKEditClose();
                                }).catch(() => {
                                    this.setState({ permissionEdit: false, isLoading: false });
                                    toast.error("Có lỗi xảy ra khi thêm mới");
                                });
                            }
                        }
                    })
                }
            })

        } else {
            checkCodePatient(objectPatient).then((res) => {
                if (res.data) {
                    toast.warning("Code bệnh nhân mẫu đã được sử dụng");
                } else {
                    if (id) {
                        saveOrUpdate({
                            ...this.state.item,
                        }).then(() => {
                            this.setState({ permissionEdit: false, isLoading: false });
                            toast.success("Cập nhật thành công");
                            this.props.handleOKEditClose();
                        }).catch(() => {
                            this.setState({ permissionEdit: false, isLoading: false });
                            toast.error("Có lỗi xảy ra khi cập nhật");
                        });
                    } else {
                        saveOrUpdate({
                            ...this.state.item,
                        }).then(() => {
                            this.setState({ permissionEdit: false, isLoading: false });
                            toast.success("Thêm mới thành công");
                            this.props.handleOKEditClose();
                        }).catch(() => {
                            this.setState({ permissionEdit: false, isLoading: false });
                            toast.error("Có lỗi xảy ra khi thêm mới");
                        });
                    }
                }
            })
        }
    };

    handleDateChange = (value, source) => {
        let { item } = this.state;
        item = item ? item : {};

        item[source] = value;
        this.setState({ item: item });
    };

    shouldOpenPatientPopup = (patient) => {
        let { item } = this.state;
        item.patient = patient;
        this.setState({ ...{ item: item } });
        this.handlePatientClose();
    };

    handleDateChangePatient = (value, source) => {
        let { item } = this.state;
        item = item ? item : {};
        item.patient = item.patient ? item.patient : {};
        item.patient[source] = value;

        this.setState({ item: item })

    };

    componentWillMount() {
        let { open, handleClose, item } = this.props;
        let permissionEdit = item?.permissionEdit;
        this.setState({ item: item, permissionEdit: permissionEdit });
        if (item.specimenType) this.setState({ specimenType: item.specimenType })

        if (this.props.item?.patient?.manualBirthDate != null) {
            this.setState({ manualBirthDateCheck: true })
        } else {
            this.setState({ manualBirthDateCheck: false })
        }


        getAllInfoByUserLogin().then(({ data }) => {
            let nameHealthOrg = data?.userOrganization?.org?.name
            if (data?.userOrganization?.org?.orgType == 2) {
                this.setState({ DVLM: data.userOrganization.org })
            }
            else if (data?.userOrganization?.org?.orgType == 1) {
                this.setState({ DVXN: data.userOrganization.org })
            }
            else {
                if (!this.state.id) {
                    this.setState({ DVXN: null })
                    this.setState({ DVLM: null })
                }
                else {
                    this.setState({ DVLM: item.org })
                    this.setState({ DVXN: item.labTest })
                }
            }
        })
    };

    validateForm(value) {
        let whitespace = new RegExp(/[^\s]+/);
        if (!whitespace.test(value)) {
            return true
        }
        return false
    };

    componentDidMount() {
        ValidatorForm.addValidationRule('whitespace', (value) => {
            if (this.validateForm(value)) {
                return false;
            }
            return true;
        });
    };

    componentWillUnmount() {
        ValidatorForm.removeValidationRule('whitespace');
    };

    handleManualBirthDate = () => {
        let { manualBirthDateCheck } = this.state;
        this.setState({ manualBirthDateCheck: !manualBirthDateCheck })
    }

    render() {
        let { open, t, i18n } = this.props;
        let {
            id,
            shouldOpenHealthOrganizationPopup, shouldOpenSampleCollectOpcPopup,
            shouldOpenSampleCollectOrgPopup, permissionEdit, isLoading,
            labTest, org, item, shouldOpenPatientPopup, patient, specimenType, autoGenCode
        } = this.state;
        let searchObject = { pageIndex: 0, pageSize: 1000000 }
        console.log(this.state)
        return (
            <Dialog open={open} fullWidth maxWidth="lg">
                <div className="p-24">
                    <h4 className="mb-24">{id ? t("general.update") : t("general.add")} {t("specimen.title")}</h4>
                    {isLoading ? <LinearProgress /> : null}
                    <ValidatorForm ref="form" onSubmit={this.handleFormSubmit} onError={errors => console.log(errors)}>
                        <Grid className="" container spacing={2}>
                            {/*----------------- Mã NIHE ---------------------*/}
                            {!item.id &&
                                <Grid item lg={2} md={2} sm={6} xs={12}>
                                    <TextValidator
                                        disabled={permissionEdit ? permissionEdit : autoGenCode}
                                        className="w-100"
                                        variant="outlined"
                                        size="small"
                                        label={<span className="font">
                                            {t("specimen.code")}
                                        </span>}
                                        onChange={(event) => this.handleChange(event, "niheCode")}
                                        type="number"
                                        name="niheCode"
                                        value={item?.niheCodeInput}
                                    />
                                </Grid>
                            }
                            {item.id && item?.niheCode &&
                                <Grid item lg={3} md={3} sm={6} xs={12}>
                                    <TextValidator
                                        className="w-100"
                                        variant="outlined"
                                        size="small"
                                        disabled={permissionEdit ? permissionEdit : autoGenCode}
                                        label={<span className="font">
                                            {t("specimen.code")}
                                        </span>}
                                        onChange={(event) => this.handleChange(event, "niheCode")}
                                        type="number"
                                        name="niheCode"
                                        value={item?.niheCodeInput}

                                    />
                                </Grid>
                            }
                            {item.id && !item?.niheCode &&
                                <Grid item lg={2} md={2} sm={6} xs={12}>
                                    <TextValidator
                                        className="w-100"
                                        variant="outlined"
                                        size="small"
                                        disabled={permissionEdit ? permissionEdit : autoGenCode}
                                        label={<span className="font">
                                            {t("specimen.code")}
                                        </span>}
                                        onChange={(event) => this.handleChange(event, "niheCode")}
                                        type="number"
                                        name="niheCode"
                                        value={item?.niheCodeInput}
                                    />
                                </Grid>
                            }

                            {(!item?.niheCode || !item.id) &&
                                <Grid item lg={1} md={1} sm={6} xs={12}>
                                    <Tooltip title="Tạo mẫu tự động" placement="bottom">
                                        <Checkbox
                                            onChange={this.handleAutoGenCode}
                                            inputProps={{ 'aria-label': 'primary checkbox' }}
                                            title="Tạo mẫu tự động"
                                            disabled={permissionEdit}
                                        />
                                    </Tooltip>
                                </Grid>
                            }
                            {/*----------- Loại mẫu ------------------*/}
                            <Grid item lg={3} md={3} sm={6} xs={12}>
                                {permissionEdit ? (
                                    <>
                                        <TextValidator
                                            className="w-100"
                                            variant="outlined"
                                            size="small"
                                            label={<span className="font">
                                                {t("specimen.type")}
                                            </span>}
                                            onChange={this.handleChange}
                                            type="text"
                                            name="specimenType"
                                            value={this.state.specimenType.name}
                                            disabled={permissionEdit}
                                        />
                                    </>
                                ) : (
                                    <AsynchronousAutocomplete
                                        label={t('specimen.type')}
                                        variant="outlined"
                                        size="small"
                                        searchFunction={searchSpecimenType}
                                        searchObject={searchObject}
                                        displayLable={"name"}
                                        value={this.state.specimenType}
                                        onSelect={this.selectSpecimenType}
                                    />
                                )}
                            </Grid>

                            {/*--------- Tình trạng vận chuyển ------------*/}
                            <Grid item lg={3} md={3} sm={6} xs={12}>
                                <FormControl fullWidth={true} variant="outlined" size="small">
                                    <InputLabel htmlFor="shippingStatus-simple">
                                        {<span className="font"> {t("specimen.shippingStatus")}</span>}
                                    </InputLabel>
                                    <Select
                                        label={<span className="font">{t("specimen.shippingStatus")}</span>}
                                        value={item ? item.shippingStatus : ""}
                                        onChange={(shippingStatus) => this.handleChange(shippingStatus, "shippingStatus")}
                                        inputProps={{
                                            name: "shippingStatus",
                                            id: "shippingStatus-simple",
                                        }}
                                        disabled={permissionEdit}
                                    >
                                        {this.listShippingStatus.map((item) => {
                                            return (
                                                <MenuItem key={item.id} value={item.id}>
                                                    {item.name}
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/*--------- Ngày lấy mẫu ----------------------*/}
                            <Grid item lg={3} md={3} sm={6} xs={12}>
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <KeyboardDatePicker
                                        size="small"
                                        className="w-100"
                                        margin="none"
                                        id="date-picker-dialog"
                                        label={
                                            <span>
                                                {t("specimen.specimenDate")}
                                            </span>
                                        }
                                        inputVariant="outlined"
                                        type="text"
                                        autoOk={true}
                                        format="dd/MM/yyyy HH:mm"
                                        value={item.specimenDate ? item.specimenDate : null}
                                        onChange={(value) => this.handleDateChange(value, "specimenDate")}
                                        KeyboardButtonProps={{
                                            'aria-label': 'change date',
                                        }}
                                        disabled={permissionEdit}
                                    />
                                </MuiPickersUtilsProvider>
                            </Grid>
                            {/*--------- Ngày nhận mẫu --------------------*/}
                            <Grid item lg={3} md={3} sm={6} xs={12}>
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <KeyboardDatePicker
                                        size="small"
                                        className="w-100"
                                        margin="none"
                                        id="date-picker-dialog"
                                        label={
                                            <span>
                                                {t("specimen.receiverDate")}
                                            </span>
                                        }
                                        inputVariant="outlined"
                                        type="text"
                                        autoOk={true}
                                        format="dd/MM/yyyy HH:mm"
                                        value={item.receiverDate ? item.receiverDate : null}
                                        onChange={(value) => this.handleDateChange(value, "receiverDate")}
                                        KeyboardButtonProps={{
                                            'aria-label': 'change date',
                                        }}
                                        disabled={permissionEdit}
                                    />
                                </MuiPickersUtilsProvider>
                            </Grid>

                            {/*------- Người nhận mẫu ----------------- */}
                            <Grid item lg={3} md={3} sm={6} xs={12}>
                                <TextValidator
                                    className="w-100"
                                    variant="outlined"
                                    size="small"
                                    label={<span className="font">
                                        {t("specimen.receiverBy")}
                                    </span>}
                                    onChange={this.handleChange}
                                    type="text"
                                    name="receiverBy"
                                    value={item.receiverBy}
                                    disabled={permissionEdit}
                                />
                            </Grid>

                            {/*--------- Dung tích ----------------------*/}
                            <Grid item lg={3} md={3} sm={6} xs={12}>
                                <TextValidator
                                    className="w-100"
                                    variant="outlined"
                                    size="small"
                                    label={<span className="font">
                                        {t("specimen.volume")}
                                    </span>}
                                    onChange={this.handleChange}
                                    type="text"
                                    name="volume"
                                    value={item.volume}
                                    disabled={permissionEdit}
                                />
                            </Grid>

                            {/*-------- Ngày tách huyết tương ------------*/}
                            <Grid item lg={3} md={3} sm={6} xs={12}>
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <KeyboardDatePicker
                                        size="small"
                                        className="w-100"
                                        margin="none"
                                        id="date-picker-dialog"
                                        label={
                                            <span>
                                                {t("specimen.plasmaSeparationDate")}
                                            </span>
                                        }
                                        inputVariant="outlined"
                                        type="text"
                                        autoOk={true}
                                        format="dd/MM/yyyy HH:mm"
                                        value={item.plasmaSeparationDate ? item.plasmaSeparationDate : null}
                                        onChange={(value) => this.handleDateChange(value, "plasmaSeparationDate")}
                                        KeyboardButtonProps={{
                                            'aria-label': 'change date',
                                        }}
                                        disabled={permissionEdit}
                                    />
                                </MuiPickersUtilsProvider>
                            </Grid>

                            {/*---------- Dung dịch tương huyết --------------*/}
                            <Grid item lg={3} md={3} sm={6} xs={12}>
                                <TextValidator
                                    className="w-100"
                                    variant="outlined"
                                    size="small"
                                    label={<span className="font">
                                        {t("specimen.plasmaVolume")}
                                    </span>}
                                    onChange={this.handleChange}
                                    type="text"
                                    name="plasmaVolume"
                                    value={item.plasmaVolume}
                                    disabled={permissionEdit}
                                />
                            </Grid>

                            {/*---------- Tình trạng mẫu --------------------*/}
                            <Grid item lg={3} md={3} sm={6} xs={12}>
                                <FormControl fullWidth={true} variant="outlined" size="small">
                                    <InputLabel htmlFor="specimenStatus-simple">
                                        {
                                            <span className="font">
                                                {t("specimen.status")}
                                            </span>
                                        }
                                    </InputLabel>
                                    <Select
                                        label={<span className="font">{t("specimen.status")}</span>}
                                        value={item ? item.specimenStatus : ""}
                                        onChange={(specimenStatus) => this.handleChange(specimenStatus, "specimenStatus")}
                                        inputProps={{
                                            name: "specimenStatus",
                                            id: "specimenStatus-simple",
                                        }}
                                        disabled={permissionEdit}
                                    >
                                        {this.listSpecimenStatus.map((item) => {
                                            return (
                                                <MenuItem key={item.id} value={item.id}>
                                                    {item.name}
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/*--------- Mô tả tình trạng mẫu ------------------*/}
                            {item?.specimenStatus == 5 && <Grid item lg={3} md={3} sm={6} xs={12}>
                                <TextValidator
                                    className="w-100"
                                    variant="outlined"
                                    size="small"
                                    label={<span className="font">
                                        {"Mô tả tình trạng mẫu"}
                                    </span>}
                                    onChange={this.handleChange}
                                    type="text"
                                    name="specimenStatusDes"
                                    value={item.specimenStatusDes}
                                    disabled={permissionEdit}
                                />
                            </Grid>}

                            {/*------------- Điều trị AVR ------------------------*/}
                            <Grid item lg={3} md={3} sm={6} xs={12}>
                                <FormControl fullWidth={true} variant="outlined" size="small">
                                    <InputLabel htmlFor="arvTreatment-simple">
                                        {
                                            <span className="font">
                                                {t("specimen.arvTreatment")}
                                            </span>
                                        }
                                    </InputLabel>
                                    <Select
                                        label={<span className="font">{t("specimen.arvTreatment")}</span>}
                                        value={item ? item.arvTreatment : ""}
                                        onChange={(arvTreatment) => this.handleChange(arvTreatment, "arvTreatment")}
                                        inputProps={{
                                            name: "arvTreatment",
                                            id: "arvTreatment-simple",
                                        }}
                                        disabled={permissionEdit}
                                    >
                                        {this.listArvTreatment.map((item) => {
                                            return (
                                                <MenuItem key={item.id} value={item.id}>
                                                    {item.name}
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/*---------- Thời gian điều trị AVR ------------------*/}
                            {item?.arvTreatment == ConstantList.TREAMENT_ARV.haveArvTreatment && <Grid item lg={3} md={3} sm={6} xs={12}>
                                <TextValidator
                                    className="w-100"
                                    variant="outlined"
                                    size="small"
                                    label={<span className="font">
                                        {/* <span style={{ color: "red" }}> * </span> */}
                                        {t("specimen.arvTreatmentTime")}
                                    </span>}
                                    onChange={this.handleChange}
                                    type="text"
                                    name="arvTreatmentTime"
                                    value={item.arvTreatmentTime}
                                    disabled={permissionEdit}
                                // validators={["required", 'whitespace']}
                                // errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                                />
                            </Grid>}

                            {/*----------- Nhiệt độ lưu trữ ----------*/}
                            <Grid item lg={3} md={3} sm={6} xs={12}>
                                <TextValidator
                                    className="w-100"
                                    variant="outlined"
                                    size="small"
                                    label={<span className="font">
                                        {t("specimen.storageTemp")}
                                    </span>}
                                    onChange={this.handleChange}
                                    type="text"
                                    name="storageTemp"
                                    value={item.storageTemp}
                                    disabled={permissionEdit}
                                />
                            </Grid>

                            {/*--------- Nhiệt độ vận chuyển ------------*/}
                            <Grid item lg={3} md={3} sm={6} xs={12}>
                                <TextValidator
                                    className="w-100"
                                    variant="outlined"
                                    size="small"
                                    label={<span className="font">
                                        {t("specimen.shippingTemp")}
                                    </span>}
                                    onChange={this.handleChange}
                                    type="text"
                                    name="shippingTemp"
                                    value={item.shippingTemp}
                                    disabled={permissionEdit}
                                />
                            </Grid>

                            {/*----------- Nhiệt độ nhận mẫu -----------*/}
                            <Grid item lg={3} md={3} sm={6} xs={12}>
                                <TextValidator
                                    className="w-100"
                                    variant="outlined"
                                    size="small"
                                    label={<span className="font">
                                        {t("specimen.receivedTemp")}
                                    </span>}
                                    onChange={this.handleChange}
                                    type="text"
                                    name="receivedTemp"
                                    value={item.receivedTemp}
                                    disabled={permissionEdit}
                                />
                            </Grid>

                            {/*----- Email nhân viên nhận kết quả ----------*/}
                            <Grid item lg={3} md={3} sm={6} xs={12}>
                                <TextValidator
                                    className="w-100"
                                    variant="outlined"
                                    size="small"
                                    label={<span className="font">
                                        {t("specimen.userReceivedResultEmail")}
                                    </span>}
                                    onChange={this.handleChange}
                                    type="text"
                                    name="userReceivedResultEmail"
                                    value={item.userReceivedResultEmail}
                                    validators={["isEmail"]}
                                    errorMessages={["Chưa đúng định dạng email"]}
                                    disabled={permissionEdit}
                                />
                            </Grid>

                            {/*---- Số điện thoại nhân viện nhận kết quả ---------*/}
                            <Grid item lg={3} md={3} sm={6} xs={12}>
                                <TextValidator
                                    className="w-100"
                                    variant="outlined"
                                    size="small"
                                    label={<span className="font">
                                        {t("specimen.userReceivedResultPhone")}
                                    </span>}
                                    onChange={this.handleChange}
                                    type="text"
                                    name="userReceivedResultPhone"
                                    value={item.userReceivedResultPhone}
                                    disabled={permissionEdit}
                                />
                            </Grid>

                            {/*-------- Nguồn mẫu -------------*/}
                            <Grid item lg={3} md={3} sm={6} xs={12}>
                                <TextValidator
                                    className="w-100"
                                    variant="outlined"
                                    size="small"
                                    label={<span className="font">
                                        {t("specimen.specimenSource")}
                                    </span>}
                                    onChange={this.handleChange}
                                    type="text"
                                    name="specimenSource"
                                    value={item.specimenSource}
                                    disabled={permissionEdit}
                                />
                            </Grid>

                            {/*--------- Tỉnh gửi mẫu ------------*/}
                            <Grid item lg={3} md={3} sm={6} xs={12}>
                                <TextValidator
                                    className="w-100"
                                    variant="outlined"
                                    size="small"
                                    label={<span className="font">
                                        {t("specimen.provinceSpecimen")}
                                    </span>}
                                    // onChange={this.handleChange}
                                    type="text"
                                    name="provinceSpecimen"
                                    value={this.state.DVLM?.province ? this.state.DVLM.province : ""}
                                    disabled={permissionEdit}
                                />
                            </Grid>

                            {/*---------- Ghi chú ---------------*/}
                            <Grid item lg={3} md={3} sm={6} xs={12}>
                                <TextValidator
                                    className="w-100"
                                    variant="outlined"
                                    size="small"
                                    label={<span className="font">
                                        {t("specimen.note")}
                                    </span>}
                                    onChange={this.handleChange}
                                    type="text"
                                    name="note"
                                    value={item.note}
                                    disabled={permissionEdit}
                                />
                            </Grid>

                            {/*--------- OPC ----------------*/}
                            <Grid item lg={3} md={3} sm={6} xs={12}>
                                <TextValidator
                                    size="small"
                                    variant="outlined"
                                    className="w-100 "
                                    label={
                                        <span className="font">
                                            OPC
                                        </span>
                                    }
                                    name="opc"
                                    value={item?.opc?.name ? item.opc.name : ""}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Button
                                                    size={'small'}
                                                    className="align-bottom"
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => this.setState({ shouldOpenSampleCollectOpcPopup: true })}
                                                    disabled={permissionEdit}
                                                >
                                                    {t('Select')}
                                                </Button>
                                            </InputAdornment>
                                        ),
                                    }}
                                    disabled={permissionEdit}
                                />
                                {shouldOpenSampleCollectOpcPopup && (
                                    <HealthOrganizationPopup
                                        open={shouldOpenSampleCollectOpcPopup}
                                        orgType={2}
                                        handleSelect={this.handleSelectSampleCollectOpc}
                                        item={org}
                                        handleClose={this.handleDialogClose}
                                        t={t} i18n={i18n}
                                    ></HealthOrganizationPopup>
                                )}
                            </Grid>

                            {/*---------- Đơn vị lấy mẫu ------------*/}
                            <Grid className="" container spacing={2}>
                                {!item.id && (
                                    <Grid item lg={6} md={6} sm={6} xs={12}>
                                        <TextValidator
                                            size="small"
                                            variant="outlined"
                                            className="w-100 "
                                            label={
                                                <span className="font">
                                                    {t("specimen.orgSelect")}
                                                </span>
                                            }
                                            name="org"
                                            value={this.state.DVLM?.name ? this.state.DVLM?.name : ""}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Button
                                                            size={'small'}
                                                            className="align-bottom"
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={() => this.setState({ shouldOpenSampleCollectOrgPopup: true })}
                                                            disabled={permissionEdit}
                                                        >
                                                            {t('Select')}
                                                        </Button>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            disabled={permissionEdit}
                                        />

                                        {shouldOpenSampleCollectOrgPopup && (
                                            <HealthOrganizationPopup
                                                open={shouldOpenSampleCollectOrgPopup}
                                                orgType={2}
                                                handleSelect={this.handleSelectSampleCollectOrg}
                                                item={org}
                                                handleClose={this.handleDialogClose}
                                                t={t} i18n={i18n}
                                            ></HealthOrganizationPopup>
                                        )}
                                    </Grid>
                                )}

                                {/*-------- Đơn vị xét nghiệm -------*/}
                                {item.id && (
                                    <Grid item lg={6} md={6} sm={6} xs={12}>
                                        <TextValidator
                                            size="small"
                                            variant="outlined"
                                            className="w-100 "
                                            label={
                                                <span className="font">
                                                    {t("specimen.orgSelect")}
                                                </span>
                                            }
                                            name="org"
                                            value={item?.org ? item.org.name : ""}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Button
                                                            size={'small'}
                                                            className="align-bottom"
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={() => this.setState({ shouldOpenSampleCollectOrgPopup: true })}
                                                            disabled={permissionEdit}
                                                        >
                                                            {t('Select')}
                                                        </Button>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            disabled={permissionEdit}
                                        />
                                        {shouldOpenSampleCollectOrgPopup && (
                                            <HealthOrganizationPopup
                                                open={shouldOpenSampleCollectOrgPopup}
                                                orgType={2}
                                                handleSelect={this.handleSelectSampleCollectOrg}
                                                item={org}
                                                handleClose={this.handleDialogClose}
                                                t={t} i18n={i18n}
                                            ></HealthOrganizationPopup>
                                        )
                                        }
                                    </Grid>
                                )}
                                {!item.id && (
                                    <Grid item lg={6} md={6} sm={6} xs={12}>
                                        <TextValidator
                                            size="small"
                                            variant="outlined"
                                            className="w-100 "
                                            label={
                                                <span className="font">
                                                    {t("specimen.labTestSelect")}
                                                </span>
                                            }
                                            name="labTest"
                                            value={this.state.DVXN?.name ? this.state.DVXN?.name : ""}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Button
                                                            size={'small'}
                                                            className="align-bottom"
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={() => this.setState({ shouldOpenHealthOrganizationPopup: true })}
                                                            disabled={permissionEdit}
                                                        >
                                                            {t('Select')}
                                                        </Button>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            disabled={permissionEdit}
                                        />
                                        {shouldOpenHealthOrganizationPopup && (
                                            <HealthOrganizationPopup
                                                open={shouldOpenHealthOrganizationPopup}
                                                orgType={1}
                                                handleSelect={this.handleSelectHealthOrganization}
                                                item={labTest}
                                                handleClose={this.handleDialogClose}
                                                t={t} i18n={i18n}
                                            ></HealthOrganizationPopup>
                                        )
                                        }
                                    </Grid>
                                )}

                                {item.id && (
                                    <Grid item lg={6} md={6} sm={6} xs={12}>
                                        <TextValidator
                                            size="small"
                                            variant="outlined"
                                            className="w-100 "
                                            label={
                                                <span className="font">
                                                    {t("specimen.labTestSelect")}
                                                </span>
                                            }
                                            name="labTest"
                                            value={item?.labTest ? item?.labTest?.name : ""}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Button
                                                            size={'small'}
                                                            className="align-bottom"
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={() => this.setState({ shouldOpenHealthOrganizationPopup: true })}
                                                            disabled={permissionEdit}
                                                        >
                                                            {t('Select')}
                                                        </Button>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        {shouldOpenHealthOrganizationPopup && (
                                            <HealthOrganizationPopup
                                                open={shouldOpenHealthOrganizationPopup}
                                                orgType={1}
                                                handleSelect={this.handleSelectHealthOrganization}
                                                item={labTest}
                                                handleClose={this.handleDialogClose}
                                                t={t} i18n={i18n}
                                            ></HealthOrganizationPopup>
                                        )
                                        }
                                    </Grid>
                                )}

                            </Grid>
                            {/*--------------- Thông tin bệnh nhân -----------*/}
                            <Grid xs={12}>
                                <fieldset>
                                    <legend>Thông tin bệnh nhân</legend>
                                    {/*------ Chọn bệnh nhân -----------*/}
                                    {item?.isAddnew && (<Grid xs={12}>
                                        <Button
                                            className="mt-8 mb-12"
                                            variant="contained"
                                            size="small"
                                            color="primary"
                                            onClick={() => { this.setState({ shouldOpenPatientPopup: true }) }}>{t('specimen.patientSelect')}
                                        </Button>

                                        {shouldOpenPatientPopup && (
                                            <PatientSearchDialog
                                                open={shouldOpenPatientPopup}
                                                handleSelect={this.handleSelectPatient}
                                                item={patient}
                                                handleClose={this.handlePatientClose}
                                                t={t}
                                                i18n={i18n}
                                            ></PatientSearchDialog>
                                        )}
                                    </Grid>)
                                    }
                                    <Grid item container xs={12} spacing={2}>
                                        {/*------- Mã bệnh nhân -----------*/}
                                        <Grid item lg={3} md={3} sm={6} xs={12}>
                                            <TextValidator
                                                className="w-100"
                                                variant="outlined"
                                                size="small"
                                                label={<span className="font">
                                                    {/* <span style={{ color: "red" }}> * </span> */}
                                                    {t("patient.code")}
                                                </span>}
                                                onChange={this.handleChangePatient}
                                                type="text"
                                                name="patientCode"
                                                value={item?.patient ? item?.patient?.patientCode : ""}
                                                disabled={permissionEdit}
                                            // validators={["required", 'whitespace']}
                                            // errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                                            />
                                        </Grid>
                                        {/*-------- Tên bệnh nhân ----------*/}
                                        <Grid item lg={3} md={3} sm={6} xs={12}>
                                            <TextValidator
                                                className="w-100"
                                                variant="outlined"
                                                size="small"
                                                label={<span className="font">
                                                    {/* <span style={{ color: "red" }}> * </span> */}
                                                    {t("patient.name")}
                                                </span>}
                                                onChange={this.handleChangePatient}
                                                type="text"
                                                name="fullName"
                                                value={item?.patient ? item?.patient?.fullName : ""}
                                                disabled={permissionEdit}
                                            // validators={["required", 'whitespace']}
                                            // errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                                            />
                                        </Grid>
                                        {/*--------- Số điện thoại ----------*/}
                                        <Grid item lg={3} md={3} sm={6} xs={12}>
                                            <TextValidator
                                                className="w-100"
                                                variant="outlined"
                                                size="small"
                                                label={<span className="font">
                                                    {/* <span style={{ color: "red" }}> * </span> */}
                                                    {t("patient.phone")}
                                                </span>}
                                                onChange={this.handleChangePatient}
                                                type="text"
                                                name="phone"
                                                value={item?.patient ? item?.patient?.phone : ""}
                                                disabled={permissionEdit}
                                            // validators={["required", 'whitespace']}
                                            // errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                                            />
                                        </Grid>
                                        {/*--------- Ngày tháng năm sinh -------*/}
                                        {this.props.isAddnew &&
                                            <>
                                                <Grid item lg={2} md={2} sm={6} xs={12}>
                                                    <TextValidator
                                                        className="w-100"
                                                        variant="outlined"
                                                        size="small"
                                                        label={<span className="font">
                                                            <span style={{ color: "red" }}> * </span>
                                                            {t("general.dob")}
                                                        </span>}
                                                        onChange={(manualBirthDate) => this.handleChange(manualBirthDate, "manualBirthDate")}
                                                        type="text"
                                                        name="manualBirthDate"
                                                        value={item?.patient ? (item?.patient?.manualBirthDate ? item?.patient?.manualBirthDate : null) : null}
                                                        validators={["required", 'whitespace']}
                                                        errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                                                    />
                                                </Grid>

                                                <Grid item lg={2} md={2} sm={5} xs={12}>
                                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                        <KeyboardDatePicker
                                                            size="small"
                                                            className="w-100"
                                                            margin="none"
                                                            id="date-picker-dialog"
                                                            label={
                                                                <span>
                                                                    {t("general.dob")}
                                                                </span>
                                                            }
                                                            inputVariant="outlined"
                                                            type="text"
                                                            autoOk={true}
                                                            format="dd/MM/yyyy"
                                                            value={item?.patient ? (item?.patient?.birthDate ? item?.patient?.birthDate : null) : null}
                                                            onChange={(value) => this.handleDateChangePatient(value, "birthDate")}
                                                            KeyboardButtonProps={{
                                                                'aria-label': 'change date',
                                                            }}
                                                        />
                                                    </MuiPickersUtilsProvider>
                                                </Grid>
                                            </>
                                        }
                                        {!this.props.isAddnew &&
                                            <>
                                                {this.state.manualBirthDateCheck &&
                                                    <Grid item lg={2} md={2} sm={5} xs={12}>
                                                        <TextValidator
                                                            className="w-100"
                                                            variant="outlined"
                                                            size="small"
                                                            label={<span className="font">
                                                                <span style={{ color: "red" }}> * </span>
                                                                {t("general.dob")}
                                                            </span>}
                                                            onChange={(manualBirthDate) => this.handleChange(manualBirthDate, "manualBirthDate")} type="text"
                                                            name="manualBirthDate"
                                                            value={item?.patient ? (item?.patient?.manualBirthDate ? item?.patient?.manualBirthDate : null) : null}
                                                            validators={["required", 'whitespace']}
                                                            errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                                                            disabled={permissionEdit}
                                                        />
                                                    </Grid>
                                                }

                                                {!this.state.manualBirthDateCheck &&
                                                    <Grid item lg={2} md={2} sm={5} xs={12}>
                                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                            <KeyboardDatePicker
                                                                size="small"
                                                                className="w-100"
                                                                margin="none"
                                                                id="date-picker-dialog"
                                                                label={
                                                                    <span>
                                                                        {t("general.dob")}
                                                                    </span>
                                                                }
                                                                inputVariant="outlined"
                                                                type="text"
                                                                autoOk={true}
                                                                format="dd/MM/yyyy"
                                                                value={item?.patient ? (item?.patient?.birthDate ? item?.patient?.birthDate : null) : null}
                                                                onChange={(value) => this.handleDateChangePatient(value, "birthDate")}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
                                                                disabled={permissionEdit}
                                                            />
                                                        </MuiPickersUtilsProvider>
                                                    </Grid>
                                                }
                                            </>
                                        }

                                        <Grid item lg={1} md={1} sm={1} xs={12}>
                                            <Tooltip title="Nhập tay" placement="bottom">
                                                <Checkbox
                                                    checked={this.state.manualBirthDateCheck}
                                                    onChange={this.handleManualBirthDate}
                                                    inputProps={{ 'aria-label': 'primary checkbox' }}
                                                    title="Nhập tay"
                                                    disabled={permissionEdit}
                                                />
                                            </Tooltip>
                                        </Grid>
                                        {/*------------ Loại bệnh nhân --------------*/}
                                        <Grid item lg={3} md={3} sm={6} xs={12}>
                                            <FormControl fullWidth={true} variant="outlined" size="small">
                                                <InputLabel htmlFor="type-simple">
                                                    {
                                                        <span className="font">
                                                            {t("patient.type")}
                                                        </span>
                                                    }
                                                </InputLabel>
                                                <Select
                                                    label={<span className="font">{t("patient.type")}</span>}
                                                    value={item?.patient ? item?.patient?.type : ""}
                                                    onChange={(type) => this.handleChangePatient(type, "type")}
                                                    inputProps={{
                                                        name: "type",
                                                        id: "type-simple",
                                                    }}
                                                    disabled={permissionEdit}
                                                >
                                                    {this.listType.map((item) => {
                                                        return (
                                                            <MenuItem key={item.id} value={item.id}>
                                                                {item.name}
                                                            </MenuItem>
                                                        );
                                                    })}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        {/*------------- Giới tính ------------------------*/}
                                        <Grid item lg={3} md={3} sm={6} xs={12}>
                                            <FormControl fullWidth={true} variant="outlined" size="small">
                                                <InputLabel htmlFor="gender-simple">
                                                    {
                                                        <span className="font">
                                                            {t("user.gender")}
                                                        </span>
                                                    }
                                                </InputLabel>
                                                <Select
                                                    label={<span className="font">{t("user.gender")}</span>}
                                                    value={item?.patient ? item?.patient?.gender : ""}
                                                    onChange={(gender) => this.handleChangePatient(gender, "gender")}
                                                    inputProps={{
                                                        name: "gender",
                                                        id: "gender-simple",
                                                    }}
                                                    disabled={permissionEdit}
                                                >
                                                    {this.listGender.map((item) => {
                                                        return (
                                                            <MenuItem key={item.id} value={item.id}>
                                                                {item.name}
                                                            </MenuItem>
                                                        );
                                                    })}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        {/*--------- Địa chỉ ---------------------*/}
                                        <Grid item lg={3} md={3} sm={6} xs={12}>
                                            <TextValidator
                                                className="w-100"
                                                variant="outlined"
                                                size="small"
                                                label={<span className="font">
                                                    {t("patient.address")}
                                                </span>}
                                                onChange={this.handleChangePatient}
                                                type="text"
                                                name="address"
                                                value={item?.patient ? item?.patient?.address : ""}
                                                disabled={permissionEdit}
                                            />
                                        </Grid>
                                        {/*------------- Checkbox SMS ------------*/}
                                        <Grid item sm={12} xs={12}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={item?.patient?.usingSms}
                                                        onChange={(usingSms) => this.handleChangePatient(usingSms, "usingSms")}
                                                        value="usingSms"
                                                    />
                                                }
                                                label="Nhận SMS"
                                                disabled={permissionEdit}
                                            />
                                        </Grid>
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
                                <Button variant="contained" color="primary" type="submit" disabled={permissionEdit}>
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

export default SpecimenEditorDialog;

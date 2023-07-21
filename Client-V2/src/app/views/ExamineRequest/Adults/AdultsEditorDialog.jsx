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
} from "@material-ui/core";
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from "@material-ui/pickers";
import DateFnsUtils from '@date-io/date-fns'
import ConstantList from "../../../appConfig";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { saveOrUpdate, checkCode } from "./AdultsService";
import Autocomplete from "@material-ui/lab/Autocomplete";
// import HealthOrganizationPopup from "./HealthOrganizationPopup";
// import PatientSearchDialog from "./PatientSearchDialog";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// toast.configure({
//     autoClose: 2000,
//     draggable: false,
//     limit: 3,
// });

class AdultsEditorDialog extends Component {
    state = {
        name: "",
        code: "",
        item: {},
        isActive: false,
        shouldOpenSampleCollectOrgPopup: false,
    };

    listGender = [
        { id: "M", name: "Nam" },
        { id: "F", name: "Nữ" },
        { id: "U", name: "Không rõ" },
    ];

    listType = [
        { id: 1, name: "Trẻ dưới 18 tháng" },
        { id: 2, name: "Trẻ trên 18 tháng và người lớn" },
        { id: 3, name: "Người đang điều trị HIV" }
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

    handleSelectSampleCollectOrg = (sampleCollectOrg) => {
        let { item } = this.state;
        item = item ? item : {};
        if (sampleCollectOrg && sampleCollectOrg.id) {
            item["org"] = sampleCollectOrg;
            this.setState({ item: item });
            this.handleDialogClose();
        }
    }

    handleSelectHealthOrganization = (labTest) => {
        let { item } = this.state;
        item = item ? item : {};
        if (labTest && labTest.id) {
            item["labTest"] = labTest;
            this.setState({ item: item });
            this.handleDialogClose();
        }
    }

    handleChange = (event, source) => {
        let { item } = this.state;
        item = item ? item : {};

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
        item[event.target.name] = event.target.value
        this.setState({
            item: item
        });
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
    }
    handleDialogClose = () => {
        this.setState({
            shouldOpenEditorDialog: false,
            shouldOpenConfirmationDialog: false,
            shouldOpenNotificationPopup: false,
        })
    }

    handlePatientClose = () => {
        this.setState({
            shouldOpenSuspectedPersonPopup: false
        })
    }

    handleFormSubmit = () => {
        let { id, niheCode } = this.state.item;
        let object = { id: id, niheCode: niheCode };
        checkCode(object).then((result) => {
            if (result.data) {
                toast.warning("Code đã được sử dụng");
            } else {
                if (id) {
                    saveOrUpdate({
                        ...this.state.item,
                    }).then(() => {
                        toast.success("Cập nhật thành công");
                        this.props.handleOKEditClose();
                    }).catch(() => {
                        toast.error("Có lỗi xảy ra khi cập nhật");
                    });
                } else {
                    saveOrUpdate({
                        ...this.state.item,
                    }).then(() => {
                        toast.success("Thêm mới thành công");
                        this.props.handleOKEditClose();
                    }).catch(() => {
                        toast.error("Có lỗi xảy ra khi thêm mới");
                    });
                }
            }
        })
    };

    handleDateChange = (value, source) => {
        let { item } = this.state;
        item = item ? item : {};

        item[source] = value;
        this.setState({ item: item });
    }

    shouldOpenPatientPopup = (patient) => {
        let { item } = this.state;
        item.patient = patient;

        this.setState({ ...{ item: item } });
        this.handlePatientClose();
    }

    handleDateChangePatient = (value, source) => {
        let { item } = this.state;
        item = item ? item : {};
        item.patient = item.patient ? item.patient : {};
        item.patient[source] = value;
        this.setState({ item: item });
    }

    componentWillMount() {
        let { open, handleClose, item } = this.props;
        this.setState({ item: item });
    }

    validateForm(value) {
        let whitespace = new RegExp(/[^\s]+/);
        if (!whitespace.test(value)) {
            return true
        }
        return false
    }

    componentDidMount() {
        ValidatorForm.addValidationRule('whitespace', (value) => {
            if (this.validateForm(value)) {
                return false;
            }
            return true;
        });
    }

    componentWillUnmount() {
        ValidatorForm.removeValidationRule('whitespace');
    }

    render() {
        let { open, handleClose, handleOKEditClose, t, i18n } = this.props;
        let {
            id,
            name,
            code,
            description,
            isExternalOrg,
            labTest, org, item, shouldOpenPatientPopup, patient
        } = this.state;

        return (
            <Dialog open={open} fullWidth maxWidth="lg">
                <div className="p-24">
                    <h4 className="mb-24">{id ? t("general.update") : t("general.add")} {t("specimen.title")}</h4>
                    <ValidatorForm ref="form" onSubmit={this.handleFormSubmit}>
                        <Grid className="mt-8" container spacing={2}>
                            <Grid className="mt-8" xs={12}>
                                <fieldset>
                                    <legend>ĐƠN VỊ CHỈ ĐỊNH XÉT NGHIỆM</legend>
                                    <Grid container spacing={2}>
                                        <Grid item lg={3} md={3} sm={6} xs={12}>
                                            <TextValidator
                                                className="w-100"
                                                variant="outlined"
                                                size="small"
                                                label={<span className="font">
                                                    <span style={{ color: "red" }}> * </span>
                                                    {t("patient.code")}
                                                </span>}
                                                onChange={this.handleChangePatient}
                                                type="text"
                                                name="patientCode"
                                                value={item?.patient ? item?.patient?.patientCode : ""}
                                                validators={["required", 'whitespace']}
                                                errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                                            />
                                        </Grid>

                                        <Grid item lg={3} md={3} sm={6} xs={12}>
                                            <TextValidator
                                                className="w-100"
                                                variant="outlined"
                                                size="small"
                                                label={<span className="font">
                                                    <span style={{ color: "red" }}> * </span>
                                                    {t("patient.name")}
                                                </span>}
                                                onChange={this.handleChangePatient}
                                                type="text"
                                                name="fullName"
                                                value={item?.patient ? item?.patient?.fullName : ""}
                                                validators={["required", 'whitespace']}
                                                errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                                            />
                                        </Grid>

                                        <Grid item lg={3} md={3} sm={6} xs={12}>
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

                                        <Grid item lg={3} md={3} sm={6} xs={12}>
                                            <TextValidator
                                                className="w-100"
                                                variant="outlined"
                                                size="small"
                                                label={<span className="font">
                                                    {t("general.address")}
                                                </span>}
                                                onChange={this.handleChangePatient}
                                                type="text"
                                                name="address"
                                                value={item?.patient ? item?.patient?.address : ""}
                                            />
                                        </Grid>

                                        <Grid item lg={3} md={3} sm={6} xs={12}>
                                            <TextValidator
                                                className="w-100"
                                                variant="outlined"
                                                size="small"
                                                label={<span className="font">
                                                    {t("person.permanentAddress")}
                                                </span>}
                                                onChange={this.handleChangePatient}
                                                type="text"
                                                name="permanentAddress"
                                                value={item?.patient ? item?.patient?.permanentAddress : ""}
                                            />
                                        </Grid>

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
                                        {item?.arvTreatment == ConstantList.TREAMENT_ARV.haveArvTreatment && <Grid item lg={3} md={3} sm={6} xs={12}>
                                            <TextValidator
                                                className="w-100"
                                                variant="outlined"
                                                size="small"
                                                label={<span className="font">
                                                    <span style={{ color: "red" }}> * </span>
                                                    {t("specimen.arvTreatmentTime")}
                                                </span>}
                                                onChange={this.handleChange}
                                                type="text"
                                                name="arvTreatmentTime"
                                                value={item.arvTreatmentTime}
                                                validators={["required", 'whitespace']}
                                                errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                                            />
                                        </Grid>}
                                        <Grid item lg={12} md={12} sm={12} xs={12}>
                                            <TextValidator
                                                className="w-100"
                                                variant="outlined"
                                                size="small"
                                                label={<span className="font">
                                                    {t("specimen.reasonDetail")}
                                                </span>}
                                                onChange={this.handleChange}
                                                type="text"
                                                name="reasonDetail"
                                                value={item.reasonDetail}
                                            />
                                        </Grid>
                                    </Grid>
                                </fieldset>
                            </Grid>

                            <Grid className="mt-16" xs={12}>
                                <fieldset>
                                    <legend>ĐƠN VỊ LẤY MẪU, TÁCH HUYẾT TƯƠNG</legend>
                                    <Grid xs={12} container spacing={2}>
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
                                                    format="dd/MM/yyyy HH:ss"
                                                    value={item.specimenDate ? item.specimenDate : null}
                                                    onChange={(value) => this.handleDateChange(value, "specimenDate")}
                                                    KeyboardButtonProps={{
                                                        'aria-label': 'change date',
                                                    }}
                                                />
                                            </MuiPickersUtilsProvider>
                                        </Grid>

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
                                                    format="dd/MM/yyyy HH:ss"
                                                    value={item.plasmaSeparationDate ? item.plasmaSeparationDate : null}
                                                    onChange={(value) => this.handleDateChange(value, "plasmaSeparationDate")}
                                                    KeyboardButtonProps={{
                                                        'aria-label': 'change date',
                                                    }}
                                                />
                                            </MuiPickersUtilsProvider>
                                        </Grid>

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
                                            />
                                        </Grid>
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
                                            />
                                        </Grid>

                                    </Grid>
                                </fieldset>
                            </Grid>


                            <Grid className="mt-16" xs={12}>
                                <fieldset>
                                    <legend>PHÒNG XÉT NGHIỆM SINH HỌC PHÂN TỬ HIV</legend>
                                    <Grid xs={12} container spacing={2}>
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
                                                    format="dd/MM/yyyy HH:ss"
                                                    value={item.receiverDate ? item.receiverDate : null}
                                                    onChange={(value) => this.handleDateChange(value, "receiverDate")}
                                                    KeyboardButtonProps={{
                                                        'aria-label': 'change date',
                                                    }}
                                                />
                                            </MuiPickersUtilsProvider>
                                        </Grid>
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
                                            />
                                        </Grid>
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
                                            // validators={["required", 'whitespace']}
                                            // errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                                            />
                                        </Grid>
                                        <Grid item lg={3} md={3} sm={6} xs={12}>
                                            <FormControl fullWidth={true} variant="outlined" size="small">
                                                <InputLabel htmlFor="specimenType-simple">
                                                    {
                                                        <span className="font">
                                                            {/* <span style={{ color: "red" }}>*</span> */}
                                                            {t("specimen.type")}
                                                        </span>
                                                    }
                                                </InputLabel>
                                                <Select
                                                    label={<span className="font">{t("specimen.type")}</span>}
                                                    value={item ? item.specimenType : ""}
                                                    onChange={(specimenType) => this.handleChange(specimenType, "specimenType")}
                                                    inputProps={{
                                                        name: "specimenType",
                                                        id: "specimenType-simple",
                                                    }}
                                                >
                                                    {this.listSpecimenType.map((item) => {
                                                        return (
                                                            <MenuItem key={item.id} value={item.id}>
                                                                {item.name}
                                                            </MenuItem>
                                                        );
                                                    })}
                                                </Select>
                                            </FormControl>
                                        </Grid>
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
                                            />
                                        </Grid>

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

export default AdultsEditorDialog;

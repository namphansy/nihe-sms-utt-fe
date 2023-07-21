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
import ConstantList from "../../appConfig";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { checkCode as checkCodePatient } from "../Patient/PatientServices";
import UserRoles from "app/services/UserRoles";
import { saveOrUpdate, checkCode } from "./SpecimenOver18mEIDService";
import AsynchronousAutocomplete from '../../views/utilities/AsynchronousAutocomplete'
import Autocomplete from "@material-ui/lab/Autocomplete";
import HealthOrganizationPopup from "./HealthOrganizationPopup";
import { searchByPage as searchSpecimenType } from '../SpecimenType/SpecimenTypeService'
import PatientSearchDialog from "./PatientSearchDialog";
import { toast } from "react-toastify";
import Tooltip from '@material-ui/core/Tooltip';
import "react-toastify/dist/ReactToastify.css";
import { getAllInfoByUserLogin } from "../User/UserService";
import Constant from "../Patient/Constant";
import { connect } from 'react-redux';
import { getLoading } from '../../redux/actions/LoadingActions';

toast.configure({
    autoClose: 2000,
    draggable: false,
    limit: 3,
});

class SpecimenOver18mEIDDialog extends Component {
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
        patient: {
            relatePatient: []
        },
        listSpecimenType: [],
        manualBirthDateCheck: false,
        specimenType: null
    };

    listGender = [
        { id: "M", name: "Nam" },
        { id: "F", name: "Nữ" },
        { id: "U", name: "Không rõ" },
    ];

    listType = [
        { id: 2, name: "Trẻ trên 18 tháng và người lớn" },
    ]

    // listSpecimenType = [
    //     { id: 1, name: "Mẫu máu toàn phần" },
    //     { id: 2, name: "Huyết tương" },
    //     { id: 3, name: "Huyết thanh" },
    //     { id: 4, name: "DBS" },
    //     { id: 5, name: "Khác" },
    // ];

    listSpecimenStatus = [
        { id: 1, name: "Tốt" },
        { id: 2, name: "Tán huyết" },
        { id: 3, name: "Thiếu thể tích" },
        { id: 4, name: "Có cục đông" },
        { id: 5, name: "Khác" },
    ]

    listShippingStatus = [
        { id: 'Draft', name: "Tạo mới" },
        { id: 'Pending', name: "Chờ xử lý" },
        { id: 'Accepted', name: "Đã được chấp nhận" },
        { id: 'Resulted', name: "Đã có kết quả" }
    ]

    listArvTreatment = [
        { id: 1, name: "Có" },
        { id: 2, name: "Không" },
        { id: 3, name: "Không xác định" }
    ]

    listReasonDetail = [
        { id: 4, name: "Mẫu khó, không xác định được bằng xét nghiệm kháng nguyên, kháng thể"},
        { id: 5, name: "Tai nạn rủi ro nghề nghiệp của cán bộ y tế."},
        { id: 6, name: "Chỉ định từ BYT cho các cán bộ công an, bộ đội đang làm nhiệm vụ"},
        { id: 7, name: "Khác"}
    ]
    gender = (value) => {
        //Khai báo const
        let name = "";
        if (value == 'M') {
            name = "Nam";
        } else if (value == "F") {
            name = "Nữ";
        } else if (value == "U") {
            name = "Không xác định";
        }
        return name;
    }
    handleSelectSampleCollectOrg = (sampleCollectOrg) => {
        if (sampleCollectOrg && sampleCollectOrg.id) {
            this.setState({ DVLM: sampleCollectOrg });
            // this.state.DVLM.name = sampleCollectOrg.name;
            this.setState({ org: sampleCollectOrg });
            this.handleDialogClose();
        }
    }

    handleSelectHealthOrganization = (labTest) => {
        if (labTest && labTest.id) {
            this.setState({ DVXN: labTest })
            // this.state.DVXN.name = labTest.name;
            this.setState({ labTest: labTest });
            this.handleDialogClose();
        }
    }
    handleAutoGenCode = () => {
        if (this.state.autoGenCode == true) {
            this.setState({ autoGenCode: false })
        }
        if (this.state.autoGenCode == false) {
            this.setState({ niheCode: null })
            this.setState({ autoGenCode: true })
        }
    }

    handleChange = (event, source) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };

    handleSelectPatient = (patient) => {
        this.setState({ patient: patient }, () => {
            this.handlePatientClose();
        });
    }
    handleChangePatient = (event, source) => {
        // console.log(event, source)
        let { patient } = this.state;
        patient = patient ? patient : {};

        if (source === "gender") {
            patient.gender = event.target.value;
            this.setState({ patient: patient });
            return;
        }
        if (source === "socialId") {
            console.log("hue ")
            patient.socialId = event.target.value;
            this.setState({ patient: patient });
            return;
        }

        if (source === "type") {
            patient.type = event.target.value;
            this.setState({ patient: patient });
            return;
        }

        if (source === "usingSms") {
            patient.usingSms = event.target.checked;
            this.setState({ patient: patient });
            return;
        }
        console.log(1);
        patient[event.target.name] = event.target.value;
        this.setState({
            patient: patient
        });
        // console.log(patient);
    }

    handleRelatedChange = (event, source) => {
        let { patient } = this.state;
        patient[event.target.name] = event.target.value;
        this.setState({ patient: patient });
    };

    handleRelatedChangeType = (event, source) => {
        let { patient } = this.state;
        // relatePatient = relatePatient ? relatePatient : {};
        // relatePatient[source] = event.target.value;
        // this.setState({ relatePatient: relatePatient });
        patient.relatePatient = patient.relatePatient ? patient.relatePatient : {};
        patient.relatePatient[0] = { ...patient.relatePatient[0], [event.target.name]: event.target.value };
        this.setState({ patient: patient });
    }
    handleDialogClose = () => {
        this.setState({
            shouldOpenEditorDialog: false,
            shouldOpenConfirmationDialog: false,
            shouldOpenNotificationPopup: false,
            shouldOpenSelectParentPopup: false,
            shouldOpenHealthOrganizationPopup: false,
            shouldOpenSampleCollectOrgPopup: false,
            shouldOpenSampleBatchDialog: false,
            // autoGenCode: false
        })
    }

    handlePatientClose = () => {
        this.setState({
            shouldOpenPatientPopup: false
        })
    }
    handleDateChangeRelated = (value, source) => {
        let { relatePatient } = this.state;
        relatePatient = relatePatient ? relatePatient : {};
        relatePatient[source] = value;
        this.setState({ relatePatient: relatePatient });
    }
    handleFormSubmit = () => {
        this.props.getLoading(true)
        let { id, niheCode, patient, autoGenCode } = this.state;

        let idPatient = patient?.id;
        let codePatient = patient?.patientCode;
        let twoFirstNumOfNiheCode = new Date().getFullYear() % 100;
        let object = { id: id,  niheCode: twoFirstNumOfNiheCode + "01" +  niheCode };
        let objectPatient = { id: idPatient, patientCode: codePatient };
        let item = {};
        item.id = id;
        item.niheCode = niheCode;
        item.specimenType = this.state.specimenType;
        item.specimentTypes = this.state.specimentTypes;
        item.specimenTypeDes = this.state.specimenTypeDes;
        item.specimenDate = this.state.specimenDate;
        item.receiverDate = this.state.receiverDate;
        if (this.state.receiverDate) {
            item.shippingStatus = "Accepted";
        }

        item.receiverBy = this.state.receiverBy;
        item.volume = this.state.volume;
        item.plasmaSeparationDate = this.state.plasmaSeparationDate;
        item.plasmaVolume = this.state.plasmaVolume;
        item.specimenStatus = this.state.specimenStatus;
        item.storageTemp = this.state.storageTemp;
        item.shippingTemp = this.state.shippingTemp;
        item.receivedTemp = this.state.receivedTemp;
        item.userSendId = this.state.userSendId;
        item.userReceivedResultId = this.state.userReceivedResultId;
        item.userReceivedResultEmail = this.state.userReceivedResultEmail;
        item.userReceivedResultPhone = this.state.userReceivedResultPhone;
        item.note = this.state.note;
        item.specimenStatusDes = this.state.specimenStatusDes;
        item.reasonDetail = this.state.reasonDetail;
        item.reasonDetailDes = this.state.reasonDetailDes;

        item.arvTreatment = this.state.arvTreatment;
        item.arvTreatmentTime = this.state.arvTreatmentTime;
        item.numberOfTests = this.state.numberOfTests;
        item.receiverDateDbs = this.state.receiverDateDbs;
        item.screeningResults = this.state.screeningResults;
        if (this.state.manualBirthDateCheck && this.state.manualBirthDate) {
            this.state.patient.birthDate = null;
        }
        if (!this.state.manualBirthDateCheck && this.state.birthDate) {
            this.state.patient.manualBirthDate = null;
        }
        this.state.patient.type = 2;
        item.patient = this.state.patient;
        item.autoGenCode = this.state.autoGenCode;
        item.shippingStatus = this.state.shippingStatus;
        item.belongTo = 2;// thuộc về EID 
        if (this.state.org != null && this.state.org.province != null) {
            item.provinceSpecimen = this.state.org?.province;
        }
        item.specimenSource = this.state.specimenSource;


        if (this.state.DVLM != null) {
            item.org = this.state.DVLM
        }
        else {
            item.org = this.state.org;
        }
        if (this.state.DVXN != null) {
            item.labTest = this.state.DVXN
        }
        else {
            item.labTest = this.state.labTest;
        }
        if (id && !autoGenCode) {
            if (niheCode) {
                item.niheCode = niheCode % 1000000
            }
        }

        if (niheCode?.length > 6 && !autoGenCode) {
            toast.error("Độ dài nhập vào không quá 6 số");
        } else if (this.state.autoGenCode == false) {
            if (!niheCode) {
                checkCodePatient(objectPatient).then((res) => {
                    if (res.data) {
                        toast.warning("Code bệnh nhân mẫu đã được sử dụng");
                    } else {
                        if (id) {
                            saveOrUpdate(item).then(() => {
                                toast.success("Cập nhật thành công");
                                this.props.handleOKEditClose();
                                this.props.getLoading(false)
                            }).catch(() => {
                                this.props.getLoading(false)
                                toast.error("Có lỗi xảy ra khi cập nhật");
                            });
                        } else {
                            saveOrUpdate(item).then(() => {
                                toast.success("Thêm mới thành công");
                                this.props.handleOKEditClose();
                                this.props.getLoading(false)
                            }).catch(() => {
                                this.props.getLoading(false)
                                toast.error("Có lỗi xảy ra khi thêm mới");
                            });
                        }
                    }
                });
            }
            else {
                checkCode(object).then((result) => {
                    if (result.data) {
                        toast.warning("Code đã được sử dụng");
                    } else {
                        checkCodePatient(objectPatient).then((res) => {
                            if (res.data) {
                                toast.warning("Code bệnh nhân mẫu đã được sử dụng");
                            } else {
                                if (id) {
                                    saveOrUpdate(item).then(() => {
                                        toast.success("Cập nhật thành công");
                                        this.props.handleOKEditClose();
                                        this.props.getLoading(false)
                                    }).catch(() => {
                                        toast.error("Có lỗi xảy ra khi cập nhật");
                                        this.props.getLoading(false)
                                    });
                                } else {
                                    saveOrUpdate(item).then(() => {
                                        toast.success("Thêm mới thành công");
                                        this.props.handleOKEditClose();
                                        this.props.getLoading(false)
                                    }).catch(() => {
                                        toast.error("Có lỗi xảy ra khi thêm mới");
                                        this.props.getLoading(false)
                                    });
                                }
                            }
                        });
                    }
                })
            }
        }
        else if (this.state.autoGenCode == true) {
            checkCodePatient(objectPatient).then((res) => {
                if (res.data) {
                    toast.warning("Code bệnh nhân mẫu đã được sử dụng");
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
            });

        }

    };

    handleDateChange = (value, source) => {
        this.setState({ [source]: value });
    }

    shouldOpenPatientPopup = (value) => {
        let { patient } = this.state;

        this.setState({ ...{ patient: value } });
        this.handlePatientClose();
    }

    handleDateChangePatient = (value, source) => {
        let { patient } = this.state;
        patient = patient ? patient : {};
        patient[source] = value;
        this.setState({ patient: patient });
    }
    // selectSpecimenType = (value) => {
    //     this.setState({ specimenTypes: value })
    // }

    componentWillMount() {
        let { open, handleClose, item } = this.props;
        let relatePatient;
        if (item.patient?.relatePatient != null && item.patient?.relatePatient.length > 0) {
            relatePatient = item.patient?.relatePatient[0];
        }

        this.setState(item, () => {
            this.setState({ relatePatient: relatePatient })
        });


        if (this.props.item?.patient?.manualBirthDate) {
            this.setState({ manualBirthDateCheck: true })
        }
        if (this.props.item?.patient?.birthDate) {
            this.setState({ manualBirthDateCheck: false })
        }
        // this.setState({ ...item });

        this.setState({ autoGenCode: false })

        getAllInfoByUserLogin().then(({ data }) => {
            let nameHealthOrg = data?.userOrganization?.org?.name
            if (data?.userOrganization?.org?.orgType == 2) {
                console.log("hieu1")
                this.setState({ DVLM: data.userOrganization.org })
            }
            else if (data?.userOrganization?.org?.orgType == 1) {
                console.log("hieu2")
                this.setState({ DVXN: data.userOrganization.org })
            }
            else {
                if (!this.state.id) {
                    this.setState({ DVXN: null })
                    this.setState({ DVLM: null })
                }
                this.setState({ DVLM: item.org })
                this.setState({ DVXN: item.labTest })
            }
        })

        let searchObject = { pageIndex: 0, pageSize: 1000000 }
        searchSpecimenType(searchObject).then(({data}) => {
            this.setState({listSpecimenType: data.content})
        })

    }

    handleManualBirthDate = () => {
        if (this.state.manualBirthDateCheck == true) {
            console.log("hieu1")
            let { patient } = this.state;
            patient.manualBirthDate = null;
            this.setState({ patient, patient })
            this.setState({ manualBirthDateCheck: false })
        }
        else if (this.state.manualBirthDateCheck == false) {
            console.log("hieu2")

            let { patient } = this.state;
            patient.birthDate = null;
            this.setState({ patient, patient })
            this.setState({ manualBirthDateCheck: true })
        }
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

    selectSpecimenType = (typeSelected) => {
        console.log(typeSelected);
        this.setState({ specimentTypes: typeSelected }, function () {});
    };

    render() {
        let { open, handleClose, handleOKEditClose, t, i18n } = this.props;
        let {
            id, niheCode, specimenType, specimenDate, receiverDate, receiverBy,
            volume, plasmaSeparationDate, plasmaVolume, specimenStatus, specimenStatusDes, 
            shouldOpenHealthOrganizationPopup, arvTreatmentTime, storageTemp,
            userReceivedResultEmail, userReceivedResultPhone, reasonDetail, shippingStatus,
            shouldOpenSampleCollectOrgPopup, shippingTemp, receivedTemp, note,
            labTest, org, item, shouldOpenPatientPopup, patient, isAddnew, autoGenCode, arvTreatment,
            relatePatient, reasonDetailDes, listSpecimenType, specimentTypes,
            provinceSpecimen, specimenSource, socialId, specimenTypeDes
        } = this.state;


        let searchObject = { pageIndex: 0, pageSize: 1000000 }

        return (
            <Dialog open={open} fullWidth maxWidth="lg">
                <div className="p-24">
                    <h4 className="mb-24">{id ? t("general.update") : t("general.add")} {t("specimen.titlespecimenOver18M")}</h4>
                    <ValidatorForm ref="form" onSubmit={this.handleFormSubmit}>
                        <Grid className="" container spacing={2}>
                            <Grid xs={12}>
                                <fieldset>
                                    <legend>ĐƠN VỊ CHỈ ĐỊNH XÉT NGHIỆM</legend>
                                    {isAddnew && (<Grid xs={12}>
                                        <Button
                                            className="mt-8"
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
                                        <Grid item lg={3} md={3} sm={6} xs={12}>
                                            <TextValidator
                                                className="w-100"
                                                variant="outlined"
                                                size="small"
                                                label={<span className="font">
                                                    {/* <span style={{ color: "red" }}> * </span> */}
                                                    {t("specimen.patientCode")}
                                                </span>}
                                                onChange={this.handleChangePatient}
                                                type="text"
                                                name="patientCode"
                                                value={patient?.patientCode ? patient?.patientCode : ""}
                                            // validators={["required", 'whitespace']}
                                            // errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                                            />
                                        </Grid>

                                        <Grid item lg={3} md={3} sm={6} xs={12}>
                                            <TextValidator
                                                className="w-100"
                                                variant="outlined"
                                                size="small"
                                                label={<span className="font">
                                                    {/* <span style={{ color: "red" }}> * </span> */}
                                                    {t("specimen.fullName")}
                                                </span>}
                                                onChange={this.handleChangePatient}
                                                type="text"
                                                name="fullName"
                                                value={patient?.fullName ? patient?.fullName : ""}
                                            // validators={["required", 'whitespace']}
                                            // errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                                            />
                                        </Grid>

                                        {/* <Grid item lg={3} md={3} sm={6} xs={12}>
                                            <TextValidator
                                                className="w-100"
                                                variant="outlined"
                                                size="small"
                                                label={<span className="font">
                                                    {t("specimen.parentName")}
                                                </span>}
                                                onChange={this.handleRelatedChangeType}
                                                type="text"
                                                name="nameHIVinfectedMothers"
                                                value={patient?.relatePatient[0]?.nameHIVinfectedMothers ? patient?.relatePatient[0]?.nameHIVinfectedMothers : ""}
                                            />
                                        </Grid> */}
                                        <Grid item lg={3} md={3} sm={6} xs={12}>
                                            <TextValidator
                                                className="w-100"
                                                variant="outlined"
                                                size="small"
                                                label={<span className="font">
                                                    {t("specimen.phone")}
                                                </span>}
                                                onChange={this.handleChangePatient}
                                                type="text"
                                                name="phone"
                                                value={patient?.phone ? patient?.phone : ""}

                                            />
                                        </Grid>

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
                                                        onChange={(manualBirthDate) => this.handleChangePatient(manualBirthDate, "manualBirthDate")}
                                                        type="text"
                                                        name="manualBirthDate"
                                                        value={patient ? (patient?.manualBirthDate ? patient?.manualBirthDate : null) : null}
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
                                                            value={patient ? (patient?.birthDate ? patient?.birthDate : null) : null}
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
                                                            onChange={(manualBirthDate) => this.handleChangePatient(manualBirthDate, "manualBirthDate")} type="text"
                                                            name="manualBirthDate"
                                                            value={patient ? (patient?.manualBirthDate ? patient?.manualBirthDate : null) : null}
                                                            validators={["required", 'whitespace']}
                                                            errorMessages={[t("general.required"), t('general.invalidCharacter')]}
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
                                                                value={patient ? (patient?.birthDate ? patient?.birthDate : null) : null}
                                                                onChange={(value) => this.handleDateChangePatient(value, "birthDate")}
                                                                KeyboardButtonProps={{
                                                                    'aria-label': 'change date',
                                                                }}
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
                                                />
                                            </Tooltip>
                                        </Grid>

                                        <Grid item lg={3} md={3} sm={6} xs={12}>
                                            <FormControl fullWidth={true} variant="outlined" size="small">
                                                <InputLabel htmlFor="type-simple">
                                                    {
                                                        <span className="font">
                                                            {t("specimen.patientType")}
                                                        </span>
                                                    }
                                                </InputLabel>
                                                {console.log(patient?.type ? this.listType.find(type => type.id === patient.type) : null)}
                                                <Select
                                                    label={<span className="font">{t("specimen.patientType")}</span>}
                                                    defaultValue={patient?.type ? this.listType.find(type => type.id === patient?.type) : ""}
                                                    value={patient?.type ? patient?.type : ""}
                                                    onChange={(type) => this.handleChangePatient(type, "type")}
                                                    inputProps={{
                                                        name: "type",
                                                        id: "type-simple",
                                                    }}
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

                                        <Grid item lg={3} md={3} sm={6} xs={12}>
                                            <FormControl fullWidth={true} variant="outlined" size="small">
                                                <InputLabel htmlFor="gender-simple">
                                                    {
                                                        <span className="font">
                                                            <span style={{ color: "red" }}> * </span>
                                                            {t("user.gender")}
                                                        </span>
                                                    }
                                                </InputLabel>
                                                <Select
                                                    label={<span className="font">{t("user.gender")}</span>}
                                                    defaultValue={patient?.gender ? this.listGender.find(gender => gender.id === patient?.gender) : ""}
                                                    value={patient?.gender ? patient?.gender : ""}
                                                    onChange={(gender) => this.handleChangePatient(gender, "gender")}
                                                    inputProps={{
                                                        name: "gender",
                                                        id: "gender-simple",
                                                    }}
                                                    required
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
                                                    {t("person.address")}
                                                </span>}
                                                onChange={this.handleChangePatient}
                                                type="text"
                                                name="address"
                                                value={patient?.address ? patient?.address : ""}
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
                                                value={patient?.permanentAddress ? patient?.permanentAddress : ""}
                                            />
                                        </Grid>

                                        <Grid item lg={3} md={3} sm={6} xs={12}>
                                            <TextValidator
                                                className="w-100"
                                                variant="outlined"
                                                size="small"
                                                label={<span className="font">
                                                    {t("patient.socialId")}
                                                </span>}
                                                onChange={(socialId) => this.handleChangePatient(socialId, "socialId")}
                                                type="text"
                                                name="socialId"
                                                value={patient?.socialId ? patient?.socialId : ""}
                                            />
                                        </Grid>

                                        <Grid item lg={3} md={3} sm={6} xs={12}>
                                            <FormControl fullWidth={true} variant="outlined" size="small">
                                                <InputLabel htmlFor="arvTreatment-simple">
                                                    {t("specimen.arvTreatment")}
                                                </InputLabel>
                                                <Select
                                                    label={t("specimen.arvTreatment")}
                                                    value={arvTreatment ? arvTreatment : ""}
                                                    onChange={(arvTreatment) =>
                                                        this.handleChange(arvTreatment, "arvTreatment")
                                                    }
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

                                        {arvTreatment == 1 &&
                                            <Grid item lg={3} md={3} sm={6} xs={12}>
                                                <TextValidator
                                                    className="w-100"
                                                    variant="outlined"
                                                    size="small"
                                                    label={<span className="font">
                                                        {t("specimen.arvTreatmentTime")}
                                                    </span>}
                                                    onChange={this.handleChange}
                                                    type="text"
                                                    name="arvTreatmentTime"
                                                    value={arvTreatmentTime }
                                                />
                                            </Grid>
                                        }

                                        <Grid item lg={3} md={3} sm={6} xs={12}>
                                            <FormControl fullWidth={true} variant="outlined" size="small">
                                                <InputLabel htmlFor="reasonDetail-simple">
                                                    {<span className="font"> {t("specimen.reasonDetail")}</span>}
                                                </InputLabel>
                                                <Select
                                                    label={<span className="font">{t("specimen.reasonDetail")}</span>}
                                                    value={reasonDetail ? reasonDetail : ""}
                                                    onChange={(reasonDetail) => this.handleChange(reasonDetail, "reasonDetail")}
                                                    inputProps={{
                                                        name: "reasonDetail",
                                                        id: "reasonDetail-simple",
                                                    }}
                                                >
                                                    {this.listReasonDetail.map((item) => {
                                                        return (
                                                            <MenuItem key={item.id} value={item.id}>
                                                                {item.name}
                                                            </MenuItem>
                                                        );
                                                    })}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        {reasonDetail == 7 &&
                                            <Grid item lg={3} md={3} sm={6} xs={12}>
                                                <TextValidator
                                                    className="w-100"
                                                    variant="outlined"
                                                    size="small"
                                                    label={<span className="font">
                                                        {t("specimen.reasonDetailDes")}
                                                    </span>}
                                                    onChange={this.handleChange}
                                                    type="text"
                                                    name="reasonDetailDes"
                                                    value={ reasonDetailDes }
                                                />
                                            </Grid>
                                        }

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
                                                value={specimenSource}
                                            />
                                        </Grid>

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
                                                value={org?.province ? org?.province : ""}
                                            />
                                        </Grid>

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
                                                value={note}
                                            />
                                        </Grid>

                                        <Grid item sm={12} xs={12}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={patient?.usingSms}
                                                        onChange={(usingSms) => this.handleChangePatient(usingSms, "usingSms")}
                                                        value="usingSms"
                                                    />
                                                }
                                                label="Nhận SMS"
                                            />
                                        </Grid>
                                    </Grid>
                                </fieldset>
                            </Grid>
                            <Grid xs={12} style={{paddingTop: '20px'}}>
                                <fieldset>
                                    <legend>ĐƠN VỊ LẤY MẪU, TÁCH HUYẾT TƯƠNG</legend>
                                    <Grid item container xs={12} spacing={2} style={{paddingTop: '10px'}}>
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
                                                    standard="standard"
                                                    inputVariant="outlined"
                                                    type="text"
                                                    autoOk={true}
                                                    format="dd/MM/yyyy HH:mm"
                                                    value={specimenDate ? specimenDate : null}
                                                    onChange={(value) => this.handleDateChange(value, "specimenDate")}
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
                                                    {t("specimen.shippingTemp")}
                                                </span>}
                                                onChange={this.handleChange}
                                                type="text"
                                                name="shippingTemp"
                                                value={shippingTemp}
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
                                                            {t("specimen.plasmaSeparationDate")}
                                                        </span>
                                                    }
                                                    inputVariant="outlined"
                                                    type="text"
                                                    autoOk={true}
                                                    format="dd/MM/yyyy HH:mm"
                                                    value={plasmaSeparationDate ? plasmaSeparationDate : null}
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
                                                value={storageTemp}
                                            />
                                        </Grid>
                                        <Grid item container xs={12} spacing={2}>
                                            {/* <div style={{ display: 'flex', justifyContent : 'space-between' }} > */}
                                            {!this.state.id && (
                                                <Grid item lg={6} md={6} sm={6} xs={12}>
                                                    <TextValidator
                                                        size="small"
                                                        variant="outlined"
                                                        size="small"
                                                        className="w-100 "
                                                        label={
                                                            <span className="font">
                                                                {t("specimen.orgSelect")}
                                                            </span>
                                                        }
                                                        name="org"
                                                        // value={item?.org ? item.org.name : ""}
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
                                                                    >
                                                                        {t('Select')}
                                                                    </Button>
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                        size="small"
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


                                            {this.state.id && (
                                                <Grid item lg={6} md={6} sm={6} xs={12}>
                                                    <TextValidator
                                                        size="small"
                                                        variant="outlined"
                                                        size="small"
                                                        className="w-100 "
                                                        label={
                                                            <span className="font">
                                                                {t("specimen.orgSelect")}
                                                            </span>
                                                        }
                                                        name="org"
                                                        value={this.state.org ? this.state.org.name : ""}
                                                        InputProps={{
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <Button
                                                                        size={'small'}
                                                                        className="align-bottom"
                                                                        variant="contained"
                                                                        color="primary"
                                                                        onClick={() => this.setState({ shouldOpenSampleCollectOrgPopup: true })}
                                                                    >
                                                                        {t('Select')}
                                                                    </Button>
                                                                </InputAdornment>
                                                            ),
                                                        }}

                                                        size="small"
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
                                            {!this.state.id && (
                                                <Grid item lg={6} md={6} sm={6} xs={12}>
                                                    <TextValidator
                                                        size="small"
                                                        variant="outlined"
                                                        size="small"
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
                                                                    >
                                                                        {t('Select')}
                                                                    </Button>
                                                                </InputAdornment>
                                                            ),
                                                        }}

                                                        size="small"
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

                                            {this.state.id && (
                                                <Grid item lg={6} md={6} sm={6} xs={12}>
                                                    <TextValidator
                                                        size="small"
                                                        variant="outlined"
                                                        size="small"
                                                        className="w-100 "
                                                        label={
                                                            <span className="font">
                                                                {t("specimen.labTestSelect")}
                                                            </span>
                                                        }
                                                        name="labTest"
                                                        value={this.state.labTest ? this.state.labTest.name : ""}
                                                        InputProps={{
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <Button
                                                                        size={'small'}
                                                                        className="align-bottom"
                                                                        variant="contained"
                                                                        color="primary"
                                                                        onClick={() => this.setState({ shouldOpenHealthOrganizationPopup: true })}
                                                                    >
                                                                        {t('Select')}
                                                                    </Button>
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                        size="small"
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
                                            {/* </div> */}
                                        </Grid>
                                    </Grid>
                                </fieldset>
                            </Grid>
                            <Grid xs={12} style={{paddingTop: '20px'}}>
                                <fieldset>
                                    <legend>PHÒNG XÉT NGHIỆM SINH HỌC PHÂN TỬ HIV</legend>
                                    <Grid item container xs={12} spacing={2} style={{paddingTop: '10px'}}>
                                        {!UserRoles.isUser() &&
                                            <>
                                                {!id &&
                                                    <Grid item lg={2} md={2} sm={6} xs={12}>
                                                        <TextValidator
                                                            disabled={autoGenCode}
                                                            className="w-100"
                                                            variant="outlined"
                                                            size="small"
                                                            label={<span className="font">
                                                                {t("specimen.code")}
                                                            </span>}
                                                            onChange={this.handleChange}
                                                            type="text"
                                                            name="niheCode"
                                                            value={niheCode}
                                                        />
                                                    </Grid>
                                                }
                                                {id && niheCode &&
                                                    <Grid item lg={3} md={3} sm={6} xs={12}>
                                                        <TextValidator
                                                            className="w-100"
                                                            variant="outlined"
                                                            size="small"
                                                            disabled={autoGenCode}
                                                            label={<span className="font">
                                                                {t("specimen.code")}
                                                            </span>}
                                                            onChange={this.handleChange}
                                                            type="text"
                                                            name="niheCode"
                                                            value={niheCode?.toString().slice(-6)}

                                                        />
                                                    </Grid>
                                                }
                                                {id && !niheCode &&
                                                    <Grid item lg={2} md={2} sm={6} xs={12}>
                                                        <TextValidator
                                                            className="w-100"
                                                            variant="outlined"
                                                            size="small"
                                                            disabled={autoGenCode}
                                                            label={<span className="font">
                                                                {t("specimen.code")}
                                                            </span>}
                                                            onChange={this.handleChange}
                                                            type="text"
                                                            name="niheCode"
                                                            value={niheCode?.toString().slice(-6)}

                                                        />
                                                    </Grid>
                                                }

                                                {(!niheCode || !id) &&
                                                    <Grid item lg={1} md={1} sm={6} xs={12}>
                                                        <Tooltip title="Tạo mẫu tự động" placement="bottom">
                                                            <Checkbox
                                                                onChange={this.handleAutoGenCode}
                                                                inputProps={{ 'aria-label': 'primary checkbox' }}
                                                                title="Tạo mẫu tự động"
                                                            />
                                                        </Tooltip>

                                                    </Grid>
                                                }
                                            </>
                                        }
                                        {UserRoles.isUser() &&
                                            <Grid item lg={3} md={3} sm={6} xs={12}>
                                                <TextValidator
                                                    disabled={true}
                                                    className="w-100"
                                                    variant="outlined"
                                                    size="small"
                                                    label={<span className="font">
                                                        {t("specimen.code")}
                                                    </span>}
                                                    onChange={this.handleChange}
                                                    type="text"
                                                    name="niheCode"
                                                    value={niheCode}
                                                />
                                            </Grid>
                                        }

                                        <Grid item lg={3} md={3} sm={6} xs={12}>
                                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                                <KeyboardDatePicker
                                                    disabled = {UserRoles.isUser()}
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
                                                    value={receiverDate ? receiverDate : null}
                                                    onChange={(value) => this.handleDateChange(value, "receiverDate")}
                                                    KeyboardButtonProps={{
                                                        'aria-label': 'change date',
                                                    }}
                                                />
                                            </MuiPickersUtilsProvider>
                                        </Grid>

                                        
                                        <Grid item lg={3} md={3} sm={6} xs={12}>
                                            <FormControl fullWidth={true} variant="outlined" size="small">
                                                <InputLabel htmlFor="shippingStatus-simple">
                                                    {<span className="font"> {t("specimen.shippingStatus")}</span>}
                                                </InputLabel>
                                                <Select
                                                    label={<span className="font">{t("specimen.shippingStatus")}</span>}
                                                    value={shippingStatus ? shippingStatus : ""}
                                                    onChange={(shippingStatus) => this.handleChange(shippingStatus, "shippingStatus")}
                                                    inputProps={{
                                                        name: "shippingStatus",
                                                        id: "shippingStatus-simple",
                                                    }}
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
                                                value={receivedTemp}
                                            />
                                        </Grid>
       
                                        <Grid item lg={3} md={3} sm={6} xs={12}>
                                        <Autocomplete
                                            style={{ width: "100%" }}
                                            multiple
                                            id="combo-box-demo"
                                            defaultValue={specimentTypes?specimentTypes : []}
                                            options={listSpecimenType}
                                            getOptionSelected={(option, value) =>
                                                option.id === value.id
                                            }
                                            getOptionLabel={(option) => option.name}
                                            onChange={(event, value) => {
                                                this.selectSpecimenType(value);
                                            }}
                                            size = "small"
                                            renderInput={(params) => (
                                            <TextValidator
                                                {...params}
                                                value={specimentTypes}
                                                label={
                                                    t("specimen.type")
                                                }
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                            />
                                            )}
                                        />
                                        </Grid>

                                        {specimenType?.name == "Khác" && 
                                            <Grid item lg={3} md={3} sm={6} xs={12}>
                                                <TextValidator
                                                    className="w-100"
                                                    variant="outlined"
                                                    size="small"
                                                    label={<span className="font">
                                                        {t("Mô tả cụ thể loại mẫu")}
                                                    </span>}
                                                    onChange={this.handleChange}
                                                    type="text"
                                                    name="specimenTypeDes"
                                                    value={specimenTypeDes}
                                                />
                                            </Grid>
                                        }

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
                                                    value={specimenStatus ? specimenStatus : ""}
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

                                        {specimenStatus == 5 && <Grid item lg={3} md={3} sm={6} xs={12}>
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
                                                value={specimenStatusDes}
                                            />
                                        </Grid>}

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
                                                value={volume}
                                            // validators={["required", 'whitespace']}
                                            // errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                                            />
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
                                                value={receiverBy}
                                            // validators={["required", 'whitespace']}
                                            // errorMessages={[t("general.required"), t('general.invalidCharacter')]}
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
                                                value={plasmaVolume}
                                            // validators={["required", 'whitespace']}
                                            // errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                                            />
                                        </Grid>

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
                                                value={userReceivedResultEmail}
                                                validators={["isEmail"]}
                                                errorMessages={["general.invalidCharacter"]}
                                            />
                                        </Grid>

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
                                                value={userReceivedResultPhone}
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
                                    {t("Huỷ")}
                                </Button>
                                <Button variant="contained" color="primary" type="submit">
                                    {t("Lưu")}
                                </Button>
                            </div>
                        </DialogActions>
                    </ValidatorForm>
                </div>
            </Dialog>
        );
    }
}

const mapStateToProps = (state) => ({
    loading: state.loading.loading,
  });
  
  const mapDispatch = {
    getLoading,
  };
  export default connect(mapStateToProps, mapDispatch)(SpecimenOver18mEIDDialog);

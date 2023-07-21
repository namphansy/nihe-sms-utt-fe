import React, { Component } from 'react';
import {
    Grid,
    Button,
    TextField,
    IconButton,
} from "@material-ui/core";
import '../Specimen/SpecimenFilter.css';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { searchByPage as searchOrg } from '../HealthOrg/HealthOrgService';
import { searchByPage as searchSpecimenType } from '../SpecimenType/SpecimenTypeService';
import { toast } from "react-toastify";
import { exportDOC } from "./PatientResultHivService";
import { connect } from "react-redux";
import { getLoading } from "../../redux/actions/LoadingActions";
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from "@material-ui/icons/Clear";

toast.configure({
    autoClose: 2000,
    draggable: false,
    limit: 3,
});

class PatientResultHivFilter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            receiverDateFilter: "",
            org: null,
            specimenType: null,
            listTimeFormatFrom: [],
            listTimeFormatTo: [],
            timeFormatFrom: null,
            timeFormatTo: null,
            resultDateSearchFrom: "",
            resultDateSearchTo: "",
        }
    };

    handleDateChange = (value, source) => {
        this.setState({ [source]: value }, () => console.log(this.state));
    };

    handleDateChange = (value, source) => {
        if (source === "receiverDateFilter") {
            this.state.receiverDateFilter = value;
            this.setState({ receiverDateFilter: value, });
        }
        if (source === "resultDateSearchFrom") {
            this.state.resultDateSearchFrom = value;
            this.setState({ resultDateSearchFrom: value, });
        }
        if (source === "resultDateSearchTo") {
            this.state.resultDateSearchTo = value;
            this.setState({ resultDateSearchTo: value });
        }
        if (source === "clear") {
            this.state.resultDateSearchFrom = null;
            this.state.resultDateSearchTo = null;
            this.setState({ resultDateSearchFrom: null, resultDateSearchTo: null });
        }
    };

    getListOrg() {
        let searchObject = { pageIndex: 0, pageSize: 100000, orgType: 2 };
        searchOrg(searchObject).then(({ data }) => {
            this.setState({ listOrg: data.content });
        })
    };

    getSpecimenType() {
        let searchObject = { pageIndex: 0, pageSize: 100000 };
        searchSpecimenType(searchObject).then(({ data }) => {
            this.setState({ listSpecimenType: data.content });
        })
    };

    handleSelectOrg = (event, value) => {
        this.setState({ org: value });
    };

    handleSelectSpecimenType = (event, value) => {
        this.setState({ specimenType: value });
    };

    componentDidMount() {
        let searchObject = { pageIndex: 0, pageSize: 100000, orgType: 2 };
        let listTimeFormat = [{ name: "Ngày/Tháng/Năm", id: 1 }, { name: "Tháng/Năm", id: 2 }, { name: "Năm", id: 3 }];
        searchOrg(searchObject).then(({ data }) => {
            this.setState({ listOrg: data.content });
        })
        searchSpecimenType(searchObject).then(({ data }) => {
            this.setState({ listSpecimenType: data.content });
        })

        this.setState({ listTimeFormatFrom: listTimeFormat, listTimeFormatTo: listTimeFormat, timeFormatFrom: listTimeFormat[0], timeFormatTo: listTimeFormat[0] });
    };

    clearFilter = () => {
        this.setState(
            {
                receiverDateFilter: null,
                org: null,
                specimenType: null,
                timeFormatFrom: this.state.listTimeFormatFrom[0],
                timeFormatTo: this.state.listTimeFormatTo[0],
                resultDateSearchFrom: "",
                resultDateSearchTo: "",
            }
        );
    };

    handleFilter = () => {
        this.setState(
            {
                receiverDateFilter: this.state.receiverDateFilter,
                org: this.state.org,
                specimenType: this.state.specimenType,
                timeFormatFrom: this.state.timeFormatFrom,
                timeFormatTo: this.state.timeFormatTo,
                resultDateSearchFrom: this.state.resultDateSearchFrom,
                resultDateSearchTo: this.state.resultDateSearchTo,
            },
            () => this.props.handleFilter(this.state, 'search')
        );
    }

    handleSelectTimeFormatTo = (event, value) => {
        this.setState({ timeFormatTo: value });
    };

    handleSelectTimeFormatFrom = (event, value) => {
        this.setState({ timeFormatFrom: value });
    };

    selectViewFormat = (value) => {
        if (value === "resultDateSearchFrom") {
            if (this.state.timeFormatFrom) {
                if (this.state.timeFormatFrom.id == 2) {
                    return ["month", "year"]
                }
                if (this.state.timeFormatFrom.id == 3) {
                    return ["year"]
                }
            }
        }
        if (value === "resultDateSearchTo") {
            if (this.state.timeFormatTo) {
                if (this.state.timeFormatTo.id == 2) {
                    return ["month", "year"]
                }
                if (this.state.timeFormatTo.id == 3) {
                    return ["year"]
                }
            }
        }
    }

    convertFormatDate = (value) => {
        if (value === "resultDateSearchFrom") {
            if (this.state.timeFormatFrom) {
                if (this.state.timeFormatFrom.id == 1) {
                    return "dd/MM/yyyy"
                }
                if (this.state.timeFormatFrom.id == 2) {
                    return "MM/yyyy"
                }
                if (this.state.timeFormatFrom.id == 3) {
                    return "yyyy"
                }
            }
        }
        if (value === "resultDateSearchTo") {
            if (this.state.timeFormatTo) {
                if (this.state.timeFormatTo.id == 1) {
                    return "dd/MM/yyyy"
                }
                if (this.state.timeFormatTo.id == 2) {
                    return "MM/yyyy"
                }
                if (this.state.timeFormatTo.id == 3) {
                    return "yyyy"
                }
            }
        }
        return "dd/MM/yyyy"
    }

    handleExportDOC = () => {
        this.props.getLoading(true);
        let { receiverDateFilter, org, specimenType, resultDateSearchFrom, resultDateSearchTo, timeFormatFrom, timeFormatTo } = this.state;
        if (org || specimenType || receiverDateFilter
            || (resultDateSearchFrom && resultDateSearchTo && timeFormatFrom && timeFormatTo)) {
            let searchObject = {};
            searchObject.pageIndex = 1;
            searchObject.pageSize = 10000;
            searchObject.orderByASC = true;
            searchObject.belongTo = 1;
            searchObject.startDate = resultDateSearchFrom;
            searchObject.endDate = resultDateSearchTo;
            searchObject.typeDateSearchFrom = timeFormatFrom.id;
            searchObject.typeDateSearchTo = timeFormatTo.id;
            if (org) {
                searchObject.orgId = this.state.org.id;
            }
            if (specimenType) {
                searchObject.specimenTypeId = this.state.specimenType.id;
            }
            if (receiverDateFilter) {
                searchObject.receiverDate = this.state.receiverDateFilter;
            }

            exportDOC(searchObject).then((result) => {
                this.setState({ exportStatus: true });
                const url = window.URL.createObjectURL(new Blob([result.data]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "SỔ THEO DÕI NHẬN VÀ TRẢ KẾT QUẢ XÉT NGHIỆM SINH HỌC PHÂN TỬ HIV.doc");
                document.body.appendChild(link);
                link.click();
                toast.success(this.props.t("general.successExport"));
                this.props.getLoading(false);
            }).catch(() => {
                toast.error("Đã có lỗi hệ thống");
                this.props.getLoading(false);
            });
        } else {
            toast.error("Không thể để trống điều kiện");
            this.props.getLoading(false);
        }
    };

    render() {
        let { t } = this.props;
        let {
            receiverDateFilter,
            org,
            specimenType,
            listOrg,
            listSpecimenType,
            listTimeFormatFrom,
            listTimeFormatTo,
            timeFormatFrom,
            timeFormatTo,
            resultDateSearchFrom,
            resultDateSearchTo,
        } = this.state;
        return (
            <Grid className="filter-container" container spacing={2}>
                <Grid item xs={12} container spacing={4}>
                    <Grid container spacing={2} style={{ paddingLeft: 15 }}>
                        <Grid item lg={4} md={4} sm={3} xs={12}>
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
                                    format="dd/MM/yyyy"
                                    value={receiverDateFilter ? receiverDateFilter : null}
                                    onChange={(value) => this.handleDateChange(value, "receiverDateFilter")}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                    }}
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item md={4} sm={4}>
                            <Autocomplete
                                size="small"
                                id="combo-box"
                                options={listSpecimenType ? listSpecimenType : []}
                                className="flex-end w-100"
                                getOptionLabel={option => option.name}
                                onChange={this.handleSelectSpecimenType}
                                value={specimenType}
                                renderInput={params => (
                                    <TextField
                                        {...params}
                                        size="small"
                                        label={"Loại mẫu"}
                                        variant="outlined"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item md={4} sm={4}>
                            <Autocomplete
                                size="small"
                                id="combo-box"
                                options={listOrg ? listOrg : []}
                                className="flex-end w-100"
                                getOptionLabel={option => option.name}
                                onChange={this.handleSelectOrg}
                                value={org}
                                renderInput={params => (
                                    <TextField
                                        {...params}
                                        size="small"
                                        label={t("Đơn vị gửi mẫu")}
                                        variant="outlined"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item md={3} sm={3} >
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                    autoOk={true}
                                    disableFuture={true}
                                    size="small"
                                    className="w-100"
                                    margin="none"
                                    id="date-picker-dialog"
                                    views={this.selectViewFormat("resultDateSearchFrom")}
                                    clearable
                                    format={this.convertFormatDate("resultDateSearchFrom")}
                                    label={<span>Thời gian nhận mẫu từ</span>}
                                    inputVariant="outlined"
                                    value={resultDateSearchFrom ? resultDateSearchFrom : null}
                                    onChange={(value) => {
                                        this.handleDateChange(value, "resultDateSearchFrom")
                                    }
                                    }
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton
                                                onClick={(value) =>
                                                    this.handleDateChange(value, "clear")
                                                }
                                            >
                                                <ClearIcon />
                                            </IconButton>
                                        ),
                                    }}
                                    KeyboardButtonProps={{
                                        "aria-label": "change date",
                                    }}
                                    InputAdornmentProps={{
                                        position: "start",
                                    }}
                                />
                            </MuiPickersUtilsProvider>
                            <Autocomplete
                                id="combo-box"
                                options={listTimeFormatFrom ? listTimeFormatFrom : []}
                                className="flex-end w-100 mt-12"
                                getOptionLabel={option => option.name}
                                onChange={this.handleSelectTimeFormatFrom}
                                value={timeFormatFrom}
                                renderInput={params => (
                                    <TextField
                                        {...params}
                                        size="small"
                                        label={"Định dạng thời gian"}
                                        variant="outlined"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item md={3} sm={3} >
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                    autoOk={true}
                                    disableFuture={true}
                                    size="small"
                                    className="w-100"
                                    margin="none"
                                    id="date-picker-dialog"
                                    clearable
                                    views={this.selectViewFormat("resultDateSearchTo")}
                                    format={this.convertFormatDate("resultDateSearchTo")}
                                    label={<span>Thời gian nhận mẫu đến</span>}
                                    inputVariant="outlined"
                                    value={resultDateSearchTo ? resultDateSearchTo : null}
                                    onChange={(value) =>
                                        this.handleDateChange(value, "resultDateSearchTo")
                                    }
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton
                                                onClick={(value) =>
                                                    this.handleDateChange(value, "clear")
                                                }
                                            >
                                                <ClearIcon />
                                            </IconButton>
                                        ),
                                    }}
                                    KeyboardButtonProps={{
                                        "aria-label": "change date",
                                    }}
                                    InputAdornmentProps={{
                                        position: "start",
                                    }}
                                />
                            </MuiPickersUtilsProvider>
                            <Autocomplete
                                id="combo-box"
                                options={listTimeFormatTo ? listTimeFormatTo : []}
                                className="flex-end w-100 mt-12"
                                getOptionLabel={option => option.name}
                                onChange={this.handleSelectTimeFormatTo}
                                value={timeFormatTo}
                                renderInput={params => (
                                    <TextField
                                        {...params}
                                        size="small"
                                        label={"Định dạng thời gian"}
                                        variant="outlined"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item md={2} sm={3}>
                            <Button
                                variant="contained"
                                color="primary"
                                className="btn btn-primary-d d-inline-flex"
                                onClick={() => this.handleFilter()}
                            >
                                <SearchIcon />
                                {t("general.search")}
                            </Button>
                        </Grid>

                        <Grid item md={2} sm={3}>
                            <Button
                                className="align-top"
                                variant="contained"
                                color="primary"
                                onClick={this.handleExportDOC}
                            >
                                {"Xuất file DOC"}
                            </Button>
                        </Grid>

                        <Grid item md={2} sm={3}>
                            <Button
                                variant="contained"
                                color="primary"
                                className="btn btn-primary-d d-inline-flex"
                                onClick={() => this.clearFilter()}
                            >
                                {t("Đặt lại")}
                            </Button>
                        </Grid>
                    </Grid>

                </Grid>
            </Grid>
        );
    }
}

const mapStateToProps = (state) => ({
    loading: state.loading.loading,
});

const mapDispatch = {
    getLoading,
};
export default connect(mapStateToProps, mapDispatch)(PatientResultHivFilter);

// export default PatientResultHivFilter;
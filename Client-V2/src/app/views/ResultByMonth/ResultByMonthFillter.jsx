import React, { Component } from 'react';
import {
    Grid,
    Button,
    Checkbox,
    TextField,
    Input,
    IconButton,
    Icon,
} from "@material-ui/core";
import SearchIcon from '@material-ui/icons/Search';
import '../Specimen/SpecimenFilter.css';
import { MuiPickersUtilsProvider, DateTimePicker, DatePicker, KeyboardDatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { searchByPage as searchOrg } from '../HealthOrg/HealthOrgService';
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { toast } from "react-toastify";
import { exportExcelEID, exportExcelVL } from "./ResultByMonthService";
import ResultByMonth from './ResultByMonth';
import { connect } from "react-redux";
import ClearIcon from "@material-ui/icons/Clear";
import { getLoading } from "../../redux/actions/LoadingActions";

toast.configure({
    autoClose: 2000,
    draggable: false,
    limit: 3,
});

class ResultByMonthFillter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            resultMonthSearch: "",
            resultType: null,
        }
    }

    handleDateChange = (value, source) => {
        if (source === "resultMonthSearch") {
            this.state.resultMonthSearch = value;
            this.setState({ resultMonthSearch: value });
        }
        if (source === "clear") {
            this.state.resultMonthSearch = null;
            this.setState({ resultMonthSearch: null });
        }
    };
    componentDidMount() {
        let listResultType = [{ name: "NormalVL", type: 1 }, { name: "EID", type: 2 }];
        this.setState({ listResultType: listResultType });
    }

    handleSelectResultType = (event, value) => {
        this.setState({ resultType: value });
    };

    clearFilter = () => {
        this.setState(
            {
                resultMonthSearch: "",
                resultType: null,
            }
        );
    };

    handleFilter = () => {
        this.setState(
            {
                resultMonthSearch: this.state.resultMonthSearch,
                resultType: this.state.resultType,
            },
            () => this.props.handleFilter(this.state, 'search')
        );
    }

    handleExportExcelEID = () => {
        this.props.getLoading(true);
        let { resultMonthSearch, resultType } = this.state;
        if (resultMonthSearch || resultType) {
            let searchObject = {};
            searchObject.pageIndex = 1;
            searchObject.pageSize = 10000;
            searchObject.orderByASC = true;
            if (resultMonthSearch) {
                searchObject.resultMonth = resultMonthSearch;
            }
            if (resultType) {
                searchObject.type = resultType.type;
            }
            exportExcelEID(searchObject).then((result) => {
                this.setState({ exportStatus: true });
                const url = window.URL.createObjectURL(new Blob([result.data]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "TỔNG HỢP KẾT QUẢ EID THEO NGÀY.xlsx");
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

    handleExportExcelVL = () => {
        this.props.getLoading(true);
        let { resultMonthSearch, resultType } = this.state;
        if (resultMonthSearch || resultType) {
            let searchObject = {};
            searchObject.pageIndex = 1;
            searchObject.pageSize = 10000;
            searchObject.orderByASC = true;
            if (resultMonthSearch) {
                searchObject.resultMonth = resultMonthSearch;
            }
            if (resultType) {
                searchObject.type = resultType.type;
            }
            exportExcelVL(searchObject).then((result) => {
                this.setState({ exportStatus: true });
                const url = window.URL.createObjectURL(new Blob([result.data]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "TỔNG HỢP KẾT QUẢ EID THEO NGÀY.xlsx");
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
            resultMonthSearch,
            listResultType,
            resultType,
        } = this.state;
        return (
            <Grid className="filter-container" container spacing={2}>
                <Grid item xs={12} container spacing={4}>
                    <Grid container spacing={2} style={{ paddingLeft: 15 }}>
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
                                    views={["year", "month"]}
                                    format="MM/yyyy"
                                    label={<span>Tháng và năm cần tìm</span>}
                                    inputVariant="outlined"
                                    value={resultMonthSearch ? resultMonthSearch : null}
                                    onChange={(value) =>
                                        this.handleDateChange(value, "resultMonthSearch")
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
                        </Grid>
                        <Grid item md={3} sm={4}>
                            <Autocomplete
                                id="combo-box"
                                options={listResultType ? listResultType : []}
                                className="flex-end w-100"
                                getOptionLabel={option => option.name}
                                onChange={this.handleSelectResultType}
                                value={resultType}
                                renderInput={params => (
                                    <TextField
                                        {...params}
                                        size="small"
                                        label={"Loại kết quả"}
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
                                variant="contained"
                                color="primary"
                                className="btn btn-primary-d d-inline-flex"
                                onClick={() => this.clearFilter()}
                            >
                                {t("Đặt lại")}
                            </Button>
                        </Grid>
                        <Grid item md={2} sm={0}></Grid>
                        <Grid item md={3} sm={3}>
                            <Button
                                className="ml-16 align-top"
                                variant="contained"
                                color="primary"
                                onClick={this.handleExportExcelEID}
                            >
                                {"Xuất excel KQ EID"}
                            </Button>
                        </Grid>
                        <Grid item md={3} sm={3}>
                            <Button
                                className="ml-16 align-top"
                                variant="contained"
                                color="primary"
                                onClick={this.handleExportExcelVL}
                            >
                                {"Xuất Excel KQ TLVR"}
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

export default connect(mapStateToProps, mapDispatch)(ResultByMonthFillter);
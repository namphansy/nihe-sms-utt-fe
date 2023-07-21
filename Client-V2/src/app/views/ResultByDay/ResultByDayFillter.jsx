import React, { Component } from 'react';
import {
    Grid,
    Button,
    TextField,
    Input,
    IconButton,
} from "@material-ui/core";
import '../Specimen/SpecimenFilter.css';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { searchByPage as searchOrg } from '../HealthOrg/HealthOrgService';
import { toast } from "react-toastify";
import { exportExcel } from "./ResultByDayService";
import { connect } from "react-redux";
import { getLoading } from "../../redux/actions/LoadingActions";
import ClearIcon from "@material-ui/icons/Clear";
import SearchIcon from '@material-ui/icons/Search';

toast.configure({
    autoClose: 2000,
    draggable: false,
    limit: 3,
});

class ResultByDayFillter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            resultDateSearch: "",
            resultType: null,
        }
    }

    handleDateChange = (value, source) => {
        if (source === "resultDateSearch") {
            this.state.resultDateSearch = value;
            this.setState({ resultDateSearch: value });
        }
        if (source === "clear") {
            this.state.resultDateSearch = null;
            this.setState({ resultDateSearch: null });
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
                resultDateSearch: "",
                resultType: null,
            }
        );
    };

    handleFilter = () => {
        this.setState(
            {
                resultDateSearch: this.state.resultDateSearch,
                resultType: this.state.resultType,
            },
            () => this.props.handleFilter(this.state, 'search')
        );
    }

    handleExportExcel = () => {
        this.props.getLoading(true);
        let { resultDateSearch, resultType } = this.state;

        if (resultDateSearch || resultType) {
            let searchObject = {};
            searchObject.pageIndex = 1;
            searchObject.pageSize = 10000;
            searchObject.orderByASC = true;

            if (resultDateSearch) {
                searchObject.resultDate = resultDateSearch;
            }
            if (resultType) {
                searchObject.type = resultType.type;
            }
            exportExcel(searchObject).then((result) => {
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
            resultDateSearch,
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
                                    format="dd/MM/yyyy"
                                    label={<span>Ngày cần tìm</span>}
                                    inputVariant="outlined"
                                    value={resultDateSearch ? resultDateSearch : null}
                                    onChange={(value) =>
                                        this.handleDateChange(value, "resultDateSearch")
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
                        <Grid item md={2} sm={2}>
                            <Button
                                className="ml-16 align-top"
                                variant="contained"
                                color="primary"
                                onClick={this.handleExportExcel}
                            >
                                {"Xuất excel"}
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

export default connect(mapStateToProps, mapDispatch)(ResultByDayFillter);

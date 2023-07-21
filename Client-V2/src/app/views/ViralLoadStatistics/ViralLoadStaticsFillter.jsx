import React, { Component } from 'react';
import {
    Grid,
    Button,
    Input,
    FormControl,
} from "@material-ui/core";
import SearchIcon from '@material-ui/icons/Search';
import '../Specimen/SpecimenFilter.css';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { toast } from "react-toastify";
import {
    exportExcel
} from "./ViralLoadStatisticsService";
import { connect } from "react-redux";
import { getLoading } from "../../redux/actions/LoadingActions";

toast.configure({
    autoClose: 2000,
    draggable: false,
    limit: 3,
});

class ViralLoadStaticsFillter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: "",
            endDate: "",
            specimenSource: "",
        }
    }

    handleDateChange = (value, source) => {
        // debugger"
        if (source === "startDate") {
            this.state.startDate = value;
            this.setState({ startDate: value });
        }
        if (source === "endDate") {
            this.state.endDate = value;
            this.setState({ endDate: value });
        }
    };


    componentDidMount() {

    }

    clearFilter = () => {
        this.setState(
            {
                startDate: "",
                endDate: "",
                specimenSource: "",
            }
        );
    };

    handleFilter = () => {
        this.setState(
            {
                startDate: this.state.startDate,
                endDate: this.state.endDate,
                specimenSource: this.state.specimenSource,
            },
            () => this.props.handleFilter(this.state, 'search')
        );
    }

    handleSpecimenSourceChange = (actions) => {
        this.state.specimenSource = actions.target.value;
        this.setState({ specimenSource: actions.target.value });
    };

    handleExportExcel = () => {
        this.props.getLoading(true);
        let {
            startDate,
            endDate,
            specimenSource,
        } = this.state;

        if (specimenSource || (startDate && endDate)) {
            let searchObject = {};
            searchObject.pageIndex = 1;
            searchObject.pageSize = 10000;
            searchObject.orderByASC = true;
            if (startDate && endDate) {
                searchObject.startDate = this.state.startDate;
                searchObject.endDate = this.state.endDate;
            }
            if (specimenSource) {
                searchObject.specimenSource = this.state.specimenSource;
            }
            exportExcel(searchObject).then((result) => {
                this.setState({ exportStatus: true });
                const url = window.URL.createObjectURL(new Blob([result.data]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "Tải lượng HIV.xlsx");
                document.body.appendChild(link);
                link.click();
                this.props.getLoading(false);
                toast.success(this.props.t("general.successExport"));
            }).catch(() => {
                toast.error("Đã xảy ra lỗi");
                this.props.getLoading(false);
            });
        } else {
            this.props.getLoading(false);
            toast.error("Không thể để trống điều kiện");
        }
    };

    render() {
        let { t } = this.props;
        let {
            startDate,
            endDate,
            specimenSource,
            isLoading,
        } = this.state;
        return (
            <Grid className="filter-container" container spacing={2}>
                <Grid item xs={12} container spacing={4}>
                    <Grid container spacing={2} style={{ paddingLeft: 15 }}>
                        <Grid item md={4} sm={3} >
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                    size="small"
                                    className="w-100"
                                    margin="none"
                                    id="date-picker-dialog"
                                    label={<span>Từ ngày</span>}
                                    inputVariant="outlined"
                                    type="text"
                                    autoOk={true}
                                    format="dd/MM/yyyy"
                                    value={this.state.startDate ? this.state.startDate : null}
                                    disableFuture={true}
                                    onChange={(value) =>
                                        this.handleDateChange(value, "startDate")
                                    }
                                    KeyboardButtonProps={{
                                        "aria-label": "change date",
                                    }}
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item md={4} sm={3} >
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                    size="small"
                                    className="w-100"
                                    margin="none"
                                    id="date-picker-dialog"
                                    label={<span>Đến ngày</span>}
                                    inputVariant="outlined"
                                    type="text"
                                    autoOk={true}
                                    format="dd/MM/yyyy"
                                    value={this.state.endDate ? this.state.endDate : null}
                                    disableFuture={true}
                                    onChange={(value) =>
                                        this.handleDateChange(value, "endDate")
                                    }
                                    KeyboardButtonProps={{
                                        "aria-label": "change date",
                                    }}
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item md={4} sm={4}>
                            <FormControl fullWidth className="mt-10">
                                <Input
                                    placeholder="Nhập nguồn dự án"
                                    onChange={(actions) =>
                                        this.handleSpecimenSourceChange(actions)
                                    }
                                    name="specimenSource"
                                    value={specimenSource}
                                ></Input>
                            </FormControl>
                        </Grid>
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
        );
    }
}

const mapStateToProps = (state) => ({
    loading: state.loading.loading,
});

const mapDispatch = {
    getLoading,
};
export default connect(mapStateToProps, mapDispatch)(ViralLoadStaticsFillter);

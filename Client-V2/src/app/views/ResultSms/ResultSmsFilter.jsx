import React, { Component } from 'react';
import {
    Grid,
    Button,
    Checkbox,
    TextField,
    Input
} from "@material-ui/core";
import SearchIcon from '@material-ui/icons/Search';
import './ResultSmsFilter.css';
import { MuiPickersUtilsProvider, DateTimePicker, DatePicker, KeyboardDatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { searchByPage as searchOrg } from '../HealthOrg/HealthOrgService';
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { deleteItem, searchByPage , getById } from "./ResultSmsService";
import { toast } from "react-toastify";

toast.configure({
    autoClose: 2000,
    draggable: false,
    limit: 3,
});

class ShippingCardFilter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // niheCodeTo: "",
            // niheCodeFrom: "",
            resultDate: null,
            org: null,
            receiverDate:null,
        }
    }

    // handleNiheCodeTo = (event) => {
    //     this.setState({ niheCodeTo: event.target.value });
    // }

    // handleNiheCodeFrom = (event) => {
    //     this.setState({ niheCodeFrom: event.target.value });
    // }

    handleDateChange = (value, source) => {
        let { receiverDate } = this.props;
        this.setState({ [source]: value }, () => {
            receiverDate(value);
        });
    }

    getListOrg() {
        let searchObject = { pageIndex: 0, pageSize: 100000, orgType: 2 };
        searchOrg(searchObject).then(({ data }) => {
            this.setState({ listOrg: data.content });
        })
    }

    handleSelectOrg = (event, value) => {
        let { orgSendSpecimen } = this.props;
        this.setState({ org: value }, () => {
            orgSendSpecimen(value);
        });
    }

    componentDidMount() {
        let searchObject = { pageIndex: 0, pageSize: 100000, orgType: 2 };
        searchOrg(searchObject).then(({ data }) => {
            this.setState({ listOrg: data.content });
        })
    }

    clearFilter = () => {
        this.setState(
            {
                resultDate: null,
                org: null,
                receiverDate: null,
            },
            () => this.props.handleFilter(this.state, 'clear')
        );
    };

    handleFilter = () => {
        this.setState(
            {
                // niheCodeTo: this.state.niheCodeFrom,
                // niheCodeFrom: this.state.niheCodeTo,
                resultDate: this.state.resultDate,
                org: this.state.org,
                receiverDate: this.state.receiverDate,
            },
            () => this.props.handleFilter(this.state, 'search')
        );
    }

    render() {
        let { t ,item} = this.props;
        let {
            // niheCodeTo,
            // niheCodeFrom,
            resultDate,
            org,
            listOrg,
            receiverDate,
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
                                            {t("Ngày nhận mẫu")}
                                        </span>
                                    }
                                    inputVariant="outlined"
                                    type="text"
                                    autoOk={true}
                                    format="dd/MM/yyyy"
                                    value={receiverDate ? receiverDate : null}
                                    onChange={(value) => this.handleDateChange(value, "receiverDate")}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                    }}
                                />
                            </MuiPickersUtilsProvider>
                        </Grid>

                        <Grid item md={4} sm={3}>
                            <Autocomplete
                                size="small"
                                id="combo-box"
                                options={listOrg ? listOrg : []}
                                className="flex-end"
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

                        <Grid item md={2} sm={3}>
                            <Button
                                variant="contained"
                                color="primary"
                                className="btn btn-primary-d d-inline-flex"
                                onClick={() => this.props.handleFilter(this.state)}
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
                    </Grid>
                    
                </Grid>
            </Grid>
        );
    }
}

export default ShippingCardFilter;
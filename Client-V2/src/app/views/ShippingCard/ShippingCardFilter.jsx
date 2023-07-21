import React, { Component } from 'react';
import {
    Grid,
    Button,
    Checkbox,
    TextField,
    Input
} from "@material-ui/core";
import SearchIcon from '@material-ui/icons/Search';
import './ShippingCardFilter.css';
import { MuiPickersUtilsProvider, DateTimePicker, DatePicker, KeyboardDatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { searchByPage as searchOrg } from '../HealthOrg/HealthOrgService';
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { deleteItem, searchByPage, getById } from "./ShippingCardService";
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
            niheCodeTo: "",
            niheCodeFrom: "",
            shipDate: "",
            org: null,
        }
    }

    handleNiheCodeTo = (event) => {
        this.setState({ niheCodeTo: event.target.value });
    }

    handleNiheCodeFrom = (event) => {
        this.setState({ niheCodeFrom: event.target.value });
    }

    handleDateChange = (value, source) => {
        this.setState({ [source]: value }, () => console.log(this.state));
    }

    getListOrg() {
        let searchObject = { pageIndex: 0, pageSize: 100000, orgType: 2 };
        searchOrg(searchObject).then(({ data }) => {
            this.setState({ listOrg: data.content });
        })
    }

    handleSelectOrg = (event, value) => {
        this.setState({ org: value });
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
                niheCodeTo: "",
                niheCodeFrom: "",
                shipDate: null,
                org: null,
                shippingCardType : "Normal",
            },
            () => this.props.handleFilter(this.state, 'clear')
        );
    };

    handleFilter = () => {
        this.setState(
            {
                niheCodeTo: this.state.niheCodeFrom,
                niheCodeFrom: this.state.niheCodeTo,
                shipDate: this.state.shipDate,
                org: this.state.org,
            },
            () => this.props.handleFilter(this.state, 'search')
        );
    }

    render() {
        let { t } = this.props;
        let {
            niheCodeTo,
            niheCodeFrom,
            shipDate,
            org,
            listOrg,
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
                                            {t("Ngày gửi mẫu")}
                                        </span>
                                    }
                                    inputVariant="outlined"
                                    type="text"
                                    autoOk={true}
                                    format="dd/MM/yyyy"
                                    value={shipDate ? shipDate : null}
                                    onChange={(value) => this.handleDateChange(value, "shipDate")}
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
                        {/* <Grid item md={4} sm={3} >
                            <Input
                                name="niheCodeFrom"
                                type="text"
                                variant="contained"
                                className='mt-10 w-100'
                                placeholder="From"
                                value={niheCodeFrom}
                                onChange={this.handleNiheCodeFrom}
                                required
                            />
                        </Grid>
                        <Grid item md={4} sm={3} >
                            <Input
                                name="niheCodeTo"
                                type="text"
                                variant="contained"
                                placeholder="To"
                                className='mt-10 w-100'
                                value={niheCodeTo}
                                onChange={this.handleNiheCodeTo}
                                required
                            />
                        </Grid> */}

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
import React, { Component } from "react";
import {
  Dialog,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions, Icon, IconButton
} from "@material-ui/core";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { getAllBasicInEdit, addNewAdministrativeUnit, updateAdministrativeUnit, checkCode } from "./AdministrativeUnitService";
import { generateRandomId } from "utils";
import Draggable from 'react-draggable';
import Paper from '@material-ui/core/Paper';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Autocomplete from "@material-ui/lab/Autocomplete";

import clsx from 'clsx';
import CircularProgress from '@material-ui/core/CircularProgress';
toast.configure({
  autoClose: 1000,
  draggable: false,
  limit: 3
});

function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

class AdministrativeUnitEditorDialog extends Component {
  state = {
    id: null,
    name: "",
    code: "",
    level: 0,
    parent: null,
    listAdministrativeUnit: [],
    isActive: false,
    loading: false
  };

  handleChange = (event, source) => {
    event.persist();
    if (source === "switch") {
      this.setState({ isActive: event.target.checked });
      return;
    }
    this.setState({
      [event.target.name]: event.target.value
    });
  };
  openCircularProgress = () => {
    this.setState({ loading: true });
  };

  selectAdministrativeUnit = (event, item) => {
    this.setState({ parent: item ? item : {}, parentId: item ? item.id : null });
  }

  handleFormSubmit = async () => {
    await this.openCircularProgress();
    let { id, code } = this.state;
    let { t } = this.props;
    if(this.validateData()) {
      toast.warning('trường dữ liệu không thể để trống');
    } else {
      if (id) {
        updateAdministrativeUnit({
          ...this.state
        }).then(() => {
          toast.success(t('mess_edit'));
          this.setState({ loading: false });
          this.props.handleClose();
        });
      } else {
        addNewAdministrativeUnit({
          ...this.state
        }).then((response) => {
          if (response.data != null && response.status == 200) {
            this.state.id = response.data.id
            this.setState({ ...this.state, loading: false })
            toast.success(t('mess_add'));
            this.props.handleClose();
          }
        });
    }
   
    }
    // checkCode(id, code).then((result) => {
    //   //Nếu trả về true là code đã được sử dụng
    //   if (result.data) {
    //     console.log("Code đã được sử dụng");
    //     toast.warning(t('mess_code'));
    //     this.setState({loading:false})
    //   } else {
    //     if (id) {
    //       updateAdministrativeUnit({
    //         ...this.state
    //       }).then(() => {
    //         toast.success(t('mess_edit'));
    //         this.setState({loading:false})
    //       });
    //     } else {
    //       addNewAdministrativeUnit({
    //         ...this.state
    //       }).then((response) => {
    //         if(response.data != null && response.status == 200){
    //           this.state.id = response.data.id
    //           this.setState({...this.state, loading:false})
    //           toast.success(t('mess_add'));
    //           this.props.handleClose();
    //         }
    //       });
    //     }
    //   }
    // });
  };

  componentDidMount() {
    getAllBasicInEdit(this.state.id ? this.state.id : null).then((data) => {
      this.setState({ listAdministrativeUnit: data.data });
      console.log(this.state.listAdministrativeUnit);
    });
  }

  componentWillMount() {
    //getUserById(this.props.uid).then(data => this.setState({ ...data.data }));
    let { open, handleClose, item } = this.props;
    this.setState(item);
  }

  validateData = () => {
    if(this.state.name.trim().length == 0 ||  this.state.code.trim().length == 0) {
      return true;
    }
    return false;
  }

  render() {
    let { open, handleClose, handleOKEditClose, t, i18n } = this.props;
    let {
      id,
      name,
      code,
      level,
      parent,
      listAdministrativeUnit,
      isActive,
      loading
    } = this.state;
    return (
      <Dialog open={open} PaperComponent={PaperComponent} maxWidth={'sm'} fullWidth={true}>
        <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
          <span className="mb-24" > {(id ? t("update") : t("Add")) + " " + t("administrativeUnit.titlePopup")} </span>
          <IconButton style={{ position: "absolute", right: "10px", top: "10px" }} onClick={() => handleClose()}><Icon color="error"
            title={t("close")}>
            close
            </Icon>
          </IconButton>
        </DialogTitle>
        <ValidatorForm ref="form" onSubmit={this.handleFormSubmit} >
          <DialogContent>
            <Grid className="" container spacing={2}>
              <Grid item sm={12} xs={12}>
                <TextValidator
                  className="w-100 mb-16"
                  label={<span className="font">
                    <span style={{ color: "red" }}> *</span>
                    {t('administrativeUnit.code')}
                  </span>
                  }
                  onChange={this.handleChange}
                  type="text"
                  name="code"
                  value={code}
                  validators={["required"]}
                  errorMessages={[t("general.errorMessages_required")]}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item sm={12} xs={12}>
                <TextValidator
                  className="w-100 mb-16"
                  label={<span className="font">
                    <span style={{ color: "red" }}> *</span>
                    {t('administrativeUnit.name')}
                  </span>}
                  onChange={this.handleChange}
                  type="text"
                  name="name"
                  value={name}
                  validators={["required"]}
                  errorMessages={[t("general.errorMessages_required")]}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              {/* <TextValidator
                  className="w-100 mb-16"
                  label="Level"
                  onChange={this.handleChange}
                  type="number"
                  name="level"
                  value={level}
                  validators={["required"]}
                  errorMessages={[t("general.errorMessages_required")]}
                /> */}
              <Grid item sm={12} xs={12}>
                <Autocomplete
                  size="small"
                  id="combo-box"
                  options={listAdministrativeUnit}
                  className="flex-end"
                  getOptionLabel={option => option.name}
                  onChange={this.selectAdministrativeUnit}
                  value={parent}
                  renderInput={params => (
                    <TextField
                      {...params}
                      variant="outlined"
                      size="small"
                      label={t("administrativeUnit.selectParent")}
                      variant="outlined"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions spacing={4} className="flex flex-end flex-middle">
            <Button
              variant="contained"
              color="secondary"
              onClick={() => this.props.handleClose()}>
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              className="mr-12"
              color="primary"
              type="submit">
              {t('Save')}
            </Button>
          </DialogActions>
        </ValidatorForm>
      </Dialog>
    );
  }
}

export default AdministrativeUnitEditorDialog;

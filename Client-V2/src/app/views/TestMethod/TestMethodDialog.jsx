import React, { Component, useState } from "react";
import {
  Dialog,
  Button,
  Grid,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextareaAutosize
} from "@material-ui/core";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { checkCode, updateUser, addNew, update } from "./TestMethodService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";

toast.configure({
  autoClose: 2000,
  draggable: false,
  limit: 3,
});

class TestMethodDialog extends Component {
  // const [startDate, setStartDate] = useState(new Date());
  state = {
   
    name:"",
    code:"",
    description: "",
    isExternalOrg: false,
    isActive: false,
    shouldOpenSelectParentPopup: false,
    item: {},
    // birthDate: "",

  };
  valueItem = {}
  //------------
  handleChange = (event, source) => {
    // debugger
    event.persist();
    if (source === "isExternalOrg") {
      this.setState({ isExternalOrg: event.target.checked });
      return;
    }
    this.setState({
      [event.target.name]: event.target.value,

    });
  };

  
 

  handleFormSubmit = () => {
    let { id,name,code,description} = this.state;
    let obj = {id: id , name: name, code:code, description:description };
    // let list = [];
    // list.push(relatePatient);
     let item = {};
     item.id = this.state.id;
     item.name = this.state.name;
     item.code = this.state.code;
     item.description = this.state.description;
     


    checkCode(obj).then((result) => {
      //Nếu trả về true là code đã được sử dụng
      if (result.data) {
        toast.warn("Code bị trùng, vui lòng kiểm tra lại");
      } else {
        //Nếu trả về false là code chưa sử dụng có thể dùng
        if (id) {
          update(
            item
          ).then(() => {
            this.props.handleOKEditClose();
            toast.success("Cập nhật thành công!")
          });

        } else {
          addNew(
            item
          ).then(() => {
            this.props.handleOKEditClose();
            toast.success("Thêm mới thành công!")
            // this.setState()
          });

        }
      }
    });
  };
  

  handleDialogClose = () => {
    this.setState({ shouldOpenSelectParentPopup: false });
  };

  componentWillMount() {
    let { open, handleClose, item } = this.props;
    let testMethod;
    if (item.testMethod != null && item.testMethod.length > 0) {
      testMethod = item.testMethod[0];
    }
    this.setState(item, () => {
      this.setState({ testMethod: testMethod })
    });
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
    console.log(this.state)
  }

  componentWillUnmount() {
    ValidatorForm.removeValidationRule('whitespace');
  }

  // handleChangeValue = (item) => {
  //   this.valueItem = item
  //   console.log(this.valueItem)
  // }

  render() {
    let { open, handleClose, handleOKEditClose, t, i18n } = this.props;
    let { id, name, code, description} = this.state;


    return (
      <Dialog open={open} fullWidth maxWidth="sm">
        <div className="p-24">
          <h4 className="mb-24">{id ? t("general.updale") : t("general.add")}</h4>
          <ValidatorForm ref="form" onSubmit={this.handleFormSubmit}>
            <Grid className="" container spacing={4}>
              <Grid item lg={12} md={12} sm={12} xs={12}>
                <TextValidator
                  className="w-100"
                  variant="outlined"
                  size="small"
                  label={<span className="font">
                    <span style={{ color: "red" }}> * </span>
                    {t("testMethod.code")}
                  </span>}
                  onChange={this.handleChange}
                  type="text"
                  name="code"
                  value={code}
                  validators={["required", 'whitespace']}
                  errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                />
              </Grid>
              <Grid item lg={12} md={12} sm={12} xs={12}>
                <TextValidator
                  className="w-100"
                  variant="outlined"
                  size="small"
                  label={<span className="font">
                    <span style={{ color: "red" }}> * </span>
                    {t("testMethod.name")}
                  </span>}
                  onChange={this.handleChange}
                  type="text"
                  name="name"
                  value={name}
                  validators={["required", 'whitespace']}
                  errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                />
              </Grid>



              <Grid item lg={12} md={12} sm={12} xs={12}>
              
              {/* <TextareaAutosize
                className="w-100"
                rowsMax={10}
                aria-label="maximum height"
                className="w-100"
                onChange={this.handleChange}
                rowsMin={3}
                type="text"
                name="description"
                value={description}
                validators={["required", 'whitespace']}
                errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                placeholder= "* Mô tả"
              /> */}
                <TextValidator
                  className="w-100"
                  variant="outlined"
                  size="small"
                  label={<span className="font">
                    <span style={{ color: "red" }}> * </span>
                    {t("testMethod.description")}
                  </span>}
                  onChange={this.handleChange}
                  type="text"
                  name="description"
                  value={description}
                  validators={["required", 'whitespace']}
                  errorMessages={[t("general.required"), t('general.invalidCharacter')]}
                />
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

export default TestMethodDialog;

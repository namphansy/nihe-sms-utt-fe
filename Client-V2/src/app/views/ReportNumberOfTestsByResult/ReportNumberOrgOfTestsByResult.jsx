import React, { Component } from "react";
import {
    Dialog,
    Button,
    Grid,
    DialogActions,
    FormControl,
    Paper,
    DialogTitle,
    DialogContent,
  } from "@material-ui/core";
import Draggable from "react-draggable";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
// import { checkCode, updateItem, saveItem, } from "./EpidemiologicalFactorsService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MaterialTable, { MTableToolbar, Chip, MTableBody, MTableHeader } from 'material-table';
toast.configure({
    autoClose: 2000,
    draggable: false,
    limit: 3,
});

function PaperComponent(props) {
    return (
        <Draggable
            handle="#draggable-dialog-title"
            cancel={'[class*="MuiDialogContent-root"]'}
        >
            <Paper {...props} />
        </Draggable>
    );
}

class ReportNumberOrgOfTestsByResult extends Component {
    state = {
        id: "",
        name: "",
        code: "",
        description: "",
        type: "",
        shouldOpenNotificationPopup: false,
        Notification: "",
      };

      handleDialogClose = () => {
        this.setState({ shouldOpenNotificationPopup: false });
      };

      handleChange = (event, source) => {
        event.persist();
        if (source === "switch") {
          this.setState({ isActive: event.target.checked });
          return;
        }
        this.setState({
          [event.target.name]: event.target.value,
        });
      };


      componentWillMount() {
        //getUserById(this.props.uid).then(data => this.setState({ ...data.data }));
        let { open, handleClose, item } = this.props;
        let statusName = ""
        if(item != null && item.length > 0){
         
          if(item[0].statusName != null && item[0].statusName === "Positive"){
            statusName = " (Dương tính)"
          }else if(item[0].statusName === "Negative"){
            statusName = " (Âm tính)"
          }else if(item[0].statusName === "Checking"){
            statusName = " (Dương tính chờ xác nhận)"
          }
        }
        this.setState({itemList:item});
        this.state.statusName = statusName
      }


      render() {
        let {
          id,
          itemList,
        } = this.state;
        let { open, handleClose, handleOKEditClose, t, i18n } = this.props;

        let columns = [
            { title: t("report.testName"), field: "labTestName", width: "150" },
            { title: t("report.totalSample") + this.state.statusName, field: "totalSample", align: "left", width: "150" },
            // { title: t("Mô tả"), field: "description", align: "left", width: "150" },
        ];


        return (
          <Dialog
            open={open}
            PaperComponent={PaperComponent}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle
              style={{ cursor: "move", paddingBottom: "0px" }}
              id="draggable-dialog-title"
            >
              <h4 className="">Danh sách đơn vị</h4>
            </DialogTitle>
    
            <ValidatorForm ref="form" onSubmit={this.handleFormSubmit}>
              <DialogContent>
                <Grid className="" container spacing={2} >
                <Grid item sm={12} xs={12}>
                <MaterialTable
                            title={t(' ')}
                            data={itemList?itemList:[]}
                            columns={columns}
                            //parentChildData={(row, rows) => rows.find(a => a.id === row.parentId)}
                            // parentChildData={(row, rows) => {
                            //     var list = rows.find(a => a.id === row.parentId);
                            //     return list;
                            // }}
                            options={{
                                selection: false,
                                actionsColumnIndex: -1,
                                paging: false,
                                search: false,
                                padding: 'dense',
                                toolbar: false      
                            }}
                            components={{
                                Toolbar: props => (
                                    <MTableToolbar {...props} />
                                ),
                            }}
                            onSelectionChange={(rows) => {
                                this.data = rows;
                                // this.setState({selectedItems:rows});
                            }}
                            localization={{
                                body: {
                                  emptyDataSourceMessage: `${t(
                                    "general.emptyDataMessageTable"
                                  )}`,
                                },
                              }}
                        />
                </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <div className="flex flex-space-between flex-middle mt-12">
                  <Button
                    variant="contained"
                    className="mr-12"
                    color="secondary"
                    onClick={() => this.props.handleClose()}
                  >
                    {t("Đóng")}
                  </Button>
                  {/* <Button
                    variant="contained"
                    style={{ marginRight: "15px" }}
                    color="primary"
                    type="submit"
                  >
                    {t("Lưu")}
                  </Button> */}
                </div>
              </DialogActions>
            </ValidatorForm>
          </Dialog>
        );
      }
}
export default ReportNumberOrgOfTestsByResult;

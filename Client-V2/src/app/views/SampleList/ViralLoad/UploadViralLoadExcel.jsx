import {
  Button,
  Card, Dialog,
  DialogActions,
  Divider, Grid,
  Icon
} from "@material-ui/core";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Paper from "@material-ui/core/Paper";
import axios from "axios";
import { ConfirmationDialog, EgretProgressBar, ShowDialog } from "egret";
import React from "react";
import Draggable from "react-draggable";
import { toast } from "react-toastify";
toast.configure({
  autoClose: 3000,
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
class UploadFormPopup extends React.Component {
  state = {
    dragClass: "",
    files: [],
    statusList: [],
    queProgress: 0,
    uploadingAllFiles: false,
    shouldOpenShowStatusDialog: false,
    userList: [],
    showMessage: false,
    shouldOpenConfirmationDialog: false,

  };
  handleFileUploadOnSelect = (event) => {
    let files = event.target.files;
    this.fileUpload(files[0]).then((res) => {
      toast.success("File uploaded successfully.");
    });
  };

  //
  handleFileSelect = (event) => {
    let files = event.target.files;
    let list = [];

    for (const iterator of files) {
      list.push({
        file: iterator,
        uploading: false,
        error: false,
        progress: 0,
      });
    }

    this.setState(
      {
        files: [...list],
      },
      function () {
        document.getElementById("upload-single-file").value = null;
      }
    );
  };

  handleDragOver = (event) => {
    event.preventDefault();
    this.setState({ dragClass: "drag-shadow" });
  };

  handleDrop = (event) => {
    event.preventDefault();
    event.persist();
    let { t } = this.props;
    let files = event.dataTransfer.files;
    let list = [];
    let acceptType = this.props.acceptType.split(";");
    for (const iterator of files) {
      if (
        iterator.type.split("/").length <= 0 ||
        acceptType.indexOf(iterator.type.split("/")[1]) < 0
      ) {
        console.log(acceptType);
        console.log(iterator.type.split("/"));
        toast.error(t("general.type_not_accepted"));
        break;
      }
      list.push({
        file: iterator,
        uploading: false,
        error: false,
        progress: 0,
      });
    }

    this.setState({
      dragClass: "",
      files: [...list],
    });

    return false;
  };

  handleDragStart = (event) => {
    this.setState({ dragClass: "drag-shadow" });
  };

  handleDialogClose = () => {
    this.setState({
      shouldOpenShowStatusDialog: false,
    });
    this.props.handleClose();
  };

  handleSingleRemove = (index) => {
    let files = [...this.state.files];
    files.splice(index, 1);
    this.setState({
      files: [...files],
    });
  };

  handleAllRemove = () => {
    this.setState({ files: [] });
  };

  fileUpload(file) {
    debugger;
    const url = this.props.uploadUrl;
    let formData = new FormData();
    formData.append("uploadfile", file); //Lưu ý tên 'uploadfile' phải trùng với tham số bên Server side
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    return axios.post(url, formData, config);
  }

  multipleFilesUpload(files) {
    debugger;
    const url = this.props.uploadUrl;
    let formData = new FormData();
    for (let file of files) {
      formData.append("uploadfiles", file); //Lưu ý tên 'uploadfiles' phải trùng với tham số bên Server side
    }

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    return axios.post(url, formData, config);
  }

  uploadSingleFile = (index) => {
    let { t } = this.props;
    let allFiles = [...this.state.files];
    let file = this.state.files[index];
    this.fileUpload(file.file).then((res) => {
      toast.success(t("general.upload_excel_success"));
      // window.location.reload();
    });

    allFiles[index] = { ...file, uploading: true, error: false };

    this.setState({
      files: [...allFiles],
    });
  };

  uploadAllFile = () => {
    debugger;
    let allFiles = [];
    let { t } = this.props;
    // debugger;
    this.state.files.map((item) => {
      allFiles.push({
        ...item,
        uploading: true,
        error: false,
      });
      return item;
    });
    const files = allFiles.map((file) => file.file);
    this.setState(
      {
        uploadingAllFiles: false,
        shouldOpenConfirmationDialog: false
      },
      function () {
        if (files.length === 0) {
          toast.error(t("general.not_select_file"));
        } else {
          this.multipleFilesUpload(files)
            .then((res) => {
              console.log(res);
              if (res.data.status === "FAILED") {
                this.state.description = res.data.logDetail;
                this.setState({
                  shouldOpenShowStatusDialog: true,
                });
                return;
              }
              if (res.data.success != null && (!res.data.success || res.data.success === "false")) {
                this.state.description = res.data.text;
                this.setState({
                  shouldOpenShowStatusDialog: true,
                });
                return;
              }
              if (res.data == null || res.data == "") {
                toast.success(t("general.upload_excel_success"));
                this.props.handleClose();
                return;
              }

              if (res.data.success == null) {
                this.state.description = res.data;
                this.setState({
                  showMessage: true,
                });
                this.setState({
                  files: [],
                });
                return;
              }
              if (res.data.success === "true" || res.data.success) {
                toast.success(t("general.upload_excel_success"));
                console.log('success 2')
                window.location.reload();
              }

            })
            .catch((err) => {
              if (err.response?.data) {
                toast.error(err.response.data.errorMessage);
              } else toast.error(t("general.upload_excel_error"));
              this.props.handleClose();
              this.setState({
                uploadingAllFiles: false,
              });
            });
        }
      }
    );

    this.setState({
      files: [...allFiles],
      queProgress: 35,
    });
  };

  handleSingleCancel = (index) => {
    let allFiles = [...this.state.files];
    let file = this.state.files[index];

    allFiles[index] = { ...file, uploading: false, error: true };

    this.setState({
      files: [...allFiles],
    });
  };
  handleUploadConfirm = (id) => {
    this.setState({
      shouldOpenConfirmationDialog: true,
    });
  };

  handleCancelAll = () => {
    let allFiles = [];

    this.state.files.map((item) => {
      allFiles.push({
        ...item,
        uploading: false,
        error: true,
      });

      return item;
    });

    this.setState({
      files: [...allFiles],
      queProgress: 0,
    });
  };
  handleChange = event => {
    event.persist();
    this.setState({
      [event.target.name]: event.target.checked
    });
  };

  componentWillUnmount(){
    this.props.reloadListLabTest()
  }

  render() {
    const { t, i18n, handleClose, handleSelect, selectedItem, open, confirmMessage } =
      this.props;
    let { dragClass, files, queProgress, shouldOpenShowStatusDialog, shouldOpenConfirmationDialog, showMessage } =
      this.state;
    let isEmpty = files.length === 0;

    return (
      <Dialog
        onClose={handleClose}
        open={open}
        PaperComponent={PaperComponent}
        maxWidth={"md"}
        fullWidth
      >
        <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
          <span className="mb-20">{t("general.upload")}</span>
        </DialogTitle>
        <DialogContent>
          <div className="upload-form m-sm-30">
            <div className="flex flex-wrap mb-20">
              <label htmlFor="upload-single-file">
                <Button
                  size="small"
                  className="capitalize"
                  component="span"
                  variant="contained"
                  color="primary"
                  disabled={this.state.uploadingAllFiles}
                >
                  <div className="flex flex-middle">
                    <Icon className="pr-8">cloud_upload</Icon>
                    <span>{t("general.select_file")}</span>
                  </div>
                </Button>
              </label>
              <input
                className="display-none"
                onChange={this.handleFileSelect}
                id="upload-single-file"
                type="file"
                multiple
              />
            </div>
            <div
              className={`${dragClass} upload-drop-box flex flex-center flex-middle`}
              onDragEnter={this.handleDragStart}
              onDragOver={this.handleDragOver}
              onDrop={this.handleDrop}
            >
              {isEmpty ? (
                <span>Thả file vào đây</span>
              ) : (
                <h5 className="m-0">
                  {files.length} file{files.length > 1 ? "s" : ""} được chọn...
                </h5>
              )}
            </div>
            <Card className="mb-24" elevation={2}>
              <div className="p-16">
                <Grid
                  container
                  spacing={2}
                  justify="center"
                  alignItems="center"
                  direction="row"
                >
                  <Grid item lg={4} md={4}>
                    {t("general.file_name")}
                  </Grid>
                  <Grid item lg={4} md={4}>
                    {t("general.size")}
                  </Grid>
                  <Grid item lg={4} md={4}>
                    {t("general.action")}
                  </Grid>
                </Grid>
              </div>
              <Divider></Divider>

              {isEmpty && (
                <p className="px-16 center">{t("general.empty_file")}</p>
              )}
              {files.map((item, index) => {
                let { file, uploading, error, progress } = item;
                return (
                  <div className="px-16 py-16" key={file.name}>
                    <Grid
                      container
                      spacing={2}
                      justify="center"
                      alignItems="center"
                      direction="row"
                    >
                      <Grid item lg={4} md={4} sm={12} xs={12}>
                        {file.name}
                      </Grid>
                      <Grid item lg={1} md={1} sm={12} xs={12}>
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </Grid>
                      <Grid item lg={2} md={2} sm={12} xs={12}>
                        <EgretProgressBar value={progress}></EgretProgressBar>
                      </Grid>
                      <Grid item lg={1} md={1} sm={12} xs={12}>
                        {error && <Icon color="error">error</Icon>}
                        {/* {uploading && <Icon className="text-green">done</Icon>} */}
                      </Grid>
                      <Grid item lg={4} md={4} sm={12} xs={12}>
                        <div className="flex">
                          <Button
                            variant="contained"
                            className="bg-error"
                            disabled={this.state.uploadingAllFiles}
                            onClick={() => this.handleSingleRemove(index)}
                          >
                            {t("general.remove")}
                          </Button>
                        </div>
                      </Grid>
                    </Grid>
                  </div>
                );
              })}
            </Card>

            {showMessage && (
              <p className="px-16 center" dangerouslySetInnerHTML={{ __html: this.state.description }}></p>
            )}
          </div>
          {shouldOpenShowStatusDialog && (
            <ShowDialog
              title="Error"
              open={shouldOpenShowStatusDialog}
              onConfirmDialogClose={this.handleDialogClose}
              text={this.state.description}
              cancel={"OK"}
            />
          )}
          {shouldOpenConfirmationDialog && (
            <ConfirmationDialog
              title={t("confirm")}
              open={shouldOpenConfirmationDialog}
              onConfirmDialogClose={this.handleDialogClose}
              onYesClick={this.uploadAllFile}
              text={confirmMessage}
              Yes={t("general.Yes")}
              No={t("general.No")}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            className="mb-16 mr-36 align-bottom"
            variant="contained"
            color="secondary"
            disabled={this.state.uploadingAllFiles}
            onClick={() => handleClose()}
          >
            {t("general.close")}
          </Button>
          <Button
            className="mb-16 mr-36 align-bottom"
            variant="contained"
            color="primary"
            disabled={this.state.uploadingAllFiles}
            onClick={this.props.enableConfirm ? this.handleUploadConfirm : this.uploadAllFile}
          >
            {t("general.upload")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
export default UploadFormPopup;

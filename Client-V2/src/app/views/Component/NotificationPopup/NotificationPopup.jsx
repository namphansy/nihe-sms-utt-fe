import React from "react";
import { Dialog, Button, DialogActions, DialogTitle, DialogContent } from "@material-ui/core";
const NotificationPopup = ({
  open,
  onConfirmDialogClose,
  text,
  title,
  agree,
  size,
  cancel,
  onYesClick,
  onCancelClick,
  confirm
}) => {
  // debugger
  return (
    <Dialog
      maxWidth={size ? size : "xs"}
      fullWidth={true}
      open={open}
      scroll={"paper"}
      onClose={onConfirmDialogClose}
    >
      <DialogTitle className="styleColor" style={{ cursor: "move" }} id="draggable-dialog-title">
        <span className="mb-20 styleColor">
          {title}
        </span>
      </DialogTitle>
      <DialogContent dividers>
        {text}
      </DialogContent>
      <DialogActions>
        <div className="flex flex-space-between flex-middle">
          {confirm ? (
            <>
              <Button
                variant="contained"
                color="secondary"
                onClick={onCancelClick}
                className="mr-12"
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={onYesClick}
              >
                Lưu
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              onClick={onYesClick}
            >
              Xác nhận
            </Button>
          )}
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationPopup;

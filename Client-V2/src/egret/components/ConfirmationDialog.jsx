import React from "react";
import { Dialog, Button,DialogActions } from "@material-ui/core";
const ConfirmationDialog = ({
  open,
  onConfirmDialogClose,
  text,
  title,
  Yes,
  No,
  onYesClick
}) => {
  return (
    <Dialog
      maxWidth="xs"
      fullWidth={true}
      open={open}
      onClose={onConfirmDialogClose}
    >
      <div className="pt-24 px-20 pb-8">
        <h4 className="capitalize">{title}</h4>
        <p>{text}</p>
        <DialogActions>
            <div className="flex flex-space-between flex-middle">
              <Button
                variant="contained"
                color="secondary"
                className="mr-12"
                onClick={onConfirmDialogClose}
              >
                {No}
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={onYesClick}
              >
               {Yes}
              </Button>
            </div>
          </DialogActions>

      </div>
    </Dialog>
  );
};

export default ConfirmationDialog;

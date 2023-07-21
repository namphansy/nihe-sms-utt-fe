import React from "react";
import { Dialog, Button, DialogActions } from "@material-ui/core";
import { red } from "@material-ui/core/colors";

const ShowDialog = ({
  open,
  onConfirmDialogClose,
  text,
  title = "confirm",
  cancel,
  onYesClick
}
) => {
  return (
    <Dialog
      fullWidth={true}
      open={open}
      onClose={onConfirmDialogClose}

    >
      <div className="pt-24 px-20 pb-8"  >
        <h4>{title}</h4> 
          {text?.split("\n")?.map((i, key) => {
            if (i.includes("Sheet")) {
              return <p key={key}>{i}</p>;
            } else {
              return <p style={{ color: '#FF0000' }} key={key}>{i}</p>;
            }

          })
          }
 

        <DialogActions>
          <div className="flex flex-space-between flex-middle">
            <Button
              variant="contained"
              color="secondary"
              onClick={onConfirmDialogClose}
            >
              {cancel}
            </Button>
          </div>
        </DialogActions>

      </div>
    </Dialog>
  );
};

export default ShowDialog;

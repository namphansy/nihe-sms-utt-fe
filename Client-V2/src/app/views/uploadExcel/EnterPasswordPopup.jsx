import React from "react";
import { Dialog, Button, DialogActions, DialogTitle, DialogContent } from "@material-ui/core";
import { TextValidator, ValidatorForm } from "react-material-ui-form-validator";
const NotificationPopup = ({
    open,
    onConfirmDialogClose,
    text,
    title,
    agree,
    size,
    cancel,
    onYesClick,
    password,
    Yes,
    handleChange
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
                <ValidatorForm>
                    <TextValidator
                        className="w-100"
                        variant="outlined"
                        size="small"
                        label={<span className="font">
                            {"Nhập mật khẩu file"}
                        </span>}
                        onChange={handleChange}
                        type="password"
                        name="password"
                        value={password}
                    />
                </ValidatorForm>
            </DialogContent>
            <DialogActions>
                <div className="flex flex-space-between flex-middle">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onYesClick}
                    >
                        {Yes}
                    </Button>
                </div>
            </DialogActions>
        </Dialog>
    );
};

export default NotificationPopup;

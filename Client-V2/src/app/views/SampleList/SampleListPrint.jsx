import React, { Component, useRef } from "react";
import {
    Dialog,
    Button,
    Grid,
    Checkbox,
    IconButton,
    Icon,
    DialogActions,
} from "@material-ui/core";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import { useTranslation, withTranslation, Trans } from "react-i18next";
import Draggable from "react-draggable";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Paper from "@material-ui/core/Paper";
import moment from "moment";

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

function MaterialButton(props) {
    const { t, i18n } = useTranslation();
}

class SampleListPrint extends React.Component {
    state = {
        item: {},
    };

    componentWillMount() {
        let { open, handleClose, item } = this.props;

        this.setState(
            {
                ...this.props.item,
            },
            function () {

            }
        );
    }

    handleFormSubmit = () => {
        let content = document.getElementById("divcontents");
        let pri = document.getElementById("ifmcontentstoprint").contentWindow;
        pri.document.open();

        pri.document.write(content.innerHTML);

        pri.document.close();
        pri.focus();
        pri.print();
        // html2canvas(content)
        // .then((canvas) => {
        //   const imgData = canvas.toDataURL('image/png');
        //   const pdf = new jsPDF();
        //   pdf.addImage(imgData, 'JPEG', 0, 0);
        //   pdf.save("download.pdf");
        // });

    };

    render() {
        const { t, i18n } = this.props;
        let { open, handleClose, handleOKEditClose, item } = this.props;
        let now = new Date();

        return (
            <Dialog
                open={open}
                PaperComponent={PaperComponent}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
                </DialogTitle>
                <iframe
                    id="ifmcontentstoprint"
                    style={{ height: "0px", width: "0px", position: "absolute" }}
                ></iframe>
                <ValidatorForm ref="form" onSubmit={this.handleFormSubmit}>
                    {/* <DialogContent style={{}}> */}
                        <div id="divcontents">
                            <table>
                                <td>
                                    <div>
                                        <p style={{ textAlign:"center", fontSize: "0.975rem", fontWeight: "bold", marginBottom: "0px", }}>
                                            BỘ Y TẾ
                                        </p>
                                        <p style={{ textAlign:"center", fontSize: "0.975rem", fontWeight: "bold", marginBottom: "0px", }}>
                                            VIỆN VỆ SINH DỊCH TỄ TRUNG ƯƠNG
                                        </p>
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <p style={{ textAlign:"center", fontSize: "0.975rem", fontWeight: "bold", marginBottom: "0px", }}>
                                            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                                        </p>
                                        <p style={{ textAlign:"center", fontSize: "0.975rem", fontWeight: "bold", marginBottom: "0px", }}>
                                            Độc lập - Tự do - Hạnh phúc
                                        </p>
                                    </div>
                                </td>
                            </table>

                            <br />
                            <br />
                            <div style={{ textAlign: "center" }}>


                            </div>
                        </div>
                    {/* </DialogContent> */}

                    <DialogActions>
                        <div className="flex flex-space-between flex-middle">
                            <Button
                                variant="contained"
                                color="secondary"
                                className="mr-12"
                                onClick={() => this.props.handleClose()}
                            >
                                {t("general.cancel")}
                            </Button>
                            <Button variant="contained" color="primary" type="submit">
                                {t("In")}
                            </Button>
                        </div>
                    </DialogActions>
                </ValidatorForm>
            </Dialog>
        );
    }
}

export default SampleListPrint;
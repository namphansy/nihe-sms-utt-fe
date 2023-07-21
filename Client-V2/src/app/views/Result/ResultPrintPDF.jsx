import React, { Component, useRef } from "react";
import {
    Dialog,
    Button,
    DialogActions,
} from "@material-ui/core";
import { ValidatorForm } from "react-material-ui-form-validator";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import { useTranslation, withTranslation, Trans } from "react-i18next";
import Draggable from "react-draggable";
import Paper from "@material-ui/core/Paper";
import moment from "moment";
import { printPDFResultVoucher } from "./ResultService";

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

class ResultPrintPDF extends React.Component {
    constructor(props){
        super(props);
        this.ref = React.createRef()
    }
    state = {
        item: {},
        shouldOpenEditorDialog: false,
        shouldOpenViewDialog: false,
        shouldOpenConfirmationDialog: false,
        selectAllItem: false,
        selectedList: [],
        totalElements: 0,
        shouldOpenConfirmationDeleteAllDialog: false,
        listItem: []
    };

    componentWillMount() {
        let { receiverDate, orgName, listItem } = this.props;
        this.setState({ listItem: listItem, orgName: orgName, receiverDate: receiverDate }, () => console.log(listItem));
    }

    handleFormSubmit = () => {
        let content = document.getElementById("divcontents");
        let pri = document.getElementById("ifmcontentstoprint").contentWindow;
        pri.document.open();

        pri.document.write(content.innerHTML);
        pri.addEventListener("beforeprint", function(event) { 
            console.log(event.target)
            pri.getElementById('footer').style.top = event.target.outerHeight - 30
        });
        pri.document.close();
        pri.focus();
        pri.print();
    };

    showSampleResult = (samResult) => {
        if (samResult == 'Checking') {
            return 'Dương tính chờ xác nhận'
        } else if (samResult == 'Negative') {
            return 'Âm tính'
        } else if (samResult == 'Positive') {
            return 'Dương tính'
        }
    }

    hourGetSample = (date) => {
        let hour = moment(date).format('k');
        let min = moment(date).format('mm');
        return hour + "h" + min;
    }

    resultXN = (labResult) => {
        if (labResult == 'KPH' || labResult.charAt(0) == '<') {
            return 'lab1';
        } else if (labResult < 200) {
            return 'lab1';
        } else if (labResult >= 200 && labResult < 1000) {
            return 'lab2';
        } else if (labResult >= 1000) {
            return 'lab3';
        }
    }

    checkGender = (gender) => {
        if (gender == 'M') {
            return 'M';
        } else if (gender == 'F') {
            return 'F';
        }
    }

    render() {
        const { t, i18n } = this.props;
        let { open, handleClose, handleOKEditClose, item } = this.props;
        let { receiverDate, listItem, orgName } = this.state;

        let now = new Date();
        let testDate = listItem[0]?.labTestResult?.testDate;
        let typeSample = listItem[0]?.type == 1 ? 'NormalVL' : 'EID';
        let testMethod = listItem[0]?.labTestResult?.testMethod?.name;
        let sendOrgName = orgName != null ? orgName : listItem[0].specimen?.org?.name;

        return (
            <Dialog
                open={open}
                PaperComponent={PaperComponent}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
                </DialogTitle>
                <iframe
                    id="ifmcontentstoprint"
                    style={{ height: "0px", width: "0px", position: "absolute" }}
                ></iframe>
                <ValidatorForm ref="form" onSubmit={this.handleFormSubmit}>
                    <DialogContent id="divcontents" style={{}}>
                        <div style={{display: 'flex', flexDirection:'column', justifyContent:'space-between'}}>
                            <style dangerouslySetInnerHTML={{ __html: "table, th, td { border: 1px  solid black;} table { border-collapse: collapse; text-align: center; width: 100%; }" }} />
                            <div>
                                {/* Phần đầu */}
                                <div style={{ display: 'flex' }}>
                                    <div style={{ width: '60%', textAlign: 'center' }}>
                                        <p>BỘ Y TẾ</p>
                                        <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                                            VIỆN VỆ SỊNH DỊCH TỄ TRUNG ƯƠNG
                                        </p>
                                    </div>
                                    <div style={{ width: '40%' }} />
                                    <div style={{ width: '70%', textAlign: 'center' }}>
                                        <p>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                                        <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                                            Độc lập - Tự do - Hạnh phúc
                                        </p>
                                        <p>Hà Nội, ngày {moment(now).format('DD')} tháng {moment(now).format('MM')} năm {moment(now).format('YYYY')}</p>
                                    </div>
                                </div>
                                {/* phần 2 */}
                                <div style={{ textAlign: 'center' }}>
                                    <h3 style={{ fontWeight: 'bold' }}>
                                        PHIẾU TRẢ KẾT QUẢ XÉT NGHIỆM ĐO TẢI LƯỢNG HIV
                                    </h3>
                                    <p><strong>Kính gửi</strong>: {sendOrgName}</p>
                                </div>
                                {/* phần 3 */}
                                <div style={{ display: 'flex' }}>
                                    <div style={{ width: '70%', paddingLeft: '30px' }}>
                                        <p>Giờ, Ngày nhận mẫu: {moment(receiverDate).format('k:mm, DD/MM/YYYY')}</p>
                                        <p>Ngày làm xét nghiệm: {moment(testDate).format('DD/MM/YYYY')}</p>
                                        <p>Loại mẫu: {typeSample}</p>
                                        <p>Kỹ thuật xét nghiệm: {testMethod}</p>
                                    </div>
                                    <div style={{ paddingTop: '110px', fontWeight: 'bold' }}>
                                        Ngưỡng phát hiện: (bản sao/ml)
                                    </div>
                                </div>
                                {/* phần 4 */}
                                <div>
                                    <table>
                                        <tbody>
                                            <tr>
                                                <th rowSpan={2}>STT</th>
                                                <th rowSpan={2}>Họ và tên</th>
                                                <th rowSpan={2}>Mã số BN</th>
                                                <th colSpan={2}>Năm sinh
                                                </th>
                                                <th rowSpan={2}>Địa chỉ</th>
                                                <th rowSpan={2} style={{ width: '1%' }}>Giờ lấy mẫu</th>
                                                <th rowSpan={2} style={{ width: '1%' }}>Ngày lấy mẫu</th>
                                                <th colSpan={3}>
                                                    Kết quả XN (bản sao/ml)

                                                </th>
                                                <th rowSpan={2}>Mã XN</th>
                                            </tr>
                                            <tr>
                                                <th > Nam </th>
                                                <th > Nữ </th>
                                                <th > &lt;200 </th>
                                                <th>≥200  &lt;1000</th>
                                                <th>≥1000</th>
                                            </tr>
                                            {listItem?.map((item, index) =>
                                                <>
                                                    <tr>
                                                        <td style={{ width: '1%' }}>{index + 1}</td>
                                                        <td style={{ width: '15%', textAlign: 'left', paddingLeft: '10px' }}>{item?.specimen?.fullName}</td>
                                                        <td style={{ width: '7%' }}>{item?.specimen?.patientCode}</td>
                                                        <td style={{ width: '7%' }}>
                                                            {this.checkGender(item?.specimen.patient.gender) == 'M' ? item?.specimen.patient.manualBirthDate : ""}
                                                        </td>
                                                        <td style={{ width: '7%' }}>
                                                            {this.checkGender(item?.specimen.patient.gender) == 'F' ? item?.specimen.patient.manualBirthDate : ""}
                                                        </td>
                                                        <td style={{ width: '20%' }}>{item?.specimen?.patient?.address}</td>
                                                        <td style={{ width: '6%' }}>{item?.specimen?.specimenDate ? this.hourGetSample(item?.specimen?.specimenDate) : ""}</td>
                                                        <td style={{ width: '7%' }}>{item?.specimen?.specimenDate ? moment(item?.specimen?.specimenDate).format('DD/MM/YYYY') : ""}</td>
                                                        <td style={{ width: '6%' }}> {this.resultXN(item?.labResult) == 'lab1' ? item?.labResult : ""}</td>
                                                        <td style={{ width: '6%' }}> {this.resultXN(item?.labResult) == 'lab2' ? item?.labResult : ""}</td>
                                                        <td style={{ width: '6%' }}> {this.resultXN(item?.labResult) == 'lab3' ? item?.labResult : ""}</td>
                                                        <td style={{ width: '9%' }}>{item?.specimen?.niheCode}</td>
                                                    </tr>
                                                </>)}
                                        </tbody>
                                    </table>
                                </div>
                                {/* phần 5 */}
                                <div style={{ padding: '10px 15px' }}>KPH: Không phát hiện</div>
                                <div style={{ display: 'flex', textAlign: 'center', marginBottom: 150 }}>
                                    <div style={{ width: '33%' }}><p style={{ fontWeight: 'bold' }}>
                                        Người thực hiện xét nghiệm
                                    </p></div>
                                    <div style={{ width: '33%' }}><p style={{ fontWeight: 'bold' }}>
                                        Phụ trách PTN Sinh học phân tử HIV
                                    </p></div>
                                    <div style={{ width: '33%' }}><p style={{ fontWeight: 'bold' }}>
                                        Lãnh đạo viện
                                    </p></div>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #000', display: 'flex', width: '100%' }} id="footer">
                                <div style={{ width: '50%', textAlign: 'center' }}>
                                    NV-QT-5.8.1.BM.16
                                </div>
                                <div style={{ width: '50%', textAlign: 'center' }}>
                                    Ngày hiệu lực: 01/10/2019
                                </div>
                            </div>
                        </div>
                    </DialogContent>
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

export default ResultPrintPDF;

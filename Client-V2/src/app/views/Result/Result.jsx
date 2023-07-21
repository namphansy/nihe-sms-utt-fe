import DateFnsUtils from "@date-io/date-fns";
import {
  Button,
  Checkbox,
  FormControl,
  Grid,
  Icon,
  IconButton,
  Input,
  InputAdornment,
  Link,
  TablePagination,
  TextField,
  Collapse,
} from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import FilterListIcon from "@material-ui/icons/FilterList";
import SearchIcon from "@material-ui/icons/Search";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import UserRoles from "app/services/UserRoles";
import { Breadcrumb, ConfirmationDialog } from "egret";
import { saveAs } from "file-saver";
import MaterialTable, { MTableToolbar } from "material-table";
import moment from "moment";
import React, { Component } from "react";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { getLoading } from "../../redux/actions/LoadingActions";
import { searchByPage as searchOrg } from "../HealthOrg/HealthOrgService";
import ResultDialog from "./ResultDialog";
import ResultFilter from "./ResultFilter";
import ResultPrintPDF from "./ResultPrintPDF";
import {
  deleteItem,
  emailResultVoucherTagPDF,
  exportExcel,
  exportExcelResultById,
  exportExcelResultVoucher,
  getOne,
  printPDFResultVoucherByCheckbox,
  printPDFResultIndividually,
  printPDFResultVoucher,
  resultExcelVoucherEID,
  searchByPage,
  searchMailLog,
} from "./ResultService";

toast.configure({
  autoClose: 2000,
  draggable: false,
  limit: 3,
});

function MaterialButton(props) {
  const { t, i18n } = useTranslation();
  const item = props.item;
  return (
    <div>
      <IconButton size="small" onClick={() => props.onSelect(item, 0)}>
        <Icon fontSize="small" color="primary">
          edit
        </Icon>
      </IconButton>
      <IconButton size="small" onClick={() => props.onSelect(item, 3)}>
        <Icon fontSize="small" color="error">
          print
        </Icon>
      </IconButton>
    </div>
  );
}

class Result extends Component {
  state = {
    keyword: "",
    rowsPerPage: 10,
    page: 0,
    item: {},
    shouldOpenEditorDialog: false,
    shouldOpenConfirmationDialog: false,
    shouldOpenConfirmDialog: false,
    selectAllItem: false,
    selectedList: [],
    itemListMailLog: [],
    totalElements: 0,
    selectLabTest: false,
    shouldOpenConfirmationDeleteAllDialog: false,
    isCheckbox: false,
    shouldOpenPrintPDF: false,
    specimenSource: "",
    responeAPIPrintPDF: [],
    loading: false,
    disableNiheCodeCondition: false,
    disableSpecimenSource: false,
    disableReceiverDate: false,
    disableOrg: false,
    openCollapFilters: false,
  };
  numSelected = 0;
  rowCount = 0;

  handleTextChange = (event) => {
    this.setState({ keyword: event.target.value }, function () { });
  };

  getListOrg() {
    this.props.getLoading(true);
    let searchObject = { pageIndex: 0, pageSize: 100000, orgType: 2 };
    searchOrg(searchObject).then(({ data }) => {
      this.setState({ listOrg: data.content });
      this.props.getLoading(false);
    });
  }

  handleKeyDownEnterSearch = (e) => {
    if (e.key === "Enter") {
      this.search();
    }
  };

  setPage = (page) => {
    this.setState({ page }, function () {
      this.updatePageData();
    });
  };

  setRowsPerPage = (event) => {
    this.setState({ rowsPerPage: event.target.value, page: 0 }, function () {
      this.updatePageData();
    });
  };

  handleChangePage = (event, newPage) => {
    this.setPage(newPage);
  };

  search() {
    this.props.getLoading(true);
    this.setState({ page: 0 }, function () {
      var searchObject = {};

      if (this.state.org != null && this.state.org.id != null) {
        searchObject.orgId = this.state.org.id;
      }

      if (this.state.niheCodeTo && this.state.niheCodeFrom) {
        searchObject.niheCodeFrom = this.state.niheCodeFrom;
        searchObject.niheCodeTo = this.state.niheCodeTo;
      }
      if (this.state.keyword.trim() == "NormalVL") {
        searchObject.type = 1;
      } else if (this.state.keyword.trim() == "EID") {
        searchObject.type = 2;
      } else if (
        this.state.keyword.trim() == "Chưa có kết quả" ||
        this.state.keyword.trim() == "chưa có kết quả"
      ) {
        searchObject.resultStatus = 1;
      } else if (
        this.state.keyword.trim() == "Đã có kết quả" ||
        this.state.keyword.trim() == "đã có kết quả"
      ) {
        searchObject.resultStatus = 2;
      } else {
        searchObject.text = this.state.keyword;
      }
      searchObject.pageIndex = this.state.page + 1;
      searchObject.pageSize = this.state.rowsPerPage;

      searchByPage(searchObject).then(({ data }) => {
        let itemListClone = [...data.content];
        this.setState(
          {
            itemList: itemListClone,
            totalElements: data.totalElements,
          },
          () => {
            this.props.getLoading(false);
          }
        );
      });
    });
  };

  updatePageData = () => {
    this.props.getLoading(true);
    var searchObject = {};
    searchObject.text = this.state.keyword;
    searchObject.pageIndex = this.state.page + 1;
    searchObject.pageSize = this.state.rowsPerPage;
    searchByPage(searchObject).then(({ data }) => {
      let itemListClone = [...data.content];
      this.setState({
        itemList: itemListClone,
        totalElements: data.totalElements,
      });
      this.props.getLoading(false);
    });

    searchMailLog(searchObject).then(({ data }) => {
      this.props.getLoading(true);
      let itemListMailLogClone = [...data.content];
      this.setState(
        {
          itemListMailLog: itemListMailLogClone,
        },
        () => {
          this.props.getLoading(false);
        }
      );
    });
  };

  handleDelete = (id) => {
    this.setState({
      id,
      shouldOpenConfirmationDialog: true,
    });
  };

  handleDownload = () => {
    var blob = new Blob(["Hello, world!"], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, "hello world.txt");
  };

  handleCollapseFilter = () => {
    let { checkedFilter } = this.state;
    this.setState({ checkedFilter: !checkedFilter });
  };

  handleFilter = (option, actions) => {
    const { receiverDate, org } = option;
    this.setState(
      {
        receiverDate: receiverDate,
        orgId: org?.id,
        page: 0,
      },
      () => {
        var searchObject = {};
        searchObject.text = this.state.keyword;
        searchObject.receiverDate = receiverDate;
        searchObject.pageIndex = this.state.page;
        searchObject.pageSize = this.state.rowsPerPage;
        if (org != null) {
          searchObject.orgId = org.id;
        }
        this.searchFilter(searchObject);
      }
    );
  };

  orgSendSpecimen = (value) => {
    this.setState({ orgId: value.id });
  };

  receiverDate = (value) => {
    this.setState({ receiverDate: value });
  };

  searchFilter(searchObject) {
    this.props.getLoading(true);
    searchByPage(searchObject)
      .then(({ data }) => {
        let itemListClone = [...data.content];
        this.setState({
          itemList: itemListClone,
          totalElements: data.totalElements,
        });
        this.props.getLoading(false);
      })
      .catch(() => {
        this.setState({
          itemListClone: [],
        });
        toast.error("Đã xảy ra lỗi khi tìm kiếm");
        this.props.getLoading(false);
      });
  };

  handleDialogClose = () => {
    this.setState({
      shouldOpenEditorDialog: false,
      shouldOpenConfirmationDialog: false,
      shouldOpenConfirmationDeleteAllDialog: false,
      shouldOpenConfirmDialog: false,
      shouldOpenConfirmationEmailDialog: false,
      shouldOpenPrintPDF: false,
    });
  };

  handleOKEditClose = () => {
    this.setState({
      shouldOpenEditorDialog: false,
      shouldOpenConfirmationDialog: false,
      shouldOpenConfirmationEmailDialog: false,
    });
    this.updatePageData();
  };

  handleConfirmationResponse = () => {
    deleteItem(this.state.id).then(() => {
      this.updatePageData();
      this.handleDialogClose();
      toast.success("Xóa thành công");
    });
  };

  componentDidMount() {
    this.setState({ selectLabTest: false });
    this.updatePageData();
    this.getListOrg();
  }

  handleEditItem = (item) => {
    this.setState({
      item: item,
      shouldOpenEditorDialog: true,
    });
  };

  async handleDeleteList(list) {
    for (var i = 0; i < list.length; i++) {
      await deleteItem(list[i].id);
    }
  }
  // the first button
  handlePrintPDFResultVoucherExcelNormal = () => {
    this.props.getLoading(true);
    let {
      niheCodeFrom,
      niheCodeTo,
      specimenSource,
      receiverDate,
      org,
      isCheckbox,
    } = this.state;

    let searchObject = {
      pageIndex: 0,
      pageSize: 1000000,
      niheCodeFrom: this.state.niheCodeFrom,
      niheCodeTo: this.state.niheCodeTo,
      receiverDate: this.state.receiverDate,
      orgId: this.state.org?.id,
    };

    let searchObjectSource = {
      pageIndex: 0,
      pageSize: 1000000,
      specimenSource: this.state.specimenSource,
    };

    if (this.data?.length > 0) {
      let newStr = "";
      this.data.forEach((item, index) => {
        newStr += item.labTestResult.code;
        if (index < this.data.length - 1) {
          newStr += ", ";
        }
      });
      // Tìm theo checkbox từng bản ghi
      printPDFResultVoucherByCheckbox(this.data).then((result) => {   //namps
        this.props.getLoading(true);
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          "KQXN Viral Load của kết quả " + newStr + ".pdf"
        );
        document.body.appendChild(link);
        link.click();
        this.props.getLoading(false);
        toast.success(this.props.t("general.successExport"));
      });
      return;
    }

    // Kiểm tra điều kiện xuất excel
    if (
      !niheCodeFrom &&
      !niheCodeTo &&
      !specimenSource &&
      !receiverDate &&
      !org
    ) {
      this.props.getLoading(false);
      toast.error("Không để trống điều kiện");
      return;
    }

    //Xuất theo nguồn dự án
    if (specimenSource) {
      printPDFResultVoucher(searchObjectSource, true, false).then((result) => {
        this.props.getLoading(false);
        // this.setState({responeAPIPrintPDF: result.data, shouldOpenPrintPDF: true})
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          "KQXN Viral Load" + " của " + this.state.specimenSource + ".pdf"
        );
        document.body.appendChild(link);
        link.click();
        this.props.getLoading(false);
        toast.success(this.props.t("general.successExport"));
      });
      return;
    }

    if (!isCheckbox) {
      //option xuất theo mã nihe
      if (niheCodeFrom && niheCodeTo) {
        //Xuất theo mã nihe
        printPDFResultVoucher(searchObject, true, false).then((result) => {
          this.props.getLoading(false);
          // this.setState({responeAPIPrintPDF: result.data, shouldOpenPrintPDF: true})
          const url = window.URL.createObjectURL(new Blob([result.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute(
            "download",
            "KQXN Viral Load" +
            " của " +
            this.state.niheCodeFrom +
            " đến " +
            this.state.niheCodeTo +
            ".pdf"
          );
          document.body.appendChild(link);
          link.click();
          this.props.getLoading(false);
          toast.success(this.props.t("general.successExport"));
        });
      } else {
        toast.warning("Nhập đủ điều kiện mã NIHE");
        this.props.getLoading(false);
      }
    } else if (isCheckbox) {
      //Xuất theo ngày và đơn vị
      if (receiverDate && org) {
        printPDFResultVoucher(searchObject, true, false).then((result) => {
          this.props.getLoading(false);
          // this.setState({responeAPIPrintPDF: result.data, shouldOpenPrintPDF: true})
          const url = window.URL.createObjectURL(new Blob([result.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute(
            "download",
            "KQXN Viral Load" +
            " ngày " +
            moment(this.state.receiverDate).format("DD/MM/YYYY") +
            " của " +
            this.state.org?.name +
            ".pdf"
          );
          document.body.appendChild(link);
          link.click();
          this.props.getLoading(false);
          toast.success(this.props.t("general.successExport"));
        });
      } else {
        toast.warning("Nhập đủ ngày nhận mẫu và đơn vị lấy mẫu");
        this.props.getLoading(false);
      }
    }
  };

  handleExportExcel = () => {
    this.props.getLoading(true);
    this.setState({ isExportResultVoucher: false });
    let {
      niheCodeFrom,
      niheCodeTo,
      specimenSource,
      receiverDate,
      org,
      isCheckbox,
    } = this.state;

    let searchObject = {
      pageIndex: 0,
      pageSize: 1000000,
      niheCodeFrom: this.state.niheCodeFrom,
      niheCodeTo: this.state.niheCodeTo,
      receiverDate: this.state.receiverDate,
      orgId: this.state.org?.id,
    };

    let searchObjectSource = {
      pageIndex: 0,
      pageSize: 1000000,
      specimenSource: this.state.specimenSource,
    };

    if (this.data?.length > 0) {
      // Tìm theo checkbox từng bản ghi
      let searchObject = {
        listResultDto: this.data,
      };
      let newStr = "";
      this.data.forEach((item, index) => {
        newStr += item.labTestResult.code;
        if (index < this.data.length - 1) {
          newStr += ", ";
        }
      });
      exportExcel(searchObject).then((result) => {
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          "Xuất excel của mã kết quả" + newStr + ".xlsx"
        );
        document.body.appendChild(link);
        link.click();
        this.props.getLoading(false);
        toast.success(this.props.t("general.successExport"));
      });
      return;
    }

    // Kiểm tra điều kiện xuất excel
    if (
      !niheCodeFrom &&
      !niheCodeTo &&
      !specimenSource &&
      !receiverDate &&
      !org
    ) {
      this.props.getLoading(false);
      toast.error("Không để trống điều kiện");
      return;
    }

    //Xuất theo nguồn dự án
    if (specimenSource) {
      exportExcel(searchObjectSource).then((result) => {
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          "KQXN" + "  " + this.state.specimenSource + "  " + ".xlsx"
        );
        document.body.appendChild(link);
        link.click();
        this.props.getLoading(false);
        toast.success(this.props.t("general.successExport"));
      });
      return;
    }

    if (!isCheckbox) {
      //option xuất theo mã nihe
      if (niheCodeFrom && niheCodeTo) {
        //Xuất theo mã nihe
        exportExcel(searchObject).then((result) => {
          //Xuất theo mã NIHE
          const url = window.URL.createObjectURL(new Blob([result.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute(
            "download",
            "KQXN " +
            this.state.niheCodeFrom +
            " đến " +
            this.state.niheCodeTo +
            ".xlsx"
          );
          document.body.appendChild(link);
          link.click();
          this.props.getLoading(false);
          toast.success(this.props.t("general.successExport"));
        });
      } else {
        toast.warning("Nhập đủ điều kiện mã NIHE");
        this.props.getLoading(false);
      }
    } else if (isCheckbox) {
      //Xuất theo ngày và đơn vị
      if (receiverDate && org) {
        exportExcel(searchObject).then((result) => {
          //Xuất theo ngày đơn vị
          const url = window.URL.createObjectURL(new Blob([result.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute(
            "download",
            "KQXN " +
            "ngày " +
            moment(this.state.receiverDate).format("DD/MM/YYYY") +
            " của" +
            this.state.org?.name +
            ".xlsx"
          );
          document.body.appendChild(link);
          link.click();
          this.props.getLoading(false);
          toast.success(this.props.t("general.successExport"));
        });
      } else {
        toast.warning("Nhập đủ ngày nhận mẫu và đơn vị lấy mẫu");
        this.props.getLoading(false);
      }
    }
  };
  // the second button
  handleExportResultVoucherExcelNormal = () => {
    if (this.state.isCheckbox) {
      if (this.state.receiverDate == null || this.state.org == null) {
        toast.error("Không để trống điều kiện");
      } else {
        let searchObject = {
          pageIndex: 0,
          pageSize: 1000000,
          niheCodeFrom: this.state.niheCodeFrom,
          niheCodeTo: this.state.niheCodeTo,
          receiverDate: this.state.receiverDate,
          orgId: this.state.org?.id,
        };
        exportExcelResultVoucher(searchObject, true, false).then((result) => {
          const url = window.URL.createObjectURL(new Blob([result.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute(
            "download",
            "KQXN Viral Load " +
            " ngày " +
            moment(this.state.receiverDate).format("DD/MM/YYYY") +
            " của " +
            this.state.org?.name +
            ".xlsx"
          );
          document.body.appendChild(link);
          link.click();
          toast.success(this.props.t("general.successExport"));
        });
      }
    } else if (!this.state.isCheckbox) {
      if (!this.state.niheCodeFrom || !this.state.niheCodeTo) {
        toast.error("Không để trống điều kiện");
      } else {
        let searchObject = {
          pageIndex: 0,
          pageSize: 1000000,
          niheCodeFrom: this.state.niheCodeFrom,
          niheCodeTo: this.state.niheCodeTo,
          receiverDate: this.state.receiverDate,
          orgId: this.state.org?.id,
        };
        exportExcelResultVoucher(searchObject, true, false).then((result) => {
          const url = window.URL.createObjectURL(new Blob([result.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute(
            "download",
            "KQXN Viral Load " +
            this.state.niheCodeFrom +
            " đến " +
            this.state.niheCodeTo +
            ".xlsx"
          );
          document.body.appendChild(link);
          link.click();
          toast.success(this.props.t("general.successExport"));
        });
      }
    }
  };

  handlePrintPDFResultIndividuallyVoucherExcelNormal = () => {
    this.props.getLoading(true);
    this.setState({ isExportResultVoucher: false });
    let {
      niheCodeFrom,
      niheCodeTo,
      specimenSource,
      receiverDate,
      org,
      isCheckbox,
    } = this.state;

    let searchObject = {
      pageIndex: 0,
      pageSize: 1000000,
      niheCodeFrom: this.state.niheCodeFrom,
      niheCodeTo: this.state.niheCodeTo,
      receiverDate: this.state.receiverDate,
      orgId: this.state.org?.id,
    };

    let searchObjectSource = {
      pageIndex: 0,
      pageSize: 1000000,
      specimenSource: this.state.specimenSource,
    };

    if (this.data?.length > 0) {
      // Tìm theo checkbox từng bản ghi
      let searchObject = {
        listResultDto: this.data,
      };
      let newStr = "";
      this.data.forEach((item, index) => {
        newStr += item.labTestResult.code;
        if (index < this.data.length - 1) {
          newStr += ", ";
        }
      });
      printPDFResultIndividually(searchObject, true, false).then((result) => {
        // this.setState({responeAPIPrintPDF: result.data, shouldOpenPrintPDF: true})
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          "KQXNCN Viral Load của mã kết quả " + newStr + ".pdf"
        );
        document.body.appendChild(link);
        link.click();
        this.props.getLoading(false);
        toast.success(this.props.t("general.successExport"));
      });
      return;
    }

    // Kiểm tra điều kiện xuất excel
    if (
      !niheCodeFrom &&
      !niheCodeTo &&
      !specimenSource &&
      !receiverDate &&
      !org
    ) {
      this.props.getLoading(false);
      toast.error("Không để trống điều kiện");
      return;
    }

    //Xuất theo nguồn dự án
    if (specimenSource) {
      printPDFResultIndividually(searchObjectSource, true, false).then(
        (result) => {
          // this.setState({responeAPIPrintPDF: result.data, shouldOpenPrintPDF: true})
          const url = window.URL.createObjectURL(new Blob([result.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute(
            "download",
            "KQXNCN Viral Load" +
            "  " +
            " của " +
            "  " +
            this.state.specimenSource +
            ".pdf"
          );
          document.body.appendChild(link);
          link.click();
          this.props.getLoading(false);
          toast.success(this.props.t("general.successExport"));
        }
      );
      return;
    }

    if (!isCheckbox) {
      //option xuất theo mã nihe
      if (niheCodeFrom && niheCodeTo) {
        //Xuất theo mã nihe
        printPDFResultIndividually(searchObject, true, false).then((result) => {
          this.props.getLoading(false);
          const url = window.URL.createObjectURL(new Blob([result.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute(
            "download",
            "KQXNCN Viral Load" +
            " Từ " +
            "  " +
            this.state.niheCodeFrom +
            " Đến " +
            "  " +
            this.state.niheCodeTo +
            ".pdf"
          );
          document.body.appendChild(link);
          link.click();
          this.props.getLoading(false);
          toast.success(this.props.t("general.successExport"));
        });
      } else {
        toast.warning("Nhập đủ điều kiện mã NIHE");
        this.props.getLoading(false);
      }
    } else if (isCheckbox) {
      //Xuất theo ngày và đơn vị
      if (receiverDate && org) {
        printPDFResultIndividually(searchObject, true, false).then((result) => {
          // this.setState({responeAPIPrintPDF: result.data, shouldOpenPrintPDF: true})
          const url = window.URL.createObjectURL(new Blob([result.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute(
            "download",
            "KQXNCN Viral Load" +
            " ngày " +
            "  " +
            moment(this.state.receiverDate).format("DD/MM/YYYY") +
            " của " +
            "  " +
            this.state.org?.name +
            ".pdf"
          );
          document.body.appendChild(link);
          link.click();
          this.props.getLoading(false);
          toast.success(this.props.t("general.successExport"));
        });
      } else {
        toast.warning("Nhập đủ ngày nhận mẫu và đơn vị lấy mẫu");
        this.props.getLoading(false);
      }
    }
  };

  handleEmailResultVoucherNormal = () => {
    this.props.getLoading(true);
    this.setState({ shouldOpenConfirmationEmailDialog: false });
    let {
      niheCodeFrom,
      niheCodeTo,
      specimenSource,
      receiverDate,
      org,
      isCheckbox,
    } = this.state;

    let searchObject = {
      pageIndex: 0,
      pageSize: 1000000,
      niheCodeFrom: this.state.niheCodeFrom,
      niheCodeTo: this.state.niheCodeTo,
      receiverDate: this.state.receiverDate,
      orgId: this.state.org?.id,
    };

    // Tìm theo checkbox từng bản ghi
    if (this.data?.length > 0) {
      let searchObjectCheckBox = {
        listResultDto: this.data,
      };
      emailResultVoucherTagPDF(searchObjectCheckBox, true, false)
        .then((result) => {
          toast.success("Quá trình gửi mail hoàn tất");
          this.props.getLoading(false);
          this.updatePageData();
        })
        .catch(() => {
          toast.error("Đã xảy ra lỗi khi gửi mail");
          this.props.getLoading(false);
        });
      return;
    }
    // Kiểm tra điều kiện gửi mail
    if (
      !niheCodeFrom &&
      !niheCodeTo &&
      !specimenSource &&
      !receiverDate &&
      !org
    ) {
      this.props.getLoading(false);
      toast.error("Không để trống điều kiện");
      return;
    }

    if (!isCheckbox) {
      //option gửi mail theo mã nihe
      if (niheCodeFrom && niheCodeTo) {
        //gửi mail theo mã nihe
        emailResultVoucherTagPDF(searchObject, true, false).then((result) => {
          toast.success("Quá trình gửi mail hoàn tất");
          this.props.getLoading(false);
          this.updatePageData();
        });
      } else {
        toast.warning("Nhập đủ điều kiện mã NIHE");
        this.props.getLoading(false);
      }
    } else if (isCheckbox) {
      //Xuất theo ngày và đơn vị
      if (receiverDate && org) {
        emailResultVoucherTagPDF(searchObject, true, false).then((result) => {
          toast.success("Quá trình gửi mail hoàn tất");
          this.props.getLoading(false);
          this.updatePageData();
        });
      } else {
        toast.warning("Nhập đủ ngày nhận mẫu và đơn vị lấy mẫu");
        this.props.getLoading(false);
      }
    }
  };

  handleSpecimenSourceChange = (actions) => {
    this.setState({ specimenSource: actions.target.value });
  };

  // third button
  handleExportResultVoucherExcelEID = () => {
    this.props.getLoading(true);
    this.setState({ isExportResultVoucher: false });
    let {
      niheCodeFrom,
      niheCodeTo,
      specimenSource,
      receiverDate,
      org,
      isCheckbox,
    } = this.state;

    let searchObject = {
      pageIndex: 0,
      pageSize: 1000000,
      niheCodeFrom: this.state.niheCodeFrom,
      niheCodeTo: this.state.niheCodeTo,
      receiverDate: this.state.receiverDate,
      orgId: this.state.org?.id,
    };

    let searchObjectSource = {
      pageIndex: 0,
      pageSize: 1000000,
      specimenSource: this.state.specimenSource,
    };

    if (this.data?.length > 0) {
      // Tìm theo checkbox từng bản ghi
      let searchObject = {
        listResultDto: this.data,
      };
      let newStr = "";
      this.data.forEach((item, index) => {
        newStr += item.labTestResult.code;
        if (index < this.data.length - 1) {
          newStr += ", ";
        }
      });
      console.log(newStr);
      resultExcelVoucherEID(searchObject).then((result) => {
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          "KQXN EID" + " của mã kết quả " + newStr + ".xlsx"
        );
        document.body.appendChild(link);
        link.click();
        this.props.getLoading(false);
        toast.success(this.props.t("general.successExport"));
      });
      return;
    }

    // Kiểm tra điều kiện xuất excel
    if (
      !niheCodeFrom &&
      !niheCodeTo &&
      !specimenSource &&
      !receiverDate &&
      !org
    ) {
      this.props.getLoading(false);
      toast.error("Không để trống điều kiện");
      return;
    }

    //Xuất theo nguồn dự án
    if (specimenSource) {
      resultExcelVoucherEID(searchObjectSource).then((result) => {
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          "KQXN EID" + " theo " + searchObjectSource.specimenSource + ".xlsx"
        );
        document.body.appendChild(link);
        link.click();
        this.props.getLoading(false);
        toast.success(this.props.t("general.successExport"));
      });
      return;
    }

    if (!isCheckbox) {
      //option xuất theo mã nihe
      if (niheCodeFrom && niheCodeTo) {
        //Xuất theo mã nihe
        resultExcelVoucherEID(searchObject).then((result) => {
          const url = window.URL.createObjectURL(new Blob([result.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute(
            "download",
            "KQXN EID từ " + niheCodeFrom + " đến " + niheCodeTo + ".xlsx"
          );
          document.body.appendChild(link);
          link.click();
          this.props.getLoading(false);
          toast.success(this.props.t("general.successExport"));
        });
      } else {
        toast.warning("Nhập đủ điều kiện mã NIHE");
        this.props.getLoading(false);
      }
    } else if (isCheckbox) {
      //Xuất theo ngày và đơn vị
      if (receiverDate && org) {
        console.log(org);
        resultExcelVoucherEID(searchObject).then((result) => {
          const url = window.URL.createObjectURL(new Blob([result.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute(
            "download",
            "KQXN EID từ " +
            moment(receiverDate).format("DD/MM/yyyy") +
            " của " +
            org.code +
            ".xlsx"
          );
          document.body.appendChild(link);
          link.click();
          this.props.getLoading(false);
          toast.success(this.props.t("general.successExport"));
        });
      } else {
        toast.warning("Nhập đủ ngày nhận mẫu và đơn vị lấy mẫu");
        this.props.getLoading(false);
      }
    }
  };

  handleExportExcelResultById = (id, code) => {
    if (id != null) {
      exportExcelResultById(id)
        .then((res) => {
          toast.success(this.props.t("general.successExport"));
          let blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
          });
          saveAs(blob, "XuatPhieu_" + code + ".xlsx");
        })
        .catch((err) => { });
    }
  };

  handleDeleteAll = (event) => {
    this.handleDeleteList(this.data).then(() => {
      this.updatePageData();
      this.handleDialogClose();
    });
  };

  type = (value) => {
    //Khai báo const
    let name = "";
    if (value == 1) {
      name = "NormalVL";
    } else if (value == 2) {
      name = "EID";
    }
    return name;
  };

  handleSelectOrg = (event, value) => {
    this.setState({
      selectLabTest: true,
      org: value,
      disableSpecimenSource: true,
    });
  };

  handleNiheCodeFrom = (event) => {
    this.setState({ niheCodeFrom: event.target.value });
  };

  handleNiheCodeTo = (event) => {
    this.setState({ niheCodeTo: event.target.value });
  };

  resultStatus = (value) => {
    //Khai báo const
    let name = "";
    if (value?.labResult) {
      name = "Đã có kết quả";
    } else {
      name = "Chưa có kết quả";
    }
    return name;
  };

  finalResult = (value) => {
    //Khai báo const
    let name = "";
    if (value == null) {
      name = "";
    } else if (value == 1) {
      name = "Dương tính";
    } else if (value == 2) {
      name = "Âm tính";
    } else if (value == 3) {
      name = "Không xác định";
    } else if (value == 4) {
      name = "Khác";
    }
    return name;
  };

  handleDateChange = (value, source) => {
    this.setState({ [source]: value }, () => console.log(this.state));
    this.setState({ disableSpecimenSource: true });
  };

  handleChangeType = (event, source) => {
    if (source === "orgType") {
      this.setState({ [source]: event.target.value }, () =>
        console.log(this.state)
      );
      return;
    }
    if (source === "isExternalOrg") {
      this.setState({ isExternalOrg: event.target.checked });
      return;
    }
  };

  handleCheckboxChange = () => {
    this.setState({
      disableNiheCodeCondition: false,
      disableOrg: false,
      disableReceiverDate: false,
      disableSpecimenSource: false,
    });
    if (this.state.isCheckbox == true) {
      this.setState({
        receiverDate: null,
        org: null,
      });
      this.setState({ isCheckbox: false });
    }
    if (this.state.isCheckbox == false) {
      this.setState({
        niheCodeFrom: null,
        niheCodeTo: null,
      });
      this.setState({ isCheckbox: true });
    }
  };

  sendStatus = (id) => {
    const itemIndex = this.state.itemListMailLog.findIndex(
      (item) => id == item.result.id
    );

    if (itemIndex != -1) {
      if (this.state.itemListMailLog[itemIndex].status == 0) {
        return (
          <small
            className="border-radius-4 px-8 py-2 "
            style={{ backgroundColor: "#FF0000", color: "#ffffff" }}
          >
            {"Có lỗi"}
          </small>
        );
      } else if (this.state.itemListMailLog[itemIndex].status == 1) {
        return (
          <small
            className="border-radius-4 text-black px-8 py-2 "
            style={{ backgroundColor: "#83ef84" }}
          >
            {"Đã gửi"}
          </small>
        );
      }
    } else {
      return (
        <small
          className="border-radius-4 px-8 py-2 "
          style={{ backgroundColor: "#173F5F", color: "#ffffff" }}
        >
          {"Chưa gửi"}
        </small>
      );
    }
  };

  render() {
    const { t, i18n } = this.props;
    let {
      keyword,
      rowsPerPage,
      page,
      itemList,
      org,
      niheCodeFrom,
      niheCodeTo,
      item,
      receiverDate,
      shouldOpenConfirmationDialog,
      shouldOpenConfirmationEmailDialog,
      shouldOpenEditorDialog,
      listOrg,
      shouldOpenConfirmationDeleteAllDialog,
      isCheckbox,
      shouldOpenPrintPDF,
      responeAPIPrintPDF,
      checkedFilter,
      specimenSource,
      // isLoading,
    } = this.state;
    let searchObject = { pageIndex: 0, pageSize: 1000000 };

    let columns = [
      {
        title: t("general.STT"),
        field: "code",
        align: "center",
        width: "60",
        render: (rowData) => page * rowsPerPage + (rowData.tableData.id + 1),
        headerStyle: {
          minWidth: "60px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "60px",
          paddingRight: "35px",
          textAlign: "center",
        },
      },
      {
        title: t("general.action"),
        field: "custom",
        align: "left",
        width: "250",
        render: (rowData) => (
          <MaterialButton
            item={rowData}
            onSelect={(rowData, method) => {
              if (method === 0) {
                getOne(rowData.id).then(({ data }) => {
                  if (data.parent === null) {
                    data.parent = {};
                  }
                  this.setState({
                    item: data,

                    shouldOpenEditorDialog: true,
                  });
                });
              } else if (method === 1) {
                this.handleDelete(rowData.id);
              } else if (method === 3) {
                this.handleExportExcelResultById(
                  rowData.id,
                  rowData.specimen.niheCode
                );
              } else {
                alert("Call Selected Here:" + rowData.id);
              }
            }}
          />
        ),
      },
      {
        title: t("specimen.code"),
        field: "specimen.niheCode",
        align: "left",
        width: "150",
        headerStyle: {
          minWidth: "150px",
          paddingRight: "0px",
          textAlign: "left",
        },
        cellStyle: {
          minWidth: "150px",
          paddingRight: "0px",
          textAlign: "left",
        },
      },
      {
        title: t("result.code"),
        field: "testCode",
        align: "left",
        width: "150",
        headerStyle: {
          minWidth: "150px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "150px",
          textAlign: "center",
        },
      },
      {
        title: t("Kết quả (cp/ml)"),
        field: "labResult",
        align: "left",
        width: "150",
      },
      {
        title: "Ngày nhận mẫu",
        field: "receiverDate",
        align: "center",
        width: "150",
        headerStyle: {
          minWidth: "150px",
          paddingRight: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "150px",
          paddingRight: "0px",
          textAlign: "center",
        },
        render: (rowData) =>
          rowData.specimen?.receiverDate ? (
            <span>
              {moment(rowData.specimen.receiverDate).format("DD/MM/YYYY")}
            </span>
          ) : (
            ""
          ),
      },
      {
        title: "Ngày xét nghiệm",
        field: "testDate",
        align: "left",
        width: "150",
        headerStyle: {
          minWidth: "150px",
          paddingRight: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "150px",
          paddingRight: "0px",
          textAlign: "center",
        },
        render: (rowData) =>
          rowData.labTestResult?.testDate ? (
            <span>
              {moment(rowData.labTestResult?.testDate).format("DD/MM/YYYY")}
            </span>
          ) : (
            ""
          ),
      },
      {
        title: t("result.date"),
        field: "resultDate",
        align: "left",
        width: "100",
        headerStyle: {
          minWidth: "150px",
          paddingRight: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "150px",
          paddingRight: "0px",
          textAlign: "center",
        },
        render: (rowData) =>
          rowData.resultDate ? (
            <span>{moment(rowData.resultDate).format("DD/MM/YYYY")}</span>
          ) : (
            ""
          ),
      },
      {
        title: t("result.status"),
        field: "resultStatus",
        align: "left",
        width: "100",
        headerStyle: {
          minWidth: "150px",
          paddingRight: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "150px",
          paddingRight: "0px",
          textAlign: "center",
        },
        render: (rowData) => this.resultStatus(rowData),
      },
      {
        title: "Kết quả cuối cùng",
        field: "finalResult",
        align: "left",
        width: "80",
        headerStyle: {
          minWidth: "150px",
          paddingRight: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "150px",
          paddingRight: "0px",
          textAlign: "center",
        },
        render: (rowData) => this.finalResult(rowData.finalResult),
      },
      {
        title: t("result.type"),
        field: "type",
        align: "left",
        width: "100",
        headerStyle: {
          minWidth: "150px",
          paddingRight: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "150px",
          paddingRight: "0px",
          textAlign: "center",
        },
        render: (rowData) => this.type(rowData.type),
      },
      {
        title: "Trạng thái",
        field: "",
        align: "left",
        width: "100",
        headerStyle: {
          minWidth: "150px",
          paddingRight: "0px",
          textAlign: "center",
        },
        cellStyle: {
          minWidth: "150px",
          paddingRight: "0px",
          textAlign: "center",
        },
        render: (rowData) => this.sendStatus(rowData.id),
      },
    ];

    return (
      <div className="m-sm-30">
        <div className="mb-sm-30">
          <Breadcrumb routeSegments={[{ name: t("result.title") }]} />
        </div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item lg={4} md={4} sm={6} xs={6}>
                <Button
                  className="btn_s_right d-inline-flex btn btn-primary-d"
                  variant="contained"
                  onClick={this.handleCollapseFilter}
                  fullWidth
                  color="primary"
                >
                  <FilterListIcon />
                  <span>{t("general.filter")}</span>
                  <ArrowDropDownIcon
                    style={
                      this.state.checkedFilter == true
                        ? {
                          transform: "rotate(180deg)",
                          transition: ".3s",
                          paddingRight: 5,
                        }
                        : {
                          transform: "rotate(0deg)",
                          transition: ".3s",
                          paddingLeft: 5,
                        }
                    }
                  />
                </Button>
              </Grid>
              <Grid style={{ marginLeft: "auto" }} item md={4}>
                <FormControl fullWidth>
                  <Input
                    style={{ width: "100%" }}
                    className="mt-10 search_box stylePlaceholder"
                    type="text"
                    name="keyword"
                    value={keyword}
                    onChange={this.handleTextChange}
                    onKeyDown={this.handleKeyDownEnterSearch}
                    placeholder={t("general.enterSearch")}
                    id="search_box"
                    startAdornment={
                      <InputAdornment>
                        <Link to="#">
                          {" "}
                          <SearchIcon
                            onClick={() => this.search(keyword)}
                            style={{
                              position: "absolute",
                              top: "0",
                              right: "0",
                            }}
                          />
                        </Link>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Grid>
            </Grid>

            <Collapse
              in={checkedFilter}
              style={{
                width: "100%",
                paddingTop: "10px",
              }}
            >
              <ResultFilter
                handleFilter={this.handleFilter}
                t={t}
                orgSendSpecimen={this.orgSendSpecimen}
                receiverDate={this.receiverDate}
              />
            </Collapse>
          </Grid>
          <Grid item xs={12}>
            <Grid container className="mb-16">
              <Grid item md={3} className="pr-16">
                <FormControl fullWidth>
                  <Input
                    placeholder="Nhập nguồn dự án"
                    onChange={(actions) =>
                      this.handleSpecimenSourceChange(actions)
                    }
                    name="specimenSource"
                    value={specimenSource}
                    disabled={this.state.disableSpecimenSource}
                    className="mt-10 mr-20"
                  />
                </FormControl>
              </Grid>
              {!UserRoles.isUser() && !isCheckbox && (
                <>
                  <Grid item md={3} className="pr-16">
                    <Input
                      name="niheCodeFrom"
                      type="text"
                      style={{ width: "100%" }}
                      className="mt-10 mr-16"
                      placeholder="Từ Mã NIHE"
                      value={niheCodeFrom}
                      onChange={this.handleNiheCodeFrom}
                      required
                      disabled={this.state.disableNiheCodeCondition}
                    />
                  </Grid>
                  <Grid item md={3} className="pr-16">
                    <Input
                      name="niheCodeTo"
                      type="text"
                      placeholder="đến Mã NIHE"
                      style={{ width: "100%" }}
                      className="mt-10 mr-16"
                      value={niheCodeTo}
                      onChange={this.handleNiheCodeTo}
                      onKeyDown={this.handleKeyDownEnterSearch}
                      disabled={this.state.disableNiheCodeCondition}
                      required
                    />
                  </Grid>
                </>
              )}
              {!UserRoles.isUser() && this.state.isCheckbox && (
                <>
                  <Grid item md={3} className="pr-16">
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                      <KeyboardDatePicker
                        size="small"
                        id="date-picker-dialog"
                        className="w-100"
                        label={<span>{t("specimen.receiverDate")}</span>}
                        inputVariant="outlined"
                        type="text"
                        autoOk={true}
                        format="dd/MM/yyyy"
                        value={receiverDate ? receiverDate : null}
                        onChange={(value) =>
                          this.handleDateChange(value, "receiverDate")
                        }
                        KeyboardButtonProps={{
                          "aria-label": "change date",
                        }}
                      />
                    </MuiPickersUtilsProvider>
                  </Grid>
                  <Grid item md={3} className="pr-16">
                    <Autocomplete
                      size="small"
                      id="combo-box"
                      options={listOrg ? listOrg : []}
                      className="flex-end w-100"
                      getOptionLabel={(option) => option.name}
                      onChange={this.handleSelectOrg}
                      value={org}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label={t("Đơn vị gửi mẫu")}
                          variant="outlined"
                        />
                      )}
                    />
                  </Grid>
                </>
              )}
              {!UserRoles.isUser() && (
                <Grid item md={1} className="mt-10">
                  <Tooltip title="Tìm theo ngày mà DVGM" placement="bottom">
                    <Checkbox
                      checked={this.state.isCheckbox}
                      onChange={this.handleCheckboxChange}
                      inputProps={{ "aria-label": "primary checkbox" }}
                      title="Tìm theo ngày mà DVGM"
                    />
                  </Tooltip>
                </Grid>
              )}
            </Grid>
          </Grid>
          <Grid item xs={12}>
            {!UserRoles.isUser() && (
              <Grid item md={12} sm={6} xs={12}>
                <Grid container>
                  <Grid item md={12} sm={8}>
                    <Button
                      className="mb-16 mr-16 align-bottom"
                      variant="contained"
                      color="primary"
                      onClick={this.handleExportExcel}
                    >
                      {"Xuất excel"}
                    </Button>
                    <Button
                      className="mb-16 mr-16 align-bottom"
                      variant="contained"
                      color="primary"
                      onClick={this.handlePrintPDFResultVoucherExcelNormal}
                    >
                      {"Xuất phiếu KQ tải lượng"}
                    </Button>
                    <Button
                      className="mb-16 mr-16 align-bottom"
                      variant="contained"
                      color="primary"
                      onClick={
                        this.handlePrintPDFResultIndividuallyVoucherExcelNormal
                      }
                    >
                      {"Xuất phiếu KQ tải lượng cá nhân"}
                    </Button>
                    <Button
                      className="mb-16 mr-16 align-bottom"
                      variant="contained"
                      color="primary"
                      onClick={() =>
                        this.setState({
                          shouldOpenConfirmationEmailDialog: true,
                        })
                      }
                    >
                      {"Gửi email phiếu KQ tải lượng"}
                    </Button>
                    <Button
                      className="mb-16 mr-16 align-bottom"
                      variant="contained"
                      color="primary"
                      onClick={this.handleExportResultVoucherExcelEID} // xuất excel phiếu trả kết quả EID
                    >
                      {"Xuất phiếu KQ EID"}
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>
          <Grid item xs={12}>
            <div>
              {shouldOpenEditorDialog && (
                <ResultDialog
                  t={t}
                  i18n={i18n}
                  handleClose={this.handleDialogClose}
                  open={shouldOpenEditorDialog}
                  handleOKEditClose={this.handleOKEditClose}
                  item={this.state.item ? this.state.item : {}}
                />
              )}

              {shouldOpenConfirmationDialog && (
                <ConfirmationDialog
                  title={t("general.confirm")}
                  open={shouldOpenConfirmationDialog}
                  onConfirmDialogClose={this.handleDialogClose}
                  onYesClick={this.handleConfirmationResponse}
                  text={t("general.DeleteConfirm")}
                  Yes={t("general.Yes")}
                  No={t("general.No")}
                />
              )}
              {shouldOpenConfirmationEmailDialog && (
                <ConfirmationDialog
                  title={t("general.confirm")}
                  open={shouldOpenConfirmationEmailDialog}
                  onConfirmDialogClose={this.handleDialogClose}
                  onYesClick={this.handleEmailResultVoucherNormal}
                  text={"Gửi email phiếu KQ tải lượng. Tiếp tục"}
                  Yes={t("general.Yes")}
                  No={t("general.No")}
                />
              )}
              {shouldOpenPrintPDF && (
                <ResultPrintPDF
                  t={t}
                  i18n={i18n}
                  handleClose={this.handleDialogClose}
                  open={shouldOpenPrintPDF}
                  handleOKEditClose={this.handleOKEditClose}
                  listItem={
                    this.state.responeAPIPrintPDF
                      ? this.state.responeAPIPrintPDF
                      : []
                  }
                  orgName={this.state.org?.name}
                  receiverDate={this.state.receiverDate}
                />
              )}
            </div>
            <MaterialTable
              title={t("")}
              data={itemList}
              columns={columns}
              // parentChildData={(row, rows) => rows.find(a => a.id === row.parentId)}
              parentChildData={(row, rows) => {
                var list = rows.find((a) => a.id === row.parentId);
                return list;
              }}
              // isLoading={this.state.isLoading}
              options={{
                selection: true,
                actionsColumnIndex: -1,
                paging: false,
                search: false,
                rowStyle: (rowData, index) => ({
                  backgroundColor: index % 2 === 1 ? "#EEE" : "#FFF",
                }),
                maxBodyHeight: "450px",
                minBodyHeight: "370px",
                headerStyle: {
                  backgroundColor: "#358600",
                  color: "#fff",
                },
                padding: "dense",
                toolbar: false,
              }}
              components={{
                Toolbar: (props) => <MTableToolbar {...props} />,
              }}
              onSelectionChange={(rows) => {
                this.data = rows;
              }}
            />
            <TablePagination
              align="left"
              className="px-16"
              rowsPerPageOptions={[1, 2, 5, 10, 25, 50, 100]}
              component="div"
              labelRowsPerPage={t("general.rows_per_page")}
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} ${t("general.of")} ${count !== -1 ? count : `more than ${to}`
                }`
              }
              count={this.state.totalElements}
              rowsPerPage={this.state.rowsPerPage}
              page={this.state.page}
              backIconButtonProps={{
                "aria-label": "Previous Page",
              }}
              nextIconButtonProps={{
                "aria-label": "Next Page",
              }}
              onChangePage={this.handleChangePage}
              onChangeRowsPerPage={this.setRowsPerPage}
            />
          </Grid>
        </Grid>
      </div>
    );
  }
}
const mapStateToProps = (state) => ({
  loading: state.loading.loading,
});

const mapDispatch = {
  getLoading,
};
export default connect(mapStateToProps, mapDispatch)(Result);

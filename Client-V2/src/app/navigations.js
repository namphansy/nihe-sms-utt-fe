import ConstantList from "./appConfig";
export const navigations = [
  {
    name: "Dashboard.dashboard",
    icon: "home",
    path: ConstantList.ROOT_PATH + "dashboard/analytics",
    isVisible: true,
  },
  {
    name: "Dashboard.testManagement.title",
    icon: "science",
    path: "",
    isVisible: true,
    children: [
      {
        name: "Dashboard.testManagement.patient",
        path: ConstantList.ROOT_PATH + "patient",
        icon: "account_box",
        isVisible: true,
      },
      {
        name: "Dashboard.testManagement.specimen",
        icon: "S",
        path: ConstantList.ROOT_PATH + "specimen",
        isVisible: true,
      },
      {
        name: "Dashboard.testManagement.childrenSpecimen",
        icon: "C",
        path: ConstantList.ROOT_PATH + "children_specimen",
        isVisible: true,
      },
      {
        name: "Dashboard.testManagement.specimenOver18M",
        path:  ConstantList.ROOT_PATH + "specimen-over18meid",
        iconText: "C",
        isVisible: true,
      },
    ]
  },
  {
    name: "Dashboard.shippingSpecimenList.title",
    icon: "motorcycle",
    path: "",
    isVisible: true,
    children: [
      {
        name: "Dashboard.shippingSpecimenList.hivPatient",
        path: ConstantList.ROOT_PATH + "shipping-card",
        iconText: "H",
        isVisible: true,
      },
      {
        name: "Dashboard.shippingSpecimenList.children",
        path: ConstantList.ROOT_PATH + "shipping-card-children",
        iconText: "E",
        isVisible: true,
      },
    ]
  },

  // {
  //   name: "Dashboard.testRepuest.title",
  //   icon: "dashboard",
  //   path: "",
  //   isVisible: true,
  //   children: [
  //     {
  //       name: "Dashboard.testRepuest.eidUnder18Month",
  //       path: "",
  //       iconText: "E",
  //       isVisible: true,
  //     },
  //     {
  //       name: "Dashboard.testRepuest.eidOder18Month",
  //       path: ConstantList.ROOT_PATH + "examine_request_adults",
  //       iconText: "E",
  //       isVisible: true,
  //     }
  //   ]
  // },

  {
    name: "Dashboard.testSpecimenList.title",
    icon: "ballot",
    path: "",
    isVisible: true,
    children: [
      {
        name: "Dashboard.testSpecimenList.viralLoad",
        path: ConstantList.ROOT_PATH + "sample_list/viral_load",
        iconText: "VL",
        isVisible: true,
      },
      {
        name: "Dashboard.testSpecimenList.eid",
        path: ConstantList.ROOT_PATH + "sample_list/eid",
        iconText: "E",
        isVisible: true,
      }
    ]
  },
  {
    name: "Dashboard.testResult.title",
    icon: "insert_drive_file",
    path: "",
    isVisible: true,
    children: [
      {
        name: "Dashboard.testResult.hiv",
        path: ConstantList.ROOT_PATH + "viral_load_statistics",
        iconText: "H",
        isVisible: true,
      },
      {
        name: "Dashboard.testResult.result",
        path: ConstantList.ROOT_PATH + "result",
        iconText: "N",
        isVisible: true,
      },
      // {
      //   name: "Dashboard.testResult.answerForm",
      //   path: "",
      //   iconText: "T",
      //   isVisible: true,
      // },
      // {
      //   name: "Dashboard.testResult.personal",
      //   path: "",
      //   iconText: "C",
      //   isVisible: true,
      // },
      {
        name: "Dashboard.testResult.eid",
        path: ConstantList.ROOT_PATH + "resultEID",
        iconText: "D",
        isVisible: true,
      },
      {
        name: "Dashboard.testResult.byMonth",
        path: ConstantList.ROOT_PATH + "resultByMonth",
        iconText: "T",
        isVisible: true,
      },
      {
        name: "Dashboard.testResult.byDay",
        path:  ConstantList.ROOT_PATH + "resultByDay",
        iconText: "N",
        isVisible: true,
      }
    ]
  },
  {
    name: "Dashboard.receiveResult.title",
    icon: "dashboard",
    path: "",
    isVisible: true,
    children: [
      {
        name: "Dashboard.receiveResult.hiv",
        path:  ConstantList.ROOT_PATH+"patient_result_hiv",
        iconText: "H",
        isVisible: true,
      },
      {
        name: "Dashboard.receiveResult.eid",
        path:  ConstantList.ROOT_PATH+"patient_result_eid",
        iconText: "E",
        isVisible: true,
      }
    ]
  },
  {
    name: "Dashboard.directory.title",
    icon: "toc",
    path: "",
    isVisible: true,
    children: [
      {
        name: "Dashboard.directory.listOpcCdc",
        path: ConstantList.ROOT_PATH + "dashboard/health_org",
        icon: "public",
        isVisible: true,
      },
      {
        name: "Dashboard.directory.administrativeUnit",
        path: ConstantList.ROOT_PATH + "administrative-unit",
        icon: "account_balance",
        isVisible: true,
      },
      {
        name: "Dashboard.directory.testMachine",
        path: ConstantList.ROOT_PATH + "test_machine",
        iconText: "N",
        isVisible: true,
      },
      {
        name: "Dashboard.directory.reagent",
        path: ConstantList.ROOT_PATH + "reagent",
        icon: "science",
        isVisible: true,
      },
      {
        name: "Dashboard.directory.reagentCode",
        path: ConstantList.ROOT_PATH + "reagent-code",
        icon: "science",
        isVisible: true,
      },
      {
        name: "Dashboard.directory.internalTest",
        path: ConstantList.ROOT_PATH + "internal-test",
        icon: "science",
        isVisible: true,
      },
      {
        name: "Dashboard.directory.testMethod",
        path: ConstantList.ROOT_PATH + "test-method",
        icon: "how_to_reg",
        isVisible: true,
      },

      {
        name: "Dashboard.directory.specimenType",
        path: ConstantList.ROOT_PATH + "specimen-type",
        iconText: "X",
        isVisible: true,
      }
    ]
  },
  ,
  {
    name: "Dashboard.manage",
    isVisible: true,
    icon: "engineering",
    children: [
      {
        name: "manage.user",
        isVisible: true,
        path: ConstantList.ROOT_PATH + "user_manager/user",
        icon: "keyboard_arrow_right"
      },
      {
        name: "manage.menu",
        isVisible: true,
        path: ConstantList.ROOT_PATH + "list/menu",
        icon: "keyboard_arrow_right"
      },
      {
        name: "SmsLog",
        isVisible: true,
        path: ConstantList.ROOT_PATH + "dashboard/sms-log",
        icon: "keyboard_arrow_right"
      },
      {
        name: "MailLog",
        isVisible: true,
        path: ConstantList.ROOT_PATH + "dashboard/mail-log",
        icon: "keyboard_arrow_right"
      },
      {
        name: "manage.appConfig",
        isVisible: true,
        path:  ConstantList.ROOT_PATH + "manager/appConfig",
        icon: "keyboard_arrow_right"
      }
    ]
  },
  {
    name: "Kết quả cần gửi",
    path:  ConstantList.ROOT_PATH + "resultSms",
    iconText: "H",
    isVisible: true,
  },
  {
    name: "Nhật kí gửi tin nhắn",
    path: ConstantList.ROOT_PATH + "dashboard/sms-log",
    iconText: "H",
    isVisible: true,
  }
];

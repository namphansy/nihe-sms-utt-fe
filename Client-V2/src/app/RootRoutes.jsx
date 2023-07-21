import React from "react";
import { Redirect } from "react-router-dom";
import homeRoutes from "./views/home/HomeRoutes";
import sessionRoutes from "./views/sessions/SessionRoutes";
import dashboardRoutes from "./views/dashboard/DashboardRoutes";
import administrativeUnitRoutes from "./views/AdministrativeUnit/AdministrativeUnitRoutes";
import fiscalYearRoutes from "./views/FiscalYear/FiscalYearRoutes";
import otherRoutes from "./views/others/OtherRoutes";
import UserRoutes from "./views/User/UserRoutes";
import departmentRoutes from "./views/Department/DepartmentRoutes";
import roleRoutes from "./views/Role/RoleRoutes";
import ConstantList from "./appConfig";
import MenuRoutes from "./views/Menus/MenuRoutes";
import pageLayoutRoutes from "./views/page-layouts/PageLayoutRoutees";
import HealthOrgRoutes from "./views/HealthOrg/HealthOrgRoutes"
import Reagent from "./views/Reagent/ReagentRoutes";
import DevelopingRouter from "./views/Developing/DevelopingRoutes";
import SpecimenRouter from "./views/Specimen/SpecimenRouter";
import ExamineRequestRouter from "./views/ExamineRequest/ExamineRequestRouter";
import PatientRoutes from "./views/Patient/PatientRoutes";
import SampleListRouter from "./views/SampleList/SampleListRouter";
import SmsLogRoutes from "./views/SmsLog/SmsLogRoutes";
import MailLogRoutes from "./views/MailLog/MailLogRoutes";
import TestMachineRouters from "./views/TestMachine/TestMachineRouters";
import TestMethod from "./views/TestMethod/TestMethodRoutes"
import SpecimenType from "./views/SpecimenType/SpecimenTypeRoutes";
import ChildrenSpecimenRouter from "./views/ChildrenSpecimen/ChildrenSpecimenRouter";
import Result from "./views/Result/ResultRoutes";
import ResultByDay from "./views/ResultByDay/ResultByDayRoutes";
import ResultByMonth from "./views/ResultByMonth/ResultByMonthRoutes";
import ResultEID from "./views/ResultEID/ResultEIDRoutes";
import PatientResultHIV from "./views/PatientResultHiv/PatientResultHivRoutes";
import PatientResultEID from "./views/PatientResultEID/PatientResultEIDRoutes";
import ResultSms from "./views/ResultSms/ResultSmsRoutes";
import SmsLog from "./views/SmsLog/SmsLogRoutes";
import ShippingCard from "./views/ShippingCard/ShippingCardRoutes";
import ShippingCardChildrenRoutes from "./views/ShippingCardChildren/ShippingCardChildrenRoutes";
import ViralLoadStatisticsRoutes from "./views/ViralLoadStatistics/ViralLoadStatisticsRoutes";
import reagentCodeRoutes from "./views/ReagentCode/ReagentCodeRoutes";
import internalTestRoutes from "./views/InternalTest/InternalTestRoutes";
import SpecimenOver18mEID from "./views/SpecimenOver18mEID/SpecimenOver18mEIDRouter";
import appConfigRoutes from "./views/appConfig/appConfigRoutes";
// import
const redirectRoute = [
  {
    path: ConstantList.ROOT_PATH,
    exact: true,
    component: () => <Redirect to={ConstantList.HOME_PAGE} />//Luôn trỏ về HomePage được khai báo trong appConfig
  }
];

const errorRoute = [
  {
    component: () => <Redirect to={ConstantList.ROOT_PATH + "dashboard/developing"} />
  }
];

const routes = [
  ...homeRoutes,
  ...sessionRoutes,
  ...MailLogRoutes,
  ...SmsLogRoutes,
  ...ResultByDay,
  ...ResultByMonth,
  ...ResultEID,
  ...PatientResultHIV,
  ...ResultSms,
  ...SmsLog,
  ...PatientResultEID,
  ...dashboardRoutes,
  ...administrativeUnitRoutes,
  ...fiscalYearRoutes,
  ...departmentRoutes,
  ...pageLayoutRoutes,
  ...UserRoutes,
  ...appConfigRoutes,
  ...PatientRoutes,
  ...roleRoutes,
  ...MenuRoutes,
  ...TestMethod,
  ...HealthOrgRoutes,
  ...Reagent,
  ...reagentCodeRoutes,
  ...internalTestRoutes,
  ...Result,
  ...SpecimenRouter,
  ...ChildrenSpecimenRouter,
  ...SpecimenOver18mEID,
  ...SpecimenType,
  ...ShippingCard,
  ...ExamineRequestRouter,
  ...SampleListRouter,
  ...TestMachineRouters,
  ...ShippingCardChildrenRoutes,
  ...ViralLoadStatisticsRoutes,
  ...errorRoute
];

export default routes;

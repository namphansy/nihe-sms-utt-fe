import { EgretLoadable } from "egret";
import ConstantList from "../../appConfig";
import { useTranslation, withTranslation, Trans } from 'react-i18next';
const SmsLog = EgretLoadable({
  loader: () => import("./SmsLog")
});
const ViewComponent = withTranslation()(SmsLog);

const SmsLogRoutes = [
  {
    path:  ConstantList.ROOT_PATH+"dashboard/sms-log",
    exact: true,
    component: ViewComponent
  }
];

export default SmsLogRoutes;
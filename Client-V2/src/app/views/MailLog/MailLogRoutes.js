import { EgretLoadable } from "egret";
import ConstantList from "../../appConfig";
import { useTranslation, withTranslation, Trans } from 'react-i18next';
const MailLog = EgretLoadable({
  loader: () => import("./MailLog")
});
const ViewComponent = withTranslation()(MailLog);

const MailLogRoutes = [
  {
    path:  ConstantList.ROOT_PATH+"dashboard/mail-log",
    exact: true,
    component: ViewComponent
  }
];

export default MailLogRoutes;
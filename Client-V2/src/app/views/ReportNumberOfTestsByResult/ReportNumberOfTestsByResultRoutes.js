import { EgretLoadable } from "egret";
import ConstantList from "../../appConfig";
import { useTranslation, withTranslation, Trans } from 'react-i18next';
const ReportNumberOfTestsByResult = EgretLoadable({
  loader: () => import("./ReportNumberOfTestsByResult")
});
const ViewComponent = withTranslation()(ReportNumberOfTestsByResult);

const ReportNumberOfTestsByResultRoutes = [
  {
    path:  ConstantList.ROOT_PATH+"report/numberOfTestsByResult",
    exact: true,
    component: ViewComponent
  }
];

export default ReportNumberOfTestsByResultRoutes;

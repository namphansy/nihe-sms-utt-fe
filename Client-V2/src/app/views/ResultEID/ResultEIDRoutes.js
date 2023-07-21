import { EgretLoadable } from "egret";
import ConstantList from "../../appConfig";
import { useTranslation, withTranslation, Trans } from 'react-i18next';
const Result = EgretLoadable({
  loader: () => import("./ResultEID")
});
const ViewComponent = withTranslation()(Result);

const ResultRoutes = [
  {
    path:  ConstantList.ROOT_PATH + "resultEID",
    exact: true,
    component: ViewComponent
  }
];

export default ResultRoutes;

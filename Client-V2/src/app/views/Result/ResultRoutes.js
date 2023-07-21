import { EgretLoadable } from "egret";
import ConstantList from "../../appConfig";
import { useTranslation, withTranslation, Trans } from 'react-i18next';
const Result = EgretLoadable({
  loader: () => import("./Result")
});
const ViewComponent = withTranslation()(Result);

const ResultRoutes = [
  {
    path:  ConstantList.ROOT_PATH+"result",
    exact: true,
    component: ViewComponent
  }
];

export default ResultRoutes;

import { EgretLoadable } from "egret";
import ConstantList from "../../appConfig";
import { useTranslation, withTranslation, Trans } from 'react-i18next';
const appConfig = EgretLoadable({
  loader: () => import("./appConfig")
});
const ViewComponent = withTranslation()(appConfig);

const appConfigRoutes = [
  {
    path:  ConstantList.ROOT_PATH + "manager/appConfig",
    exact: true,
    component: ViewComponent
  }
];

export default appConfigRoutes;
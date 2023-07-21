import { EgretLoadable } from "egret";
import ConstantList from "../../appConfig";
import { useTranslation, withTranslation, Trans } from 'react-i18next';
const Reagent = EgretLoadable({
  //loader: () => import("./BsTableExample")
  loader: () => import("./Reagent")
  //loader: () => import("./AdazzleTable")
  //loader: () => import("./React15TabulatorSample")
});
const ViewComponent = withTranslation()(Reagent);

const reagentRoutes = [
  {
    path:  ConstantList.ROOT_PATH+"reagent",
    exact: true,
    component: ViewComponent
  }
];

export default reagentRoutes;

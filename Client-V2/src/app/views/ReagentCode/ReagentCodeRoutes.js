import { EgretLoadable } from "egret";
import ConstantList from "../../appConfig";
import { useTranslation, withTranslation, Trans } from 'react-i18next';
const ReagentCode = EgretLoadable({
  //loader: () => import("./BsTableExample")
  loader: () => import("./ReagentCode")
  //loader: () => import("./AdazzleTable")
  //loader: () => import("./React15TabulatorSample")
});
const ViewComponent = withTranslation()(ReagentCode);

const reagentCodeRoutes = [
  {
    path:  ConstantList.ROOT_PATH + "reagent-code",
    exact: true,
    component: ViewComponent
  }
];

export default reagentCodeRoutes;

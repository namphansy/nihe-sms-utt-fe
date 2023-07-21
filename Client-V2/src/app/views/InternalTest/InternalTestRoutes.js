import { EgretLoadable } from "egret";
import ConstantList from "../../appConfig";
import { useTranslation, withTranslation, Trans } from 'react-i18next';
const InternalTest = EgretLoadable({
  //loader: () => import("./BsTableExample")
  loader: () => import("./InternalTest")
  //loader: () => import("./AdazzleTable")
  //loader: () => import("./React15TabulatorSample")
});
const ViewComponent = withTranslation()(InternalTest);

const internalTestRoutes = [
  {
    path:  ConstantList.ROOT_PATH + "internal-test",
    exact: true,
    component: ViewComponent
  }
];

export default internalTestRoutes;

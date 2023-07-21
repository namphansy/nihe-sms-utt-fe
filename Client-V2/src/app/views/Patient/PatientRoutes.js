import { EgretLoadable } from "egret";
import ConstantList from "../../appConfig";
import { useTranslation, withTranslation, Trans } from 'react-i18next';
const Patient = EgretLoadable({
  loader: () => import("./Patient")
});
const ViewComponent = withTranslation()(Patient);

const HivPatientRoutes = [
  {
    path:  ConstantList.ROOT_PATH+"patient",
    exact: true,
    component: ViewComponent
  }
];

export default HivPatientRoutes;

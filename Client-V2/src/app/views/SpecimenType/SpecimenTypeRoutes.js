import { EgretLoadable } from "egret";
import ConstantList from "../../appConfig";
import { useTranslation, withTranslation, Trans } from 'react-i18next';
const SpecimenType = EgretLoadable({
  loader: () => import("./SpecimenType")
});
const ViewComponent = withTranslation()(SpecimenType);

const SpecimenTypeRoutes = [
  {
    path:  ConstantList.ROOT_PATH+"specimen-type",
    exact: true,
    component: ViewComponent
  }
];

export default SpecimenTypeRoutes;

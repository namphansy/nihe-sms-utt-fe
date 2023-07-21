import { EgretLoadable } from "egret";
import ConstantList from "../../appConfig";
import { useTranslation, withTranslation, Trans } from 'react-i18next';
const Specimen = EgretLoadable({
  loader: () => import("./Specimen")
});
const ViewComponent = withTranslation()(Specimen);

const SpecimenRoutes = [
  {
    path:  ConstantList.ROOT_PATH+"specimen",
    exact: true,
    component: ViewComponent
  }
];

export default SpecimenRoutes;

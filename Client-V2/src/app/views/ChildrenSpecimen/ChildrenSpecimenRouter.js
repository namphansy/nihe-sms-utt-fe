import { EgretLoadable } from "egret";
import ConstantList from "../../appConfig";
import { useTranslation, withTranslation, Trans } from 'react-i18next';
const ChildrenSpecimen = EgretLoadable({
  loader: () => import("./ChildrenSpecimen")
});
const ViewComponent = withTranslation()(ChildrenSpecimen);

const ChildrenSpecimenRoutes = [
  {
    path:  ConstantList.ROOT_PATH+"children_specimen",
    exact: true,
    component: ViewComponent
  }
];

export default ChildrenSpecimenRoutes;

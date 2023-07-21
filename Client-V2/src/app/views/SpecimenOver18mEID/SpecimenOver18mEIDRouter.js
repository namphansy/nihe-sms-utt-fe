import { EgretLoadable } from "egret";
import ConstantList from "../../appConfig";
import { useTranslation, withTranslation, Trans } from 'react-i18next';
const SpecimenOver18mEID = EgretLoadable({
  loader: () => import("./SpecimenOver18mEID")
});
const ViewComponent = withTranslation()(SpecimenOver18mEID);

const SpecimenOver18mEIDRoutes = [
  {
    path:  ConstantList.ROOT_PATH + "specimen-over18meid",
    exact: true,
    component: ViewComponent
  }
];

export default SpecimenOver18mEIDRoutes;

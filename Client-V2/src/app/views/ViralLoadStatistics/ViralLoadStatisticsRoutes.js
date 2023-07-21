import { EgretLoadable } from "egret";
import ConstantList from "../../appConfig";
import { useTranslation, withTranslation, Trans } from 'react-i18next';
const ViralLoadStatistics = EgretLoadable({
  loader: () => import("./ViralLoadStatistics")
});
const ViewComponent = withTranslation()(ViralLoadStatistics);

const ViralLoadStatisticsRoutes = [
  {
    path:  ConstantList.ROOT_PATH+"viral_load_statistics",
    exact: true,
    component: ViewComponent
  }
];

export default ViralLoadStatisticsRoutes;

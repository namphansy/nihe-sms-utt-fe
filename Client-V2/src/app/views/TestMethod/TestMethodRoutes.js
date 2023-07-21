import { EgretLoadable } from "egret";
import ConstantList from "../../appConfig";
import { useTranslation, withTranslation, Trans } from 'react-i18next';
const TestMethod = EgretLoadable({
  loader: () => import("./TestMethod")
});
const ViewComponent = withTranslation()(TestMethod);

const TestMethodRoutes = [
  {
    path:  ConstantList.ROOT_PATH+"test-method",
    exact: true,
    component: ViewComponent
  }
];

export default TestMethodRoutes;

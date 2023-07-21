import { EgretLoadable } from "egret";
import ConstantList from "../../appConfig";
import { useTranslation, withTranslation, Trans } from 'react-i18next';
const TestMachine = EgretLoadable({
  loader: () => import("./TestMachine")
});
const ViewComponent = withTranslation()(TestMachine);

const TestMachineRoutes = [
  {
    path:  ConstantList.ROOT_PATH+"test_machine",
    exact: true,
    component: ViewComponent
  }
];

export default TestMachineRoutes;
import { EgretLoadable } from "egret";
import ConstantList from "../../appConfig";
import { useTranslation, withTranslation, Trans } from 'react-i18next';
const ViralLoad = EgretLoadable({
    loader: () => import("./ViralLoad/ViralLoad")
});
const ViewComponent = withTranslation()(ViralLoad);

const Eid = EgretLoadable({
    loader: () => import("./EID/EID")
});
const ViewEidComponent = withTranslation()(Eid);

const SampleListRouter = [
    {
        path: ConstantList.ROOT_PATH + "sample_list/viral_load",
        exact: true,
        component: ViewComponent
    },
    {
        path: ConstantList.ROOT_PATH + "sample_list/eid",
        exact: true,
        component: ViewEidComponent
    }
];

export default SampleListRouter;

import { EgretLoadable } from "egret";
import ConstantList from "../../appConfig";
import { useTranslation, withTranslation, Trans } from 'react-i18next';
const Adults = EgretLoadable({
    loader: () => import("./Adults/Adults")
});
const ViewComponent = withTranslation()(Adults);

const ExamineRequestRouter = [
    {
        path: ConstantList.ROOT_PATH + "examine_request_adults",
        exact: true,
        component: ViewComponent
    },
    {
        path: ConstantList.ROOT_PATH + "examine_request_under_18_months",
        exact: true,
        component: ViewComponent
    }
];

export default ExamineRequestRouter;

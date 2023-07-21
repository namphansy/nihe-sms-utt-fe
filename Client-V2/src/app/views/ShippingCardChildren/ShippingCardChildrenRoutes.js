import { EgretLoadable } from "egret";
import ConstantList from "../../appConfig";
import { useTranslation, withTranslation, Trans } from 'react-i18next';
const ShippingCard = EgretLoadable({
  loader: () => import("./ShippingCardChildren")
});
const ViewComponent = withTranslation()(ShippingCard);

const ShippingCardChildrenRoutes = [
  {
    path:  ConstantList.ROOT_PATH+"shipping-card-children",
    exact: true,
    component: ViewComponent
  }
];

export default ShippingCardChildrenRoutes;

import { EgretLoadable } from "egret";
import ConstantList from "../../appConfig";
import { useTranslation, withTranslation, Trans } from 'react-i18next';
const ShippingCard = EgretLoadable({
  loader: () => import("./ShippingCard")
});
const ViewComponent = withTranslation()(ShippingCard);

const ShippingCardRoutes = [
  {
    path:  ConstantList.ROOT_PATH+"shipping-card",
    exact: true,
    component: ViewComponent
  }
];

export default ShippingCardRoutes;

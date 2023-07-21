import { EgretLoadable } from "egret";
import ConstantList from "../../appConfig";
import Developing from "./Developing"
const settings = {
    activeLayout: "layout1",
    layout1Settings: {
      topbar: {
        show: false
      },
      leftSidebar: {
        show: false,
        mode: "close"
      }
    },
    layout2Settings: {
      mode: "full",
      topbar: {
        show: false
      },
      navbar: { show: false }
    },
    secondarySidebar: { show: false },
    footer: { show: false }
  };
const DevelopingRoutes = [
  {
    path:  ConstantList.ROOT_PATH+"dashboard/developing",
    component: Developing,
    settings
  }
];

export default DevelopingRoutes;

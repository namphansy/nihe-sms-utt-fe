import React, { Component } from "react";
import { connect } from "react-redux";
import { PropTypes } from "prop-types";
import { setLayoutSettings } from "app/redux/actions/LayoutActions";
import { withStyles } from "@material-ui/core";
import Scrollbar from "react-perfect-scrollbar";
import { isMdScreen, classList } from "utils";
import { renderRoutes } from "react-router-config";
import Layout1Topbar from "./Layout1Topbar";
import Layout1Sidenav from "./Layout1Sidenav";
import Footer from "../SharedCompoents/Footer";
import SecondarySidebar from "../SharedCompoents/SecondarySidebar";
import AppContext from "app/appContext";
import { useTranslation, withTranslation, Trans } from 'react-i18next';
import LoadingOverlay from "react-loading-overlay";
import {EgretLoadable} from "egret";

// const SecondarySidebar = EgretLoadable({
//   loader: () => import("../SharedCompoents/SecondarySidebar")
// });

// const Footer = EgretLoadable({
//   loader: () => import("../SharedCompoents/Footer")
// });

// const Layout1Topbar = EgretLoadable({
//   loader: () => import("./Layout1Topbar")
// });

// const Layout1Sidenav = EgretLoadable({
//   loader: () => import("./Layout1Sidenav")
// });
const ViewLayout1Sidenav = withTranslation()(Layout1Sidenav);
const ViewLayout1Topbar = withTranslation()(Layout1Topbar);
const styles = theme => {
  return {
    layout: {
      backgroundColor: theme.palette.background.default
    }
  };
};

class Layout1 extends Component {
  state = { isAllLoading: false };
  componentWillMount() {
    if (isMdScreen()) {
      this.updateSidebarMode({ mode: "close" });
    }
    // if (window) {
    //   // SET DIRECTION
    //   let { settings } = this.props;
    //   document.body.setAttribute("dir", settings.direction);
    // }
  }

  componentWillUnmount() {
    // if (window) {
    //   document.body.removeAttribute("dir");
    // }
  }

  updateSidebarMode = sidebarSettings => {
    let { settings, setLayoutSettings } = this.props;
    setLayoutSettings({
      ...settings,
      layout1Settings: {
        ...settings.layout1Settings,
        leftSidebar: {
          ...settings.layout1Settings.leftSidebar,
          ...sidebarSettings
        }
      }
    });
  };

  enableDisableAllLoading = isAllLoading => {
    this.setState({
      isAllLoading: isAllLoading
    });
  };


  render() {
    let { settings, classes, theme } = this.props;
    let { isAllLoading } = this.state;
    let { layout1Settings } = settings;
    // let layoutClasses = {
    //   [classes.layout]: true,
    //   [`${settings.activeLayout} sidenav-${layout1Settings.leftSidebar.mode} theme-${theme.palette.type} flex`]: true,
    //   "topbar-fixed": layout1Settings.topbar.fixed
    // };
    let layoutClasses = {
      [classes.layout]: true,
      [`${settings.activeLayout} sidenav-${layout1Settings.leftSidebar.mode}`]: true,
      "topbar-fixed": layout1Settings.topbar.fixed
    };
    return (
      <AppContext.Consumer>
        {({ routes }) => (
          <div className={classList(layoutClasses)}>
            <LoadingOverlay
              active={isAllLoading}
              spinner
              text='Đang xử lý...'
              className={"zindex-1000 " + (isAllLoading ? "isLoading" : "")}
            >
            </LoadingOverlay>
            {layout1Settings.leftSidebar.show && <ViewLayout1Sidenav />}

            <div className="content-wrap position-relative">
              {layout1Settings.topbar.show && layout1Settings.topbar.fixed && (
                // <Layout1Topbar />
                <ViewLayout1Topbar />
              )}

              {settings.perfectScrollbar && (
                // <Scrollbar className="scrollable-content">
                //   {layout1Settings.topbar.show &&
                //     !layout1Settings.topbar.fixed && <Layout1Topbar />}
                //   <div className="content">{renderRoutes(routes)}</div>
                //   <div className="my-auto" />
                //   {settings.footer.show && !settings.footer.fixed && <Footer />}
                // </Scrollbar>
                <div className="scrollable-content">
                  {layout1Settings.topbar.show &&
                    !layout1Settings.topbar.fixed && <Layout1Topbar />}
                  <div className="content">{renderRoutes(routes, { enableDisableAllLoading: (isAllLoading) => this.enableDisableAllLoading(isAllLoading) })}</div>
                  <div className="my-auto" />
                  {settings.footer.show && !settings.footer.fixed && <Footer />}
                </div>
              )}

              {!settings.perfectScrollbar && (
                <div className="scrollable-content">
                  {layout1Settings.topbar.show &&
                    !layout1Settings.topbar.fixed && <Layout1Topbar />}
                  <div className="content">{renderRoutes(routes)}</div>
                  <div className="my-auto" />
                  {settings.footer.show && !settings.footer.fixed && <Footer />}
                </div>
              )}

              {settings.footer.show && settings.footer.fixed && <Footer />}
            </div>
            {/* {settings.secondarySidebar.show && <SecondarySidebar />} */}

          </div>
        )}
      </AppContext.Consumer>
    );
  }
}

Layout1.propTypes = {
  settings: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  setLayoutSettings: PropTypes.func.isRequired,
  settings: state.layout.settings
});

export default withStyles(styles, { withTheme: true })(
  connect(
    mapStateToProps,
    { setLayoutSettings }
  )(Layout1)
);

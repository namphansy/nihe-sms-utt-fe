import React from "react";
import ConstantList from "../../appConfig";
import { Card, Icon, Fab, withStyles, Grid } from "@material-ui/core";

const styles = theme => ({
  root: {
    background: `url("/assets/images/dots.png"),
    linear-gradient(90deg, ${theme.palette.primary.main} -19.83%, ${theme.palette.primary.light} 189.85%)`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "100%"
  }
});

const numberStyle = { fontSize: "40px" };//, fontFamily: "Arial",  width: "100%"

const titleStyle = { fontSize: "20px" };// fontFamily: "Arial" 

const DashboardWelcomeCard = ({ classes, analytics, t, data }) => {
  return (
    <Grid container spacing={3}>
      <Grid item lg={3} md={3} sm={6} xs={12}>
        <a href={ConstantList.ROOT_PATH + "patient"}>
          <Card
            elevation={3}
            className={`py-16 text-center h-100 w-100 ${classes.root}`}
          >
            <div className="font-weight-300 flex flex-center">
              <div className="text-white margin-auto" style={{ width: "100%" }}>
                <div style={numberStyle}>
                  {/* <b>{data.numberOfEQARound.toLocaleString("en-US")}</b> */}
                </div>
                <p className="m-0" style={titleStyle}>
                  <b>{t("patient.titleHIV")}</b>
                </p>
              </div>
            </div>
          </Card>
        </a>
      </Grid>
      <Grid item lg={3} md={3} sm={6} xs={12}>
        <a href={ConstantList.ROOT_PATH + "specimen"}>
          <Card
            elevation={3}
            className={`py-16 text-center h-100 w-100 ${classes.root}`}
          >
            <div className="font-weight-300 flex flex-center">
              <div className="text-white margin-auto" style={{ width: "100%" }}>
                <div style={numberStyle}>
                </div>
                <p className="m-0" style={titleStyle}>
                  <b>{t("Dashboard.testManagement.specimen")}</b>
                </p>
              </div>
            </div>

          </Card>
        </a>
      </Grid>
      <Grid item lg={3} md={3} sm={6} xs={12}>
        <a href={ConstantList.ROOT_PATH + "children_specimen"}>
          <Card
            elevation={3}
            className={`py-16 text-center h-100 w-100 ${classes.root}`}
          >
            <div className="font-weight-300 flex flex-center">
              <div className="text-white margin-auto" style={{ width: "100%" }}>
                <div style={numberStyle}>
                </div>
                <p className="m-0" style={titleStyle}>
                  <b>{t("Dashboard.testManagement.childrenSpecimen")}</b>
                </p>
              </div>
            </div>

          </Card>
        </a>
      </Grid>
      <Grid item lg={3} md={3} sm={6} xs={12}>
        <a href={ConstantList.ROOT_PATH + "shipping-card"} >
          <Card
            elevation={3}
            className={`py-16 text-center h-100 w-100 ${classes.root}`}
          >

            <div className="font-weight-300 flex flex-center">
              <div className="text-white margin-auto" style={{ width: "100%" }}>
                <div style={numberStyle}>
                  {/* <b>{data.numberOfHealthOrgEQARound.toLocaleString("en-US")}</b> */}
                </div>
                <p className="m-0" style={titleStyle}>
                  <b>{t("Dashboard.shippingSpecimenList.hivViralLoad")}</b>
                </p>
              </div>
            </div>
          </Card>
        </a>
      </Grid>
    </Grid>
  );
};

export default withStyles(styles, { withTheme: true })(DashboardWelcomeCard);

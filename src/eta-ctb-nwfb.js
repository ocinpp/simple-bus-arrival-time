import moment from "moment";
import _ from "lodash";
import { CTB_NWFB_STOPS } from "./ctb-nwfb";

const COMPANY_IDS = ["ctb", "nwfb"];

function transformDirection(d) {
  switch (d) {
    case "I":
      return "inbound";
    case "O":
      return "outbound";
    default:
      // return unchanged value
      return d;
  }
}

const etaCtbNwfb = {
  async getRoutes() {
    let res = [];

    for (const companyId of COMPANY_IDS) {
      // default is OUTBOUND
      const url = `https://rt.data.gov.hk/v1.1/transport/citybus-nwfb/route/${companyId}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data["generated_timestamp"]);

        // add routeId by combining
        // route.route + '|' + [bound]
        res.push(
          ...data.data.flatMap((route) => {
            return [
              {
                ...route,
                routeId: route.route + "|" + "O",
              },
              {
                co: route.co,
                route: route.route,
                orig_tc: route.dest_tc,
                orig_en: route.dest_en,
                orig_sc: route.dest_sc,
                dest_tc: route.orig_tc,
                dest_en: route.orig_en,
                dest_sc: route.orig_sc,
                data_timestamp: route.data_timestamp,
                routeId: route.route + "|" + "I",
              },
            ];
          })
        );
      } catch (error) {
        console.error(error);
        throw error;
      }
    }

    return res;
  },

  getStops() {
    return CTB_NWFB_STOPS;
  },

  async getRoute(route, dir, serviceType) {
    let res = [];

    for (const companyId of COMPANY_IDS) {
      const url = `https://rt.data.gov.hk/v1.1/transport/citybus-nwfb/route/${companyId}/${route}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data["generated_timestamp"]);
        if (!_.isEmpty(data.data)) {
          res = data.data;
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    }

    return res;
  },

  async getRouteStops(route, dir, serviceType) {
    let res = [];
    const allStops = this.getStops();

    for (const companyId of COMPANY_IDS) {
      const url = `https://rt.data.gov.hk/v1.1/transport/citybus-nwfb/route-stop/${companyId}/${route}/${transformDirection(
        dir
      )}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data["generated_timestamp"]);
        const routeStops = data.data;

        res.push(
          ...routeStops.map((s) => {
            const stopName = allStops.find((stop) => stop.stop === s.stop);
            return {
              ...s,
              name_en: stopName?.name_en,
              name_tc: stopName?.name_tc,
              name_sc: stopName?.name_sc,
            };
          })
        );
      } catch (error) {
        console.error(error);
        throw error;
      }
    }

    return res;
  },

  async getStop(busStop) {
    let res = null;
    const url = `https://rt.data.gov.hk/v1.1/transport/citybus-nwfb/stop/${busStop}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log(data["generated_timestamp"]);
      res = data.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
    return res;
  },

  async getEtas(busStop, route, dir, serviceType, lang) {
    let res = [];

    for (const companyId of COMPANY_IDS) {
      const url = `https://rt.data.gov.hk/v1.1/transport/citybus-nwfb/eta/${companyId}/${busStop}/${route}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data["generated_timestamp"]);
        const etas = data.data;
        res.push(
          ...etas.filter(
            (o) =>
              o.route === route &&
              dir.toUpperCase().startsWith(o.dir.toUpperCase()) &&
              !!o.eta
          )
        );
      } catch (error) {
        console.error(error);
        throw error;
      }
    }

    return res;
  },

  async getEtaDisplay(busStop, route, dir, serviceType, lang) {
    const etas = await this.getEtas(busStop, route, dir, serviceType, lang);
    for (const eta of etas) {
      // format the eta time
      if (!!eta.eta) {
        eta.etaStr = moment(eta.eta).format("H:mm:ss");
        const minutesDiff = moment(eta.eta).diff(moment(), "m");
        eta.fromNow =
          minutesDiff > 1 ? minutesDiff + " mins" : "less than 1 min";
      }
    }

    return etas;
  },
};

// Export the object
export default etaCtbNwfb;

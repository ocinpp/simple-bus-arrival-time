import moment from "moment";
import { NLB_STOPS } from "./nlb";

const etaNlb = {
  async getRoutes() {
    return [];
  },

  async getStops() {
    return [];
  },

  async getRoute(route, dir, serviceType) {
    let res = null;

    // get API URL
    const url = `https://rt.data.gov.hk/v2/transport/nlb/route.php?action=list`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      // filter from a full list of routes
      const routeInfo = data.routes.find((r) => r.routeId === route);

      if (routeInfo === null) {
        return null;
      }

      // convert data to KMB style
      // KMB: {"route":"1","bound":"I","service_type":"1","orig_en":"STAR FERRY","orig_tc":"尖沙咀碼頭","orig_sc":"尖沙咀码头","dest_en":"CHUK YUEN ESTATE","dest_tc":"竹園邨","dest_sc":"竹园邨"}

      res = {
        route: routeInfo.routeNo,
        bound: "",
        service_type: "",
        orig_en: routeInfo.routeName_e.split(">")[0]?.trim(),
        orig_tc: routeInfo.routeName_c.split(">")[0]?.trim(),
        orig_sc: routeInfo.routeName_s.split(">")[0]?.trim(),
        dest_en: routeInfo.routeName_e.split(">")[1]?.trim(),
        dest_tc: routeInfo.routeName_c.split(">")[1]?.trim(),
        dest_sc: routeInfo.routeName_s.split(">")[1]?.trim(),
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
    return res;
  },

  // busStop is stopId
  async getStop(busStop) {
    // convert data to KMB style
    // KMB: {"stop":"18492910339410B1","name_en":"CHUK YUEN ESTATE BUS TERMINUS","name_tc":"竹園邨總站","name_sc":"竹园邨总站","lat":"22.345415","long":"114.192640"}

    const stop = NLB_STOPS.find((s) => s.stopId == busStop);

    if (stop === null) {
      return null;
    } else {
      return {
        stop: stop.stopId,
        name_en: stop.stopName_e,
        name_tc: stop.stopName_c,
        name_sc: stop.stopName_s,
        lat: stop.latitude,
        long: stop.longitude,
      };
    }
  },

  async getRouteStops() {
    return [];
  },

  async getEtas(busStop, route, dir, serviceType, lang) {
    let res = [];
    const url = `https://rt.data.gov.hk/v2/transport/nlb/stop.php?action=estimatedArrivals&routeId=${route}&stopId=${busStop}&language=en`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const etas = data.estimatedArrivals;

      if (etas === null) {
        return [];
      }

      // convert data to KMB style
      // KMB: {"co":"KMB","route":"281A","dir":"O","service_type":1,"seq":23,"dest_tc":"九龍站","dest_sc":"九龙站","dest_en":"KOWLOON STATION","eta_seq":1,"eta":"2023-04-05T23:12:56+08:00","rmk_tc":"","rmk_sc":"","rmk_en":"","data_timestamp":"2023-04-05T23:04:12+08:00"}

      res = etas.map((e, index) => {
        return {
          co: "NLB",
          route: route,
          dir: "",
          service_type: "",
          seq: "",
          dest_tc: "",
          dest_sc: "",
          dest_en: "",
          eta_seq: index,
          eta: e.estimatedArrivalTime,
          rmk_tc: "",
          rmk_sc: "",
          rmk_en: "",
          data_timestamp: e.generateTime,
        };
      });
    } catch (error) {
      console.error(error);
      throw error;
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
export default etaNlb;

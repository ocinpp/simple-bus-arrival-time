import moment from "moment";

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

const etaKmb = {
  async getRoutes() {
    let res = null;
    const url = `https://data.etabus.gov.hk/v1/transport/kmb/route/`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log(data["generated_timestamp"]);
      // add routeId by combining
      // route.route + '|' + route.bound + '|' + route.service_type
      res = data.data.map((route) => {
        return {
          ...route,
          routeId: route.route + "|" + route.bound + "|" + route.service_type,
        };
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
    return res;
  },

  async getStops() {
    let res = null;
    const url = `https://data.etabus.gov.hk/v1/transport/kmb/stop/`;

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

  async getRoute(route, dir, serviceType) {
    let res = null;
    const url = `https://data.etabus.gov.hk/v1/transport/kmb/route/${route}/${transformDirection(
      dir
    )}/${serviceType}`;

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

  async getRouteStops(route, dir, serviceType) {
    let res = null;
    const allStops = await this.getStops();

    const url = `https://data.etabus.gov.hk/v1/transport/kmb/route-stop/${route}/${transformDirection(
      dir
    )}/${serviceType}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log(data["generated_timestamp"]);
      const routeStops = data.data;

      res = routeStops.map((s) => {
        const stopName = allStops.find((stop) => stop.stop === s.stop);
        return {
          ...s,
          name_en: stopName.name_en,
          name_tc: stopName.name_tc,
          name_sc: stopName.name_sc,
        };
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
    return res;
  },

  async getStop(busStop) {
    let res = null;
    const url = `https://data.etabus.gov.hk/v1/transport/kmb/stop/${busStop}`;

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
    const url = `https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/${busStop}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log(data["generated_timestamp"]);
      res = data.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
    return res.filter(
      (o) =>
        o.route === route &&
        dir.toUpperCase().startsWith(o.dir.toUpperCase()) &&
        serviceType === o.service_type + "" &&
        !!o.eta
    );
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
export default etaKmb;

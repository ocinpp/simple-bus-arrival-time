import moment from "moment";

const etaKmb = {
  async getRoutes() {
    let res = null;
    const url = `https://data.etabus.gov.hk/v1/transport/kmb/route/`;

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
    const url = `https://data.etabus.gov.hk/v1/transport/kmb/route/${route}/${dir}/${serviceType}`;

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
    const url = `https://data.etabus.gov.hk/v1/transport/kmb/route-stop/${route}/${dir}/${serviceType}`;

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

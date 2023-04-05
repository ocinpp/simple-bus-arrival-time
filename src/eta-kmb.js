import moment from "moment";

const etaKmb = {
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
    console.log(res);
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

  async getEtas(busStop, route, dir, lang) {
    let res = [];
    const url = `https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/${busStop}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log(data["generated_timestamp"]);
      res = data.data;
      console.log(res);
    } catch (error) {
      console.error(error);
      throw error;
    }
    return res.filter(
      (o) =>
        o.route === route &&
        dir.toUpperCase().startsWith(o.dir.toUpperCase()) &&
        !!o.eta
    );
  },

  async getEtaDisplay(busStop, route, dir, lang) {
    const etas = await this.getEtas(busStop, route, dir, lang);
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

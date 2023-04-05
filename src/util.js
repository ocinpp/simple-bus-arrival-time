import moment from "moment";

// extract bus number at start so that the suffix is removed
export function extractNumber(route) {
  const num = route.replace(/[^0-9]/g, "");
  return parseInt(num != null ? num : route);
}

export async function getRoute(company, route, dir, serviceType) {
  let res = null;
  try {
    const response = await fetch(
      `https://data.etabus.gov.hk/v1/transport/kmb/route/${route}/${dir}/${serviceType}`
    );
    const data = await response.json();
    console.log(data["generated_timestamp"]);
    res = data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
  return res;
}

export async function getStop(company, busStop) {
  let res = null;
  try {
    const response = await fetch(
      `https://data.etabus.gov.hk/v1/transport/kmb/stop/${busStop}`
    );
    const data = await response.json();
    console.log(data["generated_timestamp"]);
    res = data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
  return res;
}

async function getEtas(company, busStop, route, dir, lang) {
  let res = [];
  try {
    const response = await fetch(
      `https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/${busStop}`
    );
    const data = await response.json();
    console.log(data["generated_timestamp"]);
    res = data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
  return res.filter(
    (o) => o.route === route && dir.toUpperCase().startsWith(o.dir)
  );
}

export async function getEtaDisplay(company, busStop, route, dir, lang) {
  const etas = await getEtas(company, busStop, route, dir, lang);
  for (const eta of etas) {
    // format the eta time
    if (eta.eta != "") {
      eta.etaStr = moment(eta.eta).format("H:mm:ss");
      const minutesDiff = moment(eta.eta).diff(moment(), "m");
      eta.fromNow = minutesDiff > 1 ? minutesDiff + " mins" : "less than 1 min";
    }
  }

  return etas;
}

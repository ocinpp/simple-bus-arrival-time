import etaKmb from "./eta-kmb";
import etaCtbNwfb from "./eta-ctb-nwfb";
import etaNlb from "./eta-nlb";

export function getEtaByCompany(company) {
  if (company === "KMB") {
    return etaKmb;
  } else if (company === "CTB_NWFB") {
    return etaCtbNwfb;
  } else if (company === "NLB") {
    return etaNlb;
  } else {
    console.error("Not supported!");
  }
}

// extract bus number at start so that the suffix is removed
export function extractNumber(route) {
  const num = route.replace(/[^0-9]/g, "");
  return parseInt(num != null ? num : route);
}

export function readSettingsFromStorage() {
  try {
    const settingsStr = localStorage.getItem("settings");
    if (settingsStr) {
      return JSON.parse(settingsStr);
    } else {
      return null;
    }
  } catch (error) {
    alert("Cannot read settings information!");
  }
}

import etaKmb from "./eta-kmb";
import etaCtbNwfb from "./eta-ctb-nwfb";
import etaNlb from "./eta-nlb";
import type { CompanyCode, EtaService, Settings } from "./types";

export function getEtaByCompany(company: CompanyCode): EtaService {
    switch (company) {
        case "KMB":
            return etaKmb;
        case "CTB_NWFB":
            return etaCtbNwfb;
        case "NLB":
            return etaNlb;
        default:
            throw new Error(`Unsupported company: ${company}`);
    }
}

export function extractNumber(route: string): number {
    const num = route.replace(/[^0-9]/g, "");
    return parseInt(num || route);
}

export function readSettingsFromStorage(): Settings | null {
    try {
        const settingsStr = localStorage.getItem("settings");
        if (settingsStr) {
            return JSON.parse(settingsStr) as Settings;
        }
        return null;
    } catch (error) {
        console.error("Cannot read settings information!", error);
        return null;
    }
}

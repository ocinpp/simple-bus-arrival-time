import { NLB_STOPS } from "./nlb";
import type { EtaInfo, EtaService, NlbStop, RouteInfo, StopInfo } from "./types";
import { fetchJson, formatEtaDisplay } from "./api-utils";

const etaNlb: EtaService = {
    async getRoutes(): Promise<RouteInfo[]> {
        const data = await fetchJson(`https://rt.data.gov.hk/v2/transport/nlb/route.php?action=list`);
        return (data.routes as Record<string, string>[]).map((routeInfo) => ({
            routeId: routeInfo.routeId,
            route: routeInfo.routeNo,
            bound: "",
            service_type: "",
            orig_en: routeInfo.routeName_e.split(">")[0]?.trim(),
            orig_tc: routeInfo.routeName_c.split(">")[0]?.trim(),
            orig_sc: routeInfo.routeName_s.split(">")[0]?.trim(),
            dest_en: routeInfo.routeName_e.split(">")[1]?.trim(),
            dest_tc: routeInfo.routeName_c.split(">")[1]?.trim(),
            dest_sc: routeInfo.routeName_s.split(">")[1]?.trim(),
        }));
    },

    async getStops(): Promise<StopInfo[]> {
        return NLB_STOPS.map((stop: NlbStop) => {
            return {
                stop: stop.stopId,
                name_en: stop.stopName_e,
                name_tc: stop.stopName_c,
                name_sc: stop.stopName_s,
                lat: stop.latitude,
                long: stop.longitude,
            };
        });
    },

    async getRoute(route: string, _dir: string, _serviceType: string): Promise<RouteInfo | null> {
        const data = await fetchJson(`https://rt.data.gov.hk/v2/transport/nlb/route.php?action=list`);
        const routeInfo = (data.routes as Record<string, string>[]).find((r) => r.routeId === route);

        if (!routeInfo) {
            return null;
        }

        return {
            routeId: routeInfo.routeId,
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
    },

    async getStop(busStop: string): Promise<StopInfo | null> {
        // convert data to KMB style
        // KMB: {"stop":"18492910339410B1","name_en":"CHUK YUEN ESTATE BUS TERMINUS","name_tc":"竹園邨總站","name_sc":"竹园邨总站","lat":"22.345415","long":"114.192640"}

        const stop = NLB_STOPS.find((s: NlbStop) => s.stopId == busStop);

        if (!stop) {
            return null;
        }
        return {
            stop: stop.stopId,
            name_en: stop.stopName_e,
            name_tc: stop.stopName_c,
            name_sc: stop.stopName_s,
            lat: stop.latitude,
            long: stop.longitude,
        };
    },

    async getRouteStops(route: string, dir: string, serviceType: string): Promise<StopInfo[]> {
        let res = null;

        // get API URL
        const data = await fetchJson(
            `https://rt.data.gov.hk/v2/transport/nlb/stop.php?action=list&routeId=${route}`
        );
        return (data.stops as Record<string, string>[]).map((stop, index) => ({
            stop: stop.stopId,
            route: stop.route,
            bound: "",
            service_type: "",
            seq: index,
            name_en: stop.stopName_e.split(">")[0]?.trim(),
            name_tc: stop.stopName_c.split(">")[0]?.trim(),
            name_sc: stop.stopName_s.split(">")[0]?.trim(),
        }));
    },

    async getEtas(busStop: string, route: string, _dir: string, _serviceType: string, _lang: string): Promise<EtaInfo[]> {
        const data = await fetchJson(
            `https://rt.data.gov.hk/v2/transport/nlb/stop.php?action=estimatedArrivals&routeId=${route}&stopId=${busStop}&language=en`
        );
        const etas = data.estimatedArrivals as Record<string, string>[] | null;

        if (!etas) {
            return [];
        }

        return etas.map((e, index) => ({
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
        }));
    },

    async getEtaDisplay(busStop: string, route: string, dir: string, serviceType: string, lang: string): Promise<EtaInfo[]> {
        const etas = await this.getEtas(busStop, route, dir, serviceType, lang);
        return formatEtaDisplay(etas);
    },
};

// Export the object
export default etaNlb;

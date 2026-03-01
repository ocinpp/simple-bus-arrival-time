import type { EtaInfo, EtaService, RouteInfo, StopInfo } from "./types";
import { fetchJson, transformDirection, formatEtaDisplay } from "./api-utils";

const etaKmb: EtaService = {
    async getRoutes(): Promise<RouteInfo[]> {
        const data = await fetchJson(`https://data.etabus.gov.hk/v1/transport/kmb/route/`);
        return (data.data as Record<string, string>[]).map((route) => ({
            ...route,
            routeId: route.route + "|" + route.bound + "|" + route.service_type,
        })) as RouteInfo[];
    },

    async getStops(): Promise<StopInfo[]> {
        const data = await fetchJson(`https://data.etabus.gov.hk/v1/transport/kmb/stop/`);
        return data.data as StopInfo[];
    },

    async getRoute(route: string, dir: string, serviceType: string): Promise<RouteInfo | null> {
        const data = await fetchJson(
            `https://data.etabus.gov.hk/v1/transport/kmb/route/${route}/${transformDirection(dir)}/${serviceType}`
        );
        return data.data as RouteInfo | null;
    },

    async getRouteStops(route: string, dir: string, serviceType: string): Promise<StopInfo[]> {
        const allStops = await this.getStops!();
        const data = await fetchJson(
            `https://data.etabus.gov.hk/v1/transport/kmb/route-stop/${route}/${transformDirection(dir)}/${serviceType}`
        );
        const routeStops = data.data as Record<string, string>[];
        return routeStops.map((s) => {
            const stopName = allStops.find((stop: StopInfo) => stop.stop === s.stop);
            return {
                ...s,
                name_en: stopName?.name_en,
                name_tc: stopName?.name_tc,
                name_sc: stopName?.name_sc,
            };
        }) as StopInfo[];
    },

    async getStop(busStop: string): Promise<StopInfo | null> {
        const data = await fetchJson(`https://data.etabus.gov.hk/v1/transport/kmb/stop/${busStop}`);
        return data.data as StopInfo | null;
    },

    async getEtas(busStop: string, route: string, dir: string, serviceType: string, _lang: string): Promise<EtaInfo[]> {
        const data = await fetchJson(`https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/${busStop}`);
        const etas = data.data as EtaInfo[];
        return etas.filter(
            (o) =>
                o.route === route &&
                dir.toUpperCase().startsWith(o.dir.toUpperCase()) &&
                serviceType === o.service_type + "" &&
                !!o.eta
        );
    },

    async getEtaDisplay(busStop: string, route: string, dir: string, serviceType: string, lang: string): Promise<EtaInfo[]> {
        const etas = await this.getEtas(busStop, route, dir, serviceType, lang);
        return formatEtaDisplay(etas);
    },
};

// Export the object
export default etaKmb;

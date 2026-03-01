import { CTB_NWFB_STOPS } from "./ctb-nwfb";
import type { EtaInfo, EtaService, RouteInfo, StopInfo } from "./types";
import { fetchJson, transformDirection, formatEtaDisplay } from "./api-utils";

const COMPANY_IDS = ["ctb", "nwfb"] as const;

async function getRouteByCompany(companyId: string, route: string, _dir: string, _serviceType: string) {
    return fetchJson(`https://rt.data.gov.hk/v1.1/transport/citybus-nwfb/route/${companyId}/${route}`);
}

async function getRoutesByCompany(companyId: string) {
    return fetchJson(`https://rt.data.gov.hk/v1.1/transport/citybus-nwfb/route/${companyId}`);
}

async function getRouteStopsByCompany(companyId: string, route: string, dir: string, _serviceType: string) {
    return fetchJson(
        `https://rt.data.gov.hk/v1.1/transport/citybus-nwfb/route-stop/${companyId}/${route}/${transformDirection(dir)}`
    );
}

async function getEtasByCompany(companyId: string, busStop: string, route: string, _dir: string, _serviceType: string, _lang: string) {
    return fetchJson(`https://rt.data.gov.hk/v1.1/transport/citybus-nwfb/eta/${companyId}/${busStop}/${route}`);
}

const etaCtbNwfb: EtaService = {
    async getRoutes(): Promise<RouteInfo[]> {
        const res: RouteInfo[] = [];
        const promises = [];

        // run in parallel
        for (const companyId of COMPANY_IDS) {
            promises.push(getRoutesByCompany(companyId));
        }

        // wait for all promises to resolve
        const values = await Promise.all(promises);

        // process returned values
        for (const value of values) {
            // add routeId by combining
            // route.route + '|' + [bound]
            res.push(
                ...value.data.flatMap((route: Record<string, string>) => {
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
        }

        return res;
    },

    getStops(): StopInfo[] {
        return CTB_NWFB_STOPS.filter((s): s is Required<typeof s> => !!s.stop) as StopInfo[];
    },

    async getRoute(route: string, dir: string, serviceType: string): Promise<RouteInfo | null> {
        let res: RouteInfo | null = null;
        const promises = [];

        // run in parallel
        for (const companyId of COMPANY_IDS) {
            promises.push(
                getRouteByCompany(companyId, route, dir, serviceType)
            );
        }

        // wait for all promises to resolve
        const values = await Promise.all(promises);

        // process returned values
        for (const value of values) {
            if (value.data && Object.keys(value.data).length > 0) {
                res =
                    dir === "O"
                        ? value.data
                        : {
                            co: value.data.co,
                            route: value.data.route,
                            orig_tc: value.data.dest_tc,
                            orig_en: value.data.dest_en,
                            orig_sc: value.data.dest_sc,
                            dest_tc: value.data.orig_tc,
                            dest_en: value.data.orig_en,
                            dest_sc: value.data.orig_sc,
                            data_timestamp: value.data.data_timestamp,
                            routeId: value.data.route + "|" + dir,
                        };
            }
        }

        return res;
    },

    async getRouteStops(route: string, dir: string, serviceType: string): Promise<StopInfo[]> {
        let res: StopInfo[] = [];
        const promises = [];
        const allStops = this.getStops!();

        // run in parallel
        for (const companyId of COMPANY_IDS) {
            promises.push(
                getRouteStopsByCompany(companyId, route, dir, serviceType)
            );
        }

        // wait for all promises to resolve
        const values = await Promise.all(promises);

        // process returned values
        for (const value of values) {
            const routeStops = value.data;
            res.push(
                ...routeStops.map((s: Record<string, string>) => {
                    const stopName = (allStops as StopInfo[]).find(
                        (stop: StopInfo) => stop.stop === s.stop
                    );
                    return {
                        ...s,
                        name_en: stopName?.name_en,
                        name_tc: stopName?.name_tc,
                        name_sc: stopName?.name_sc,
                    };
                })
            );
        }

        return res;
    },

    async getStop(busStop: string): Promise<StopInfo | null> {
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

    async getEtas(busStop: string, route: string, dir: string, serviceType: string, lang: string): Promise<EtaInfo[]> {
        let res = [];
        let promises = [];

        // run in parallel
        for (const companyId of COMPANY_IDS) {
            promises.push(
                getEtasByCompany(
                    companyId,
                    busStop,
                    route,
                    dir,
                    serviceType,
                    lang
                )
            );
        }

        // wait for all promises to resolve
        const values = await Promise.all(promises);

        // process returned values
        for (const value of values) {
            const etas = value.data;
            res.push(
                ...etas.filter(
                    (o: EtaInfo) =>
                        o.route === route &&
                        dir.toUpperCase().startsWith(o.dir.toUpperCase()) &&
                        !!o.eta
                )
            );
        }

        return res;
    },

    async getEtaDisplay(busStop: string, route: string, dir: string, serviceType: string, lang: string): Promise<EtaInfo[]> {
        const etas = await this.getEtas(busStop, route, dir, serviceType, lang);
        return formatEtaDisplay(etas);
    },
};

// Export the object
export default etaCtbNwfb;

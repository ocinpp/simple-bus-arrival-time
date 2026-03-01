export interface Settings {
  company: string;
  route: string;
  dir: string;
  serviceType: string;
  busStop: string;
}

export interface RouteInfo {
  routeId: string;
  route: string;
  bound?: string;
  service_type?: string;
  co?: string;
  orig_en?: string;
  orig_tc?: string;
  orig_sc?: string;
  dest_en?: string;
  dest_tc?: string;
  dest_sc?: string;
  data_timestamp?: string;
}

export interface StopInfo {
  stop: string;
  name_en?: string;
  name_tc?: string;
  name_sc?: string;
  lat?: string;
  long?: string;
  seq?: number;
}

export interface EtaInfo {
  co?: string;
  route: string;
  dir: string;
  service_type?: string | number;
  seq?: string | number;
  dest_tc?: string;
  dest_sc?: string;
  dest_en?: string;
  eta_seq?: number;
  eta: string;
  rmk_tc?: string;
  rmk_sc?: string;
  rmk_en?: string;
  data_timestamp?: string;
  etaStr?: string;
  fromNow?: string;
}

export interface EtaService {
  getRoutes(): Promise<RouteInfo[]>;
  getRoute(route: string, dir: string, serviceType: string): Promise<RouteInfo | null>;
  getRouteStops(route: string, dir: string, serviceType: string): Promise<StopInfo[]>;
  getStop(busStop: string): Promise<StopInfo | null> | StopInfo | StopInfo[] | null;
  getStops?(): Promise<StopInfo[]> | StopInfo[];
  getEtas(busStop: string, route: string, dir: string, serviceType: string, lang: string): Promise<EtaInfo[]>;
  getEtaDisplay(busStop: string, route: string, dir: string, serviceType: string, lang: string): Promise<EtaInfo[]>;
}

export type CompanyCode = "KMB" | "CTB_NWFB" | "NLB";

export interface CtbNwfbStop {
  stop: string;
  name_tc: string;
  name_en: string;
  lat: string;
  long: string;
  name_sc: string;
  data_timestamp: string;
}

export interface NlbStop {
  stopId: string;
  stopName_c: string;
  stopName_s: string;
  stopName_e: string;
  stopLocation_c: string;
  stopLocation_s: string;
  stopLocation_e: string;
  latitude: string;
  longitude: string;
}


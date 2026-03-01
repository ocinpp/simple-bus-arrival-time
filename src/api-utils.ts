import dayjs from "dayjs";
import type { EtaInfo } from "./types";

/**
 * Fetch JSON from a URL with standard error handling.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchJson(url: string): Promise<Record<string, any>> {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/**
 * Transform direction code to API path segment.
 * "I" → "inbound", "O" → "outbound"
 */
export function transformDirection(d: string): string {
    switch (d) {
        case "I":
            return "inbound";
        case "O":
            return "outbound";
        default:
            return d;
    }
}

/**
 * Format ETA results with human-readable time strings.
 */
export function formatEtaDisplay(etas: EtaInfo[]): EtaInfo[] {
    for (const eta of etas) {
        if (eta.eta) {
            eta.etaStr = dayjs(eta.eta).format("H:mm:ss");
            const minutesDiff = dayjs(eta.eta).diff(dayjs(), "minute");
            eta.fromNow =
                minutesDiff > 1 ? minutesDiff + " mins" : "less than 1 min";
        }
    }
    return etas;
}


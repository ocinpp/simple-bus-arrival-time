<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { getEtaByCompany, readSettingsFromStorage } from "./eta";
import type {
    Settings,
    EtaInfo,
    RouteInfo,
    StopInfo,
    CompanyCode,
} from "./types";
import StationSettings from "./components/StationSettings.vue";

const now = ref(new Date().toLocaleString());
const isLoading = ref(false);
const res = reactive<{
    route: RouteInfo | null;
    busStop: StopInfo | null;
    etas: EtaInfo[];
}>({
    route: null,
    busStop: null,
    etas: [],
});
const lang = "en";
const check = reactive({
    company: "",
    busStop: "",
    route: "",
    dir: "",
    serviceType: "",
});
const widthVariants: Record<number, string> = {
    1: "md:w-full",
    2: "md:w-1/2",
    3: "md:w-1/3",
    4: "md:w-1/4",
    5: "md:w-1/5",
    6: "md:w-1/6",
};

function readSettings() {
    const settings = readSettingsFromStorage();
    if (settings) {
        check.company = settings.company;
        check.busStop = settings.busStop;
        check.route = settings.route;
        check.dir = settings.dir;
        check.serviceType = settings.serviceType;
    }
}

async function updateRouteStopInfo() {
    if (check.company) {
        const api = getEtaByCompany(check.company as CompanyCode);
        res.route = await api.getRoute(
            check.route,
            check.dir,
            check.serviceType
        );
        const stop = await api.getStop(check.busStop);
        res.busStop = Array.isArray(stop) ? (stop[0] ?? null) : stop;
    }
}

async function updateAll() {
    const allEtas = [];

    if (check.company && check.route && check.busStop) {
        now.value = new Date().toLocaleTimeString();
        isLoading.value = true;

        try {
            const etas = await getEtaByCompany(
                check.company as CompanyCode
            ).getEtaDisplay(
                check.busStop,
                check.route,
                check.dir,
                check.serviceType,
                lang
            );
            allEtas.push(...etas);
        } catch (error) {
            console.error(error);
        }

        res.etas = allEtas;
    }

    isLoading.value = false;
}

async function updateSettings(setting: Settings) {
    check.company = setting.company;
    check.busStop = setting.busStop;
    check.route = setting.route;
    check.dir = setting.dir;
    check.serviceType = setting.serviceType;

    await updateRouteStopInfo();
    await updateAll();
}

let intervalId: ReturnType<typeof setInterval> | null = null;

readSettings();
updateRouteStopInfo();

onMounted(async () => {
    await updateRouteStopInfo();
    await updateAll();
    intervalId = setInterval(() => {
        updateAll();
    }, 30000);
});

onUnmounted(() => {
    if (intervalId) {
        clearInterval(intervalId);
    }
});
</script>

<template>
    <div v-cloak>
        <div class="bg-[var(--color-bg)] text-[var(--color-text)] p-8">
            <div class="flex flex-col h-full items-center justify-center py-8">
                <h1
                    class="text-lg md:text-4xl font-bold mb-4 w-full"
                    style="color: var(--color-primary)"
                >
                    @ {{ res.busStop?.name_en }} <br />
                    <br />
                    # {{ res.route?.route }} // {{ res.route?.orig_en }} >>>
                    {{ res.route?.dest_en }}
                </h1>

                <div
                    class="flex items-center gap-3 mb-4 w-full text-sm opacity-70"
                >
                    <span>Last updated: {{ now }}</span>
                    <button
                        class="inline-flex items-center gap-1 px-2 py-1 rounded bg-[var(--color-accent)] hover:bg-[var(--color-secondary)] text-[var(--color-text)] text-xs font-medium transition-colors"
                        :disabled="isLoading"
                        @click="updateAll()"
                    >
                        <svg
                            class="w-3 h-3"
                            :class="{ 'animate-spin': isLoading }"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        Refresh
                    </button>
                </div>

                <div
                    v-if="isLoading"
                    class="flex items-center justify-center w-full py-8"
                >
                    <svg
                        class="animate-spin h-8 w-8"
                        style="color: var(--color-primary)"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                        />
                        <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                </div>

                <div
                    v-else
                    class="flex flex-col md:flex-row md:justify-center md:items-center w-full"
                >
                    <template v-if="res.etas && res.etas.length > 0">
                        <template
                            v-for="(eta, index) in res.etas"
                            :key="index"
                        >
                            <div
                                class="flex flex-col items-center justify-center bg-[var(--color-accent)] p-4 rounded-lg md:mr-4 arrival-time"
                                :class="widthVariants[res.etas.length]"
                            >
                                <div
                                    class="flex flex-col items-center justify-center h-full"
                                >
                                    <div
                                        class="text-4xl md:text-6xl font-bold mb-2"
                                        style="color: var(--color-text)"
                                    >
                                        {{ eta.etaStr }}
                                    </div>
                                    <div
                                        class="text-lg md:text-xl font-medium"
                                        style="color: var(--color-text)"
                                    >
                                        Arriving in {{ eta.fromNow }}
                                    </div>
                                </div>
                            </div>
                        </template>
                    </template>
                    <template v-else>
                        <div
                            class="flex flex-col items-center justify-center bg-[var(--color-accent)] p-4 rounded-lg md:mr-4 arrival-time w-full"
                        >
                            <div
                                class="flex flex-col items-center justify-center h-full"
                            >
                                <div
                                    class="text-lg font-medium"
                                    style="color: var(--color-text)"
                                >
                                    No scheduled arrival at this bus stop.
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
            <StationSettings @update-settings="updateSettings" />
        </div>
    </div>
</template>

<style scoped>
@media (max-width: 768px) {
    .arrival-time {
        padding: 1rem;
        margin: 0.5rem;
    }
}
</style>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { getEtaByCompany, readSettingsFromStorage } from "../eta";
import type { CompanyCode, RouteInfo, StopInfo } from "../types";
import SearchableSelect from "./SearchableSelect.vue";

const emit = defineEmits(["updateSettings"]);

const title = "Settings";
const error = ref("");
const modalOpen = ref(false);
const loadingRoutes = ref(false);
const loadingStops = ref(false);
const selected = reactive({
    company: "",
    route: "",
    dir: "",
    serviceType: "",
    busStop: "",
});
const routeDirServiceType = ref("");
const companyList = [
    { code: "KMB", name: "Kowloon Motor Bus" },
    { code: "CTB_NWFB", name: "Citybus / New World First Bus" },
    { code: "NLB", name: "New Lantao Bus" },
];
const routeList = ref<RouteInfo[]>([]);
const stopList = ref<StopInfo[]>([]);

const companyOptions = companyList.map((c) => ({
    value: c.code,
    label: c.name,
}));

const routeOptions = computed(() =>
    routeList.value.map((r) => ({
        value: r.routeId,
        label: `${r.route} - ${r.dest_en ?? ""}`,
    }))
);

const stopOptions = computed(() =>
    stopList.value.map((s) => ({
        value: s.stop,
        label: s.name_en ?? s.stop,
    }))
);

function joinRouteDirServiceType(
    route: string,
    dir: string,
    serviceType: string
) {
    return [route, dir, serviceType].filter(Boolean).join("|");
}

watch(
    () => selected.company,
    (newValue, oldValue) => {
        if (newValue) {
            routeList.value = [];
            stopList.value = [];
            getAllRoutes(newValue);
        }
        if (oldValue) {
            routeDirServiceType.value = "";
            selected.route = "";
            selected.dir = "";
            selected.serviceType = "";
            selected.busStop = "";
        }
    }
);

watch(routeDirServiceType, (newValue, oldValue) => {
    if (newValue) {
        const arr = newValue.split("|");
        selected.route = arr[0];
        selected.dir = arr[1] || "";
        selected.serviceType = arr[2] || "";

        stopList.value = [];
        getAllStops(
            selected.company,
            selected.route,
            selected.dir,
            selected.serviceType
        );
    }
    if (oldValue) {
        selected.busStop = "";
    }
});

function saveSettings() {
    if (!selected.company || !selected.busStop || !routeDirServiceType.value) {
        error.value = "Please choose values!";
        return;
    }
    error.value = "";

    const e = {
        company: selected.company,
        route: selected.route,
        dir: selected.dir,
        serviceType: selected.serviceType,
        busStop: selected.busStop,
    };

    try {
        localStorage.setItem("settings", JSON.stringify(e));
    } catch {
        error.value = "Cannot persist settings information";
    }

    emit("updateSettings", e);
    modalOpen.value = false;
}

function openSettings() {
    const settings = readSettingsFromStorage();

    selected.company = settings?.company || "";
    selected.route = settings?.route || "";
    selected.dir = settings?.dir || "";
    selected.serviceType = settings?.serviceType || "";
    selected.busStop = settings?.busStop || "";
    routeDirServiceType.value = joinRouteDirServiceType(
        settings?.route || "",
        settings?.dir || "",
        settings?.serviceType || ""
    );

    modalOpen.value = true;
}

function closeSettings() {
    error.value = "";
    modalOpen.value = false;
}

async function getAllRoutes(company: string) {
    let routes: RouteInfo[] = [];
    loadingRoutes.value = true;
    try {
        routes = await getEtaByCompany(company as CompanyCode).getRoutes();
    } catch {
        console.error("Cannot get all routes");
    }
    routeList.value = routes;
    loadingRoutes.value = false;
}

async function getAllStops(
    company: string,
    route: string,
    dir: string,
    serviceType: string
) {
    let routeStops: StopInfo[] = [];
    loadingStops.value = true;
    try {
        routeStops = await getEtaByCompany(
            company as CompanyCode
        ).getRouteStops(route, dir, serviceType);
    } catch (err) {
        console.error("Cannot get all stops in the route", err);
    }
    stopList.value = routeStops;
    loadingStops.value = false;
}
</script>

<template>
    <div style="color: var(--color-primary)">
        <button
            type="button"
            @click="openSettings()"
        >
            Settings
        </button>
    </div>
    <teleport to="body">
        <div
            v-if="modalOpen"
            id="modal"
            class="modal fixed inset-0 overflow-y-auto"
        >
            <div
                class="flex justify-center items-center min-h-screen py-6 px-4"
            >
                <div
                    class="bg-[var(--color-bg)] shadow-md border-solid border-2 border-emerald-500 rounded px-8 pt-6 pb-6 w-96 md:w-2/3 max-h-[90vh] overflow-y-auto md:overflow-visible"
                    style="color: var(--color-primary)"
                >
                    <div class="mb-4">
                        <h2 class="text-xl font-bold">{{ title }}</h2>
                    </div>
                    <div class="mb-4">
                        <p>
                            Please choose the bus company, bus route and bus
                            stop.
                        </p>
                    </div>
                    <div class="mb-6">
                        <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div>
                                <label
                                    for="company"
                                    class="opacity-70"
                                    >Bus Company:</label
                                >
                            </div>
                            <div class="md:col-start-2 md:col-span-5">
                                <SearchableSelect
                                    v-model="selected.company"
                                    :options="companyOptions"
                                    placeholder="Type to search company..."
                                />
                            </div>

                            <div>
                                <label
                                    for="routeDirServiceType"
                                    class="opacity-70"
                                    >Bus Route (To):</label
                                >
                            </div>
                            <div class="md:col-start-2 md:col-span-5">
                                <SearchableSelect
                                    v-model="routeDirServiceType"
                                    :options="routeOptions"
                                    :loading="loadingRoutes"
                                    placeholder="Type to search route..."
                                />
                            </div>

                            <div>
                                <label
                                    for="busStop"
                                    class="opacity-70"
                                    >Bus Stop:</label
                                >
                            </div>
                            <div class="md:col-start-2 md:col-span-5">
                                <SearchableSelect
                                    v-model="selected.busStop"
                                    :options="stopOptions"
                                    :loading="loadingStops"
                                    placeholder="Type to search stop..."
                                />
                            </div>
                        </div>
                    </div>
                    <div
                        v-show="error"
                        class="mb-4"
                        style="color: var(--color-secondary)"
                    >
                        <p>{{ error }}</p>
                    </div>
                    <div class="flex justify-end">
                        <button
                            class="bg-[var(--color-accent)] hover:bg-[var(--color-secondary)] font-bold py-2 px-4 mx-2 rounded"
                            style="color: var(--color-text)"
                            @click="saveSettings()"
                        >
                            Save
                        </button>
                        <button
                            class="bg-[var(--color-accent)] hover:bg-[var(--color-secondary)] font-bold py-2 px-4 mx-2 rounded"
                            style="color: var(--color-text)"
                            @click="closeSettings()"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </teleport>
</template>

<style scoped>
.modal {
    background-color: rgba(0, 0, 0, 0.7);
}

.dropdown {
    max-width: 100%;
    width: 100%;
    padding: 0.5rem;
    background-color: #f0f0f0;
    color: #000000;
    border: 1px solid #00ffaa;
    border-radius: 0.25rem;
}
</style>

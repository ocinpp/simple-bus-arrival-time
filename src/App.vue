<script>
import { getEtaByCompany, readSettingsFromStorage } from "./eta";
import StationSettings from "./components/StationSettings.vue";

const app = {
    components: {
        StationSettings,
    },
    data() {
        return {
            now: new Date().toLocaleString(),
            isLoading: false,
            res: {
                route: null,
                busStop: null,
                etas: [],
            },
            lang: "en",
            check: {
                company: "",
                busStop: "",
                route: "",
                dir: "",
                serviceType: "",
            },
            widthVariants: {
                1: "md:w-full",
                2: "md:w-1/2",
                3: "md:w-1/3",
                4: "md:w-1/4",
                5: "md:w-1/5",
                6: "md:w-1/6",
            },
        };
    },
    methods: {
        readSettings() {
            const settings = readSettingsFromStorage();
            if (settings) {
                this.check.company = settings.company;
                this.check.busStop = settings.busStop;
                this.check.route = settings.route;
                this.check.dir = settings.dir;
                this.check.serviceType = settings.serviceType;
            }
        },
        async updateSettings(setting) {
            console.log("Settings saved");

            // update dashboard data
            this.check.company = setting.company;
            this.check.busStop = setting.busStop;
            this.check.route = setting.route;
            this.check.dir = setting.dir;
            this.check.serviceType = setting.serviceType;

            // refresh data
            await this.updateRouteStopInfo();
            await this.updateAll();
        },
        async getRouteBusStopEta(
            company,
            busStop,
            route,
            dir,
            serviceType,
            lang
        ) {
            const etas = await getEtaByCompany(company).getEtaDisplay(
                busStop,
                route,
                dir,
                serviceType,
                lang
            );

            return etas;
        },
        async updateRouteStopInfo() {
            if (this.check.company) {
                this.res.route = await getEtaByCompany(
                    this.check.company
                ).getRoute(
                    this.check.route,
                    this.check.dir,
                    this.check.serviceType
                );
                this.res.busStop = await getEtaByCompany(
                    this.check.company
                ).getStop(this.check.busStop);
            }
        },
        async updateAll() {
            const allEtas = [];

            if (this.check.company && this.check.route && this.check.busStop) {
                this.now = new Date().toLocaleTimeString();
                this.isLoading = true;

                try {
                    const etas = await this.getRouteBusStopEta(
                        this.check.company,
                        this.check.busStop,
                        this.check.route,
                        this.check.dir,
                        this.check.serviceType,
                        this.lang
                    );
                    allEtas.push(...etas);
                } catch (error) {
                    console.log(error);
                }

                this.res.etas = allEtas;
            }

            this.isLoading = false;
        },
    },
    created: async function () {
        this.readSettings();
        await this.updateRouteStopInfo();
    },
    mounted: async function () {
        await this.updateRouteStopInfo();
        await this.updateAll();
        setInterval(async () => {
            await this.updateAll();
        }, 30000);
    },
};

export default app;
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

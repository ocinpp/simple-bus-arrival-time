<script>
import { extractNumber, getEtaByCompany } from "../eta";

export default {
  props: ["title"],
  emits: ["updateSetting"],
  data() {
    return {
      count: 0,
      modalOpen: false,
      selected: {
        company: null,
        route: null,
        dir: null,
        serviceType: null,
        stop: null,
      },
      routeDirServiceType: null,
      companyList: [
        { code: "KMB", name: "Kowloon Motor Bus" },
        { code: "NLB", name: "New Lantao Bus" },
      ],
      routeList: [],
      stopList: [],
    };
  },
  watch: {
    "selected.company"(newValue, oldValue) {
      if (!!newValue) {
        this.getAllRoutes(newValue);
      }
    },
    routeDirServiceType(newValue, oldValue) {
      if (!!newValue) {
        const arr = newValue.split("|");
        this.selected.route = arr[0];
        this.selected.dir = this.getDirection(arr[1]);
        this.selected.serviceType = arr[2];

        this.getAllStops(
          this.selected.company,
          this.selected.route,
          this.selected.dir,
          this.selected.serviceType
        );
      }
    },
  },
  methods: {
    saveSettings() {
      const e = {
        company: this.selected.company,
        route: this.selected.route,
        dir: this.selected.dir,
        serviceType: this.selected.serviceType,
        stop: this.selected.stop,
      };
      this.$emit("updateSetting", e);
    },
    getDirection(d) {
      switch (d) {
        case "I":
          return "inbound";
        case "O":
          return "outbound";
        default:
          return "";
      }
    },
    async getAllRoutes(company) {
      let routes = [];
      try {
        routes = await getEtaByCompany(company).getRoutes();
      } catch (error) {
        console.log("Cannot get all routes");
      }
      this.routeList = routes;
    },
    async getAllStops(company, route, dir, serviceType) {
      let routeStops = [];
      try {
        const stops = await getEtaByCompany(company).getStops();
        const routeStopsSimple = await getEtaByCompany(company).getRouteStops(
          route,
          dir,
          serviceType
        );
        routeStops = routeStopsSimple.map((s) => {
          const stopName = stops.find((stop) => stop.stop === s.stop);
          return {
            ...s,
            name_en: stopName.name_en,
            name_tc: stopName.name_tc,
            name_sc: stopName.name_sc,
          };
        });
      } catch (error) {
        console.log(error);
        console.log("Cannot get all stops in the route");
      }
      this.stopList = routeStops;
    },
  },
};
</script>

<template>
  <!-- <h1 style="color: var(--color-text)">{{ msg }}</h1> -->

  <div class="card" style="color: var(--color-text)">
    <button type="button" @click="modalOpen = true">Open Settings</button>
  </div>
  <teleport to="body">
    <div
      v-if="modalOpen"
      id="modal"
      class="modal fixed inset-0 overflow-y-auto"
    >
      <div class="flex justify-center items-center h-screen">
        <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-1/2">
          <div class="mb-4">
            <h2 class="text-xl font-bold">{{ title }}</h2>
          </div>
          <div class="mb-4">
            <p>Modal content goes here.</p>
          </div>
          <div class="mb-6">
            <div class="grid grid-cols-1 md:grid-cols-6">
              <div>Company</div>
              <div class="md:col-start-2 md:col-span-5">
                <select v-model="selected.company">
                  <option
                    v-for="company of companyList"
                    v-bind:key="company.code"
                    v-bind:value="company.code"
                  >
                    {{ company.name }}
                  </option>
                </select>
              </div>

              <div>Route (To)</div>
              <div class="md:col-start-2 md:col-span-5">
                <select v-model="routeDirServiceType">
                  <option
                    v-for="route of routeList"
                    v-bind:key="route.route + route.bound + route.service_type"
                    v-bind:value="
                      route.route + '|' + route.bound + '|' + route.service_type
                    "
                  >
                    {{ route.route }} - {{ route.dest_en }}
                  </option>
                </select>
              </div>

              <div>Stop</div>
              <div class="md:col-start-2 md:col-span-5">
                <select v-model="selected.stop">
                  <option
                    v-for="stop of stopList"
                    v-bind:key="stop.stop"
                    v-bind:value="stop.stop"
                  >
                    {{ stop.name_en }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div class="flex justify-end">
            <button
              class="bg-[var(--color-accent)] hover:bg-blue-700 font-bold py-2 px-4 mx-2 rounded"
              style="color: var(--color-text)"
              @click="
                saveSettings();
                modalOpen = false;
              "
            >
              Save
            </button>
            <button
              class="bg-[var(--color-accent)] hover:bg-blue-700 font-bold py-2 px-4 mx-2 rounded"
              style="color: var(--color-text)"
              @click="modalOpen = false"
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
  background-color: rgba(0, 0, 0, 0.5);
}

.modal div {
}
</style>

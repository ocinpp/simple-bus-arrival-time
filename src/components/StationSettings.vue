<script>
import { getEtaByCompany, readSettingsFromStorage } from "../eta";

export default {
  emits: ["updateSettings"],
  data() {
    return {
      title: "Settings",
      error: "",
      modalOpen: false,
      selected: {
        company: "",
        route: "",
        dir: "",
        serviceType: "",
        busStop: "",
      },
      routeDirServiceType: "",
      companyList: [
        { code: "KMB", name: "Kowloon Motor Bus" },
        { code: "CTB_NWFB", name: "Citybus / New World First Bus" },
        { code: "NLB", name: "New Lantao Bus" },
      ],
      routeList: [],
      stopList: [],
    };
  },
  watch: {
    "selected.company": {
      immediate: true,
      handler(newValue, oldValue) {
        if (!!newValue) {
          // clear all routes and stops
          this.routeList = [];
          this.stopList = [];

          // update routes
          this.getAllRoutes(newValue);
        }

        if (!!oldValue) {
          // clear current selected route and bus stop
          this.routeDirServiceType = "";
          this.selected.route = "";
          this.selected.dir = "";
          this.selected.serviceType = "";
          this.selected.busStop = "";
        }
      },
    },
    routeDirServiceType: {
      immediate: true,
      handler(newValue, oldValue) {
        if (!!newValue) {
          const arr = newValue.split("|");
          this.selected.route = arr[0];
          this.selected.dir = arr[1] || "";
          this.selected.serviceType = arr[2] || "";

          // clear all stops
          this.stopList = [];

          // update stops
          this.getAllStops(
            this.selected.company,
            this.selected.route,
            this.selected.dir,
            this.selected.serviceType
          );
        }

        if (!!oldValue) {
          // clear current selected stop
          this.selected.busStop = "";
        }
      },
    },
  },
  methods: {
    joinRouteDirServiceType(route, dir, serviceType) {
      const arr = [];
      if (route) {
        arr.push(route);
      }
      if (dir) {
        arr.push(dir);
      }
      if (serviceType) {
        arr.push(serviceType);
      }
      return arr.join("|");
    },
    saveSettings() {
      if (
        this.selected.company === "" ||
        this.selected.busStop === "" ||
        this.routeDirServiceType === ""
      ) {
        this.error = "Please choose values!";
        return;
      } else {
        this.error = "";
      }

      const e = {
        company: this.selected.company,
        route: this.selected.route,
        dir: this.selected.dir,
        serviceType: this.selected.serviceType,
        busStop: this.selected.busStop,
      };

      try {
        // save to local storage
        localStorage.setItem("settings", JSON.stringify(e));
      } catch (error) {
        alert("Cannot persist settings information");
      }

      // emit event to parent
      this.$emit("updateSettings", e);

      // close modal
      this.modalOpen = false;
    },
    openSettings() {
      const settings = readSettingsFromStorage();

      // init from settings
      this.selected.company = settings?.company || "";
      this.selected.route = settings?.route || "";
      this.selected.dir = settings?.dir || "";
      this.selected.serviceType = settings?.serviceType || "";
      this.selected.busStop = settings?.busStop || "";
      this.routeDirServiceType = this.joinRouteDirServiceType(
        settings?.route || "",
        settings?.dir || "",
        settings?.serviceType || ""
      );

      this.modalOpen = true;
    },
    closeSettings() {
      this.error = "";
      this.modalOpen = false;
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
        routeStops = await getEtaByCompany(company).getRouteStops(
          route,
          dir,
          serviceType
        );
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
  <div style="color: var(--color-primary)">
    <button type="button" @click="openSettings()">Settings</button>
  </div>
  <teleport to="body">
    <div
      v-if="modalOpen"
      id="modal"
      class="modal fixed inset-0 overflow-y-auto"
    >
      <div class="flex justify-center items-center h-screen">
        <div
          class="bg-[var(--color-bg)] shadow-md border-solid border-2 border-emerald-500 rounded px-8 pt-6 pb-6 w-96 md:w-2/3"
          style="color: var(--color-primary)"
        >
          <div class="mb-4">
            <h2 class="text-xl font-bold">{{ title }}</h2>
          </div>
          <div class="mb-4">
            <p>Please choose the bus company, bus route and bus stop.</p>
          </div>
          <div class="mb-6">
            <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div><label for="company">Bus Company:</label></div>
              <div class="md:col-start-2 md:col-span-5">
                <select
                  name="company"
                  v-model="selected.company"
                  class="dropdown"
                  style="color: var(--color-bg)"
                >
                  <option value>Please choose</option>
                  <option
                    v-for="company of companyList"
                    v-bind:key="company.code"
                    v-bind:value="company.code"
                  >
                    {{ company.name }}
                  </option>
                </select>
              </div>

              <div>
                <label for="routeDirServiceType">Bus Route (To):</label>
              </div>
              <div class="md:col-start-2 md:col-span-5">
                <select
                  name="routeDirServiceType"
                  v-model="routeDirServiceType"
                  class="dropdown"
                  style="color: var(--color-bg)"
                >
                  <option value>Please choose</option>
                  <option
                    v-for="route of routeList"
                    v-bind:key="route.routeId"
                    v-bind:value="route.routeId"
                  >
                    {{ route.route }} - {{ route.dest_en }}
                  </option>
                </select>
              </div>

              <div><label for="busStop">Bus Stop:</label></div>
              <div class="md:col-start-2 md:col-span-5">
                <select
                  name="busStop"
                  v-model="selected.busStop"
                  class="dropdown"
                  style="color: var(--color-bg)"
                >
                  <option value>Please choose</option>
                  <option
                    v-for="stop of stopList"
                    v-bind:key="stop.stop + '|' + stop.seq"
                    v-bind:value="stop.stop"
                  >
                    {{ stop.name_en }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div
            class="mb-4"
            style="color: var(--color-secondary)"
            v-show="error"
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
  background-color: rgba(255, 255, 255, 0.6);
}

.dropdown {
  max-width: 100%;
}
</style>

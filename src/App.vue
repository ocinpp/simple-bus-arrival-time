<script>
import _ from "lodash";
import moment from "moment";

// extract bus number at start so that the suffix is removed
function extractNumber(route) {
  const num = route.replace(/[^0-9]/g, "");
  return parseInt(num != null ? num : route);
}

async function getRoute(route, dir, serviceType) {
  let res = null;
  try {
    const response = await fetch(
      `https://data.etabus.gov.hk/v1/transport/kmb/route/${route}/${dir}/${serviceType}`
    );
    const data = await response.json();
    console.log(data["generated_timestamp"]);
    res = data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
  return res;
}

async function getStop(busStop) {
  let res = null;
  try {
    const response = await fetch(
      `https://data.etabus.gov.hk/v1/transport/kmb/stop/${busStop}`
    );
    const data = await response.json();
    console.log(data["generated_timestamp"]);
    res = data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
  return res;
}

async function getEtas(company, busStop, route, dir, lang) {
  let res = [];
  try {
    const response = await fetch(
      `https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/${busStop}`
    );
    const data = await response.json();
    console.log(data["generated_timestamp"]);
    res = data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
  return res.filter(
    (o) => o.route === route && dir.toUpperCase().startsWith(o.dir)
  );
}

async function getEtaDisplay(company, busStop, route, dir, lang) {
  const etas = await getEtas(company, busStop, route, dir, lang);
  for (const eta of etas) {
    // format the eta time
    if (eta.eta != "") {
      eta.etaStr = moment(eta.eta).format("H:mm:ss");
      const minutesDiff = moment(eta.eta).diff(moment(), "m");
      eta.fromNow = minutesDiff > 1 ? minutesDiff + " mins" : "less than 1 min";
    }
  }

  return etas;
}

const app = {
  data() {
    return {
      now: new Date().toLocaleString(),
      isLoading: false,
      res: { route: null, busStop: null, etas: [] },
      lang: "zh-hant",
      check: {
        company: ["KMB"],
        // busStop: "F63C76EC97E38A91",
        // route: "8",
        // dir: "outbound",
        busStop: "31072508CEF942C6",
        route: "281A",
        dir: "inbound",
        serviceType: "1",
      },
      widthVariants: {
        1: "md:w-1/1",
        2: "md:w-1/2",
        3: "md:w-1/3",
        4: "md:w-1/4",
        5: "md:w-1/5",
        6: "md:w-1/6",
      },
    };
  },
  computed: {
    widthClass() {
      return `md:w-1/${this.res.etas.length}`;
    },
  },
  methods: {
    async getRouteBusStopEta(company, busStop, route, dir, lang) {
      const stopObj = await getStop(busStop);
      const etasObj = await getEtaDisplay(company, busStop, route, dir, lang);
      return {
        stop: stopObj,
        etas: etasObj,
      };
    },
    async updateAll() {
      let allEtas = [];
      this.now = new Date().toLocaleTimeString();
      this.isLoading = true;

      for (const company of this.check.company) {
        try {
          const obj = await this.getRouteBusStopEta(
            company,
            this.check.busStop,
            this.check.route,
            this.check.dir,
            this.lang
          );
          allEtas.push(...obj.etas);
        } catch (error) {
          console.log(error);
        }
      }
      // sort by route
      this.res.etas = _.sortBy(allEtas, [
        function (e) {
          return extractNumber(e.route);
        },
        "route",
        "eta_seq",
      ]);

      this.isLoading = false;
    },
  },
  created: async function () {
    this.res.route = await getRoute(
      this.check.route,
      this.check.dir,
      this.check.serviceType
    );
    this.res.busStop = await getStop(this.check.busStop);
  },
  mounted: async function () {
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
          class="text-3xl font-bold mb-4 w-full"
          style="color: var(--color-primary)"
        >
          # {{ res.route?.route }} - {{ res.route?.dest_en }}<br />
          @ {{ res.busStop?.name_en }}
        </h1>
        <div
          class="flex flex-col md:flex-row md:justify-center md:items-center w-full"
        >
          <template v-if="res.etas && res.etas.length > 0">
            <template v-bind:key="index" v-for="(eta, index) in res.etas">
              <div
                class="flex flex-col items-center justify-center bg-[var(--color-accent)] p-4 rounded-lg md:mr-4 arrival-time"
                :class="widthVariants[res.etas.length]"
              >
                <div class="flex flex-col items-center justify-center h-full">
                  <div
                    class="text-6xl font-bold mb-2"
                    style="color: var(--color-text)"
                  >
                    {{ eta.etaStr }}
                  </div>
                  <div
                    class="text-lg font-medium"
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
              <div class="flex flex-col items-center justify-center h-full">
                <div
                  class="text-lg font-medium"
                  style="color: var(--color-text)"
                >
                  No scheduled arrival
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
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

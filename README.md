# Simple Bus Arrival Time

## Data Source

### Kowloon Motor Bus and Long Win Bus Services

The project makes use of 5 APIs from [Real time Arrival Data of Kowloon Motor Bus and Long Win Bus Services](https://data.gov.hk/en-data/dataset/hk-td-tis_21-etakmb) to get the estimated arrival time for a specific bus route at a particular bus stop.

- [Route Data](https://data.gov.hk/en-data/dataset/hk-td-tis_21-etakmb/resource/fd54acc3-4474-4620-8ff9-51c35cbe1c5f)
- [Route-Stop Data](https://data.gov.hk/en-data/dataset/hk-td-tis_21-etakmb/resource/9fc22f3a-5eae-4df8-9346-ba3e32a4f90d)
- [Stop Data](https://data.gov.hk/en-data/dataset/hk-td-tis_21-etakmb/resource/8f60fda1-5720-4dbc-a41f-fa1e20b9b35e)
- [Route List Data](https://data.gov.hk/en-data/dataset/hk-td-tis_21-etakmb/resource/af2002f2-53f1-431d-bdc0-0e28db689c08)
- [Stop ETA Data](https://data.gov.hk/en-data/dataset/hk-td-tis_21-etakmb/resource/16c76add-adca-4ec3-99c2-c22d1d593372)

You can get all bus stops using [Stop List Data](https://data.etabus.gov.hk/v1/transport/kmb/stop)

### New World First Bus Services Limited

The project makes use of 4 APIs from [Real-time “Next Bus” arrival time and related data of New World First Bus](https://data.gov.hk/en-data/dataset/nwfb-eta-transport-realtime-eta) to get the estimated arrival time for a specific bus route at a particular bus stop.

- [Route Data](https://data.gov.hk/en-data/dataset/nwfb-eta-transport-realtime-eta/resource/725c61fa-d725-4fb5-baa2-c2a4459282c1)
- [Bus Stop Data](https://data.gov.hk/en-data/dataset/nwfb-eta-transport-realtime-eta/resource/92e61ae6-ade4-4118-acd1-820e4f0a521a)
- [Bus Stop List of specific Route data](https://data.gov.hk/en-data/dataset/nwfb-eta-transport-realtime-eta/resource/21510ce2-85de-4c97-b3be-9b8a7a5e3c0c)
- [Estimated Time of Arrival (ETA) data](https://data.gov.hk/en-data/dataset/nwfb-eta-transport-realtime-eta/resource/71a9f9ff-32ce-4e0d-a764-98460d8fabb5)

### New Lantao Bus Company (1973) Limited

The project makes use of 3 APIs from [Bus service of New Lantao Bus Company (1973) Limited (Second generation)](https://data.gov.hk/en-data/dataset/nlb-bus-nlb-bus-service-v2) to get the estimated arrival time for a specific bus route at a particular bus stop.

- [Get list of all routes](https://www.nlb.com.hk/datagovhk/BusServiceOpenAPIDocumentation2.0.pdf)
- [Get list of stops of a route](https://www.nlb.com.hk/datagovhk/BusServiceOpenAPIDocumentation2.0.pdf)
- [Get estimated arrivals of a stop of a route](https://www.nlb.com.hk/datagovhk/BusServiceOpenAPIDocumentation2.0.pdf)

It also makes use of a static TypeScript file (`nlb.ts`) that contains all the bus stops.

## Features

- **Real-time ETA display** with auto-refresh every 30 seconds
- **Loading indicator** while fetching arrival data
- **Last-updated timestamp** with manual refresh button
- **Searchable dropdowns** for bus company, route, and stop selection with keyboard navigation
- **Loading spinners** on dropdowns while fetching routes and stops (dropdowns disabled during loading)
- **Mobile bottom sheet** for dropdown selection with full-screen overlay, search input, and touch-friendly targets
- **Desktop inline dropdown** with overflow-visible modal so options expand beyond the settings panel
- **Dark theme** with persistent settings via localStorage
- **Responsive layout** for desktop and mobile

## Tech Stack

- **Vue 3** with Composition API (`<script setup>`)
- **TypeScript**
- **Vite 7** as the build tool
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin)
- **dayjs** for date/time formatting
- **ESLint 10** with `typescript-eslint` and `eslint-plugin-vue`

## Build Setup

```shell
# install dependencies
$ npm install

# serve with hot reload at localhost
$ npm run dev

# type check
$ npm run type-check

# build for production (includes type check)
$ npm run build

# preview
$ npm run preview

# linting
$ npm run lint
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur)
- ESLint
- [ESLint plugin for Vue.js](https://eslint.vuejs.org/)

## Tailwind CSS

This project uses Tailwind CSS v4 for styling, integrated via the `@tailwindcss/vite` plugin.

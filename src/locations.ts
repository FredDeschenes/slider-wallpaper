import dayjs, { Dayjs } from "dayjs";
import * as suncalc from "suncalc";
import { wallpaperHeight, wallpaperWidth } from "./constants.ts";
import { Region } from "./imageUtils.ts";
import { Satellite } from "./slider.ts";

export interface Location {
  name: string;
  satellite: Satellite;
  latitude: number;
  longitude: number;
  cropRegion: Region;
}

export type LocationWithImageTime = Location & {
  imageTime: Dayjs;
};

function isLocationSunlit(time: Dayjs, location: Location): boolean {
  const sunPosition = suncalc.getPosition(
    time.toDate(),
    location.latitude,
    location.longitude,
  );

  return sunPosition.altitude > 5;
}

export function getSunlitLocationsWithRecentImage(
  latestImageTimesBySatellite: Map<Satellite, Dayjs>,
  maxImageAgeHours: number,
): LocationWithImageTime[] {
  const now = dayjs.utc();

  return allLocations.map<LocationWithImageTime>((location) => {
    return {
      ...location,
      imageTime: latestImageTimesBySatellite.get(location.satellite)!,
    };
  }).filter((location) => {
    return now.diff(location.imageTime, "hour") < maxImageAgeHours &&
      isLocationSunlit(location.imageTime, location);
  });
}

const himawariLocations: Location[] = [
  {
    name: "australia",
    satellite: "himawari",
    latitude: -25,
    longitude: 117,
    cropRegion: {
      left: 2400,
      top: 6624,
      width: wallpaperWidth * 2,
      height: wallpaperHeight * 2,
    },
  },
  {
    name: "new_zealand_tasmania",
    satellite: "himawari",
    latitude: -40,
    longitude: 170,
    cropRegion: {
      left: 5815,
      top: 8420,
      width: wallpaperWidth,
      height: wallpaperHeight,
    },
  },
  {
    name: "japan_korea",
    satellite: "himawari",
    latitude: 36,
    longitude: 133,
    cropRegion: {
      left: 3940,
      top: 1020,
      width: wallpaperWidth,
      height: wallpaperHeight,
    },
  },
  {
    name: "philippines",
    satellite: "himawari",
    latitude: 11,
    longitude: 124,
    cropRegion: {
      left: 2340,
      top: 3455,
      width: wallpaperWidth,
      height: wallpaperHeight,
    },
  },
  {
    name: "indonesia",
    satellite: "himawari",
    latitude: -4,
    longitude: 116,
    cropRegion: {
      left: 1755,
      top: 5225,
      width: wallpaperWidth,
      height: wallpaperHeight,
    },
  },
  {
    name: "thailand_cambodia",
    satellite: "himawari",
    latitude: 15,
    longitude: 104,
    cropRegion: {
      left: 880,
      top: 3200,
      width: wallpaperWidth,
      height: wallpaperHeight,
    },
  },
  {
    name: "papua",
    satellite: "himawari",
    latitude: -5,
    longitude: 145,
    cropRegion: {
      left: 4200,
      top: 5460,
      width: wallpaperWidth,
      height: wallpaperHeight,
    },
  },
  {
    name: "china_taiwan",
    satellite: "himawari",
    latitude: 24,
    longitude: 105,
    cropRegion: {
      left: 1795,
      top: 2280,
      width: wallpaperWidth,
      height: wallpaperHeight,
    },
  },
];

const meteosatLocations: Location[] = [
  {
    name: "western_europe_and_mediterranean",
    satellite: "meteosat-12",
    latitude: 40,
    longitude: 9,
    cropRegion: {
      left: 4640,
      top: 675,
      width: wallpaperWidth,
      height: wallpaperHeight,
    },
  },
  {
    name: "libya_egypt_red_sea",
    satellite: "meteosat-12",
    latitude: 30,
    longitude: 31,
    cropRegion: {
      left: 6425,
      top: 2030,
      width: wallpaperWidth,
      height: wallpaperHeight,
    },
  },
  {
    name: "congo_lake_victoria",
    satellite: "meteosat-12",
    latitude: 0,
    longitude: 32,
    cropRegion: {
      left: 6945,
      top: 4960,
      width: wallpaperWidth,
      height: wallpaperHeight,
    },
  },
  {
    name: "south_africa",
    satellite: "meteosat-12",
    latitude: -30,
    longitude: 30,
    cropRegion: {
      left: 6410,
      top: 7870,
      width: wallpaperWidth,
      height: wallpaperHeight,
    },
  },
  {
    name: "morocco_algeria_tunisia",
    satellite: "meteosat-12",
    latitude: 35,
    longitude: 8,
    cropRegion: {
      left: 4290,
      top: 1800,
      width: wallpaperWidth,
      height: wallpaperHeight,
    },
  },
];

const goes18Locations: Location[] = [
  {
    name: "us_west_coast",
    satellite: "goes-18",
    latitude: 39.0,
    longitude: -131.0,
    cropRegion: {
      left: 5490,
      top: 930,
      width: wallpaperWidth,
      height: wallpaperHeight,
    },
  },
  {
    name: "hawaii",
    satellite: "goes-18",
    latitude: 20.0,
    longitude: -157.0,
    cropRegion: {
      left: 2190,
      top: 2500,
      width: wallpaperWidth,
      height: wallpaperHeight,
    },
  },
  {
    name: "pacific",
    satellite: "goes-18",
    latitude: 0.0,
    longitude: -136.0,
    cropRegion: {
      left: 2425,
      top: 3730,
      width: wallpaperWidth * 2,
      height: wallpaperHeight * 2,
    },
  },
];

const goes19Locations: Location[] = [
  {
    name: "quebec",
    satellite: "goes-19",
    latitude: 45.8,
    longitude: -76.0,
    cropRegion: {
      left: 4430,
      top: 290,
      width: wallpaperWidth,
      height: wallpaperHeight,
    },
  },
  {
    name: "north_american_east_coast",
    satellite: "goes-19",
    latitude: 33.4,
    longitude: -73.1,
    cropRegion: {
      left: 3130,
      top: 810,
      width: wallpaperWidth * 2,
      height: wallpaperHeight * 2,
    },
  },
  {
    name: "us",
    satellite: "goes-19",
    latitude: 36,
    longitude: -91,
    cropRegion: {
      left: 2610,
      top: 965,
      width: wallpaperWidth,
      height: wallpaperHeight,
    },
  },
  {
    name: "caribbean",
    satellite: "goes-19",
    latitude: 15.5,
    longitude: -64.8,
    cropRegion: {
      left: 4475,
      top: 2420,
      width: wallpaperWidth * 2,
      height: wallpaperHeight * 2,
    },
  },
  {
    name: "cuba",
    satellite: "goes-19",
    latitude: 23.0,
    longitude: -82.5,
    cropRegion: {
      left: 4235,
      top: 2625,
      width: wallpaperWidth,
      height: wallpaperHeight,
    },
  },
  {
    name: "mexico",
    satellite: "goes-19",
    latitude: 24.0,
    longitude: -96.0,
    cropRegion: {
      left: 1720,
      top: 2195,
      width: wallpaperWidth,
      height: wallpaperHeight,
    },
  },
  {
    name: "chile",
    satellite: "goes-19",
    latitude: -15.0,
    longitude: -75.0,
    cropRegion: {
      left: 4670,
      top: 6700,
      width: wallpaperWidth,
      height: wallpaperHeight,
    },
  },
  {
    name: "amazon",
    satellite: "goes-19",
    latitude: -2.0,
    longitude: -63.0,
    cropRegion: {
      left: 6150,
      top: 5000,
      width: wallpaperWidth,
      height: wallpaperHeight,
    },
  },
  {
    name: "gulf_of_mexico",
    satellite: "goes-19",
    latitude: 28.6,
    longitude: -96.0,
    cropRegion: {
      left: 1500,
      top: 1690,
      width: wallpaperWidth * 2,
      height: wallpaperHeight * 2,
    },
  },
];

export const locationsBySatellite: Record<Satellite, Location[]> = {
  "goes-18": goes18Locations,
  "goes-19": goes19Locations,
  "himawari": himawariLocations,
  "meteosat-12": meteosatLocations,
};

export const allLocations = Object.values(locationsBySatellite).flatMap((it) =>
  it
);

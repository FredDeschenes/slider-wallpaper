import dayjs, { Dayjs } from "dayjs";
import { existsSync } from "@std/fs/exists";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);
export const satellites = [
  "goes-18",
  "goes-19",
  "himawari",
  "meteosat-12",
] as const;
export type Satellite = typeof satellites[number];
export type Product = "geocolor";
export type Sector = "full_disk";
export type ZoomLevel = 1 | 2 | 3 | 4;

interface GetLatestTimesResponse {
  timestamps_int: number[];
}

const sliderDataUrlBase = "https://slider.cira.colostate.edu/data";
export const sliderDateFormat = "YYYYMMDDHHmmss";

export function numTiles(zoomLevel: ZoomLevel): number {
  return Math.pow(2, zoomLevel);
}

export function imageTileUrl(
  satellite: Satellite,
  sector: Sector,
  product: Product,
  imageDate: Dayjs,
  zoomLevel: ZoomLevel,
  tileYPosition: number,
  tileXPosition: number,
) {
  // Example: https://slider.cira.colostate.edu/data/imagery/2026/07/05/goes-19---full_disk/geocolor/20260705220021/04/000_008.png
  return `${sliderDataUrlBase}/imagery/${imageDate.year()}/${
    (imageDate.month() + 1).toString().padStart(2, "0")
  }/${
    imageDate.date().toString().padStart(2, "0")
  }/${satellite}---${sector}/${product}/${imageDate.format(sliderDateFormat)}/${
    zoomLevel.toString().padStart(2, "0")
  }/${tileYPosition.toString().padStart(3, "0")}_${
    tileXPosition.toString().padStart(3, "0")
  }.png`;
}

interface LastModifiedValue {
  etag: string;
  imageTime: string;
}

function lastUpdatePath(baseDirectory: string, satellite: Satellite) {
  return `${baseDirectory}/${satellite}.json`;
}

async function getSatelliteLastUpdate(
  baseDirectory: string,
  satellite: Satellite,
) {
  const path = lastUpdatePath(baseDirectory, satellite);

  if (existsSync(path)) {
    return JSON.parse(await Deno.readTextFile(path)) as LastModifiedValue;
  }

  return null;
}

async function writeSatelliteLastUpdate(
  baseDirectory: string,
  satellite: Satellite,
  response: Response,
  imageTime: string,
) {
  const path = lastUpdatePath(baseDirectory, satellite);
  const data: LastModifiedValue = {
    etag: response.headers.get("etag") || "",
    imageTime,
  };

  await Deno.writeTextFile(path, JSON.stringify(data));
}

export async function getLatestTime(
  baseDirectory: string,
  satellite: Satellite,
  sector: Sector,
  product: Product,
): Promise<dayjs.Dayjs> {
  // Example: https://slider.cira.colostate.edu/data/json/goes-19/full_disk/geocolor/latest_times.json
  const url =
    `${sliderDataUrlBase}/json/${satellite}/${sector}/${product}/latest_times.json`;

  const lastModified = await getSatelliteLastUpdate(baseDirectory, satellite);

  let init: RequestInit | undefined;

  if (lastModified) {
    init = {
      headers: {
        "if-none-match": lastModified.etag,
      },
    };
  }

  const response = await fetch(url, init);

  let latestTime: string;

  if (lastModified && response.status === 304) {
    latestTime = lastModified.imageTime;
  } else {
    const times = (await response.json()) as GetLatestTimesResponse;
    latestTime = String(times.timestamps_int[0]);

    await writeSatelliteLastUpdate(
      baseDirectory,
      satellite,
      response,
      latestTime,
    );
  }

  return dayjs.utc(latestTime, sliderDateFormat, true);
}

export async function downloadTile(
  satellite: Satellite,
  sector: Sector,
  product: Product,
  imageDate: Dayjs,
  zoomLevel: ZoomLevel,
  tileYPosition: number,
  tileXPosition: number,
) {
  const url = imageTileUrl(
    satellite,
    sector,
    product,
    imageDate,
    zoomLevel,
    tileYPosition,
    tileXPosition,
  );

  const response = await fetch(url);
  return await response.bytes();
}

function numTilesForZoomLevel(zoomLevel: ZoomLevel): number {
  return Math.pow(2, zoomLevel);
}

export async function downloadAllTiles(
  satellite: Satellite,
  sector: Sector,
  product: Product,
  latest: Dayjs,
  zoomLevel: ZoomLevel,
): Promise<[number, Uint8Array<ArrayBuffer>[]]> {
  const numTiles = numTilesForZoomLevel(zoomLevel);
  const images: Uint8Array<ArrayBuffer>[] = [];

  for (let y = 0; y < numTiles; y++) {
    const rowDownloadJobs: Promise<Uint8Array<ArrayBuffer>>[] = [];

    for (let x = 0; x < numTiles; x++) {
      const downloadJob = downloadTile(
        satellite,
        sector,
        product,
        latest,
        zoomLevel,
        y,
        x,
      );

      rowDownloadJobs.push(downloadJob);
    }

    await Promise.all(rowDownloadJobs);

    for (const downloadJob of rowDownloadJobs) {
      images.push(await downloadJob);
    }
  }

  return [numTiles, images];
}

import { parseArgs } from "@std/cli/parse-args";
import { existsSync } from "@std/fs/exists";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc.js";
import sharp from "sharp";
import { cleanupOldFiles } from "./src/cleanup.ts";
import { cropImage, mergeImages } from "./src/imageUtils.ts";
import {
  allLocations,
  getSunlitLocationsWithRecentImage,
  locationsBySatellite,
  LocationWithImageTime,
} from "./src/locations.ts";
import {
  downloadAllTiles,
  getLatestTime,
  Product,
  Satellite,
  satellites,
  Sector,
  sliderDateFormat,
  ZoomLevel,
} from "./src/slider.ts";
import { setWallpaper } from "./src/wallpaper.ts";

dayjs.extend(utc);

const sector: Sector = "full_disk";
const product: Product = "geocolor";
const zoomLevel: ZoomLevel = 4;

const flags = parseArgs(Deno.args, {
  string: [
    "location",
    "satellite",
    "image-directory",
    "cached-image-max-age",
    "image-max-age",
  ],
  boolean: [
    "list-locations",
    "save-tiled",
    "verbose",
    "help",
    "print-latest-times",
  ],
  default: {
    "cached-image-max-age": "2",
    "image-max-age": "2",
  },
});

if (flags.help) {
  console.log("deno run set-wallpaper");
  console.log("");
  console.log("Usage:");
  console.log("  --location               Force using a specific location");
  console.log("  --satellite              Force using a specific satellite");
  console.log(
    "  --image-directory        Override the directory where images are downloaded (default: .data/)",
  );
  console.log(
    "  --cached-image-max-age   Maximum time (in hours) that images should be kept on disk (default: 2 hours)",
  );
  console.log(
    "  --image-max-age          Maximum age (in hours) that an image should be considered as valid to download (default: 2 hours)",
  );
  console.log(
    "                           (Himawari images are always delayed by 1 hour so keep this in mind if you change this)",
  );
  console.log("  --list-locations         List available locations");
  console.log(
    "  --save-tiled             Also save the merged full size image (by default only the cropped zones are saved to save space)",
  );
  console.log(
    "  --print-latest-times     Prints the latest available image time for all satellites",
  );
  console.log(
    "  --verbose                Display log messages to show progress",
  );
  console.log("  --help                   Show this help message");

  Deno.exit(0);
}

const imageMaxAge = Number.parseInt(flags["image-max-age"]);
const cachedImageMaxAge = Number.parseInt(flags["cached-image-max-age"]);

const imageDirectory = flags["image-directory"] ||
  Deno.env.get("IMAGE_DIRECTORY") || ".data";

if (!existsSync(imageDirectory)) {
  Deno.mkdirSync(imageDirectory, { recursive: true });
}

if (flags["list-locations"]) {
  for (const [satellite, locations] of Object.entries(locationsBySatellite)) {
    console.log(
      `${satellite}: ${locations.map((location) => location.name).join(", ")}`,
    );
  }

  Deno.exit();
}

if (flags["print-latest-times"]) {
  for (const satellite of satellites) {
    const latest = await getLatestTime(
      imageDirectory,
      satellite,
      sector,
      product,
    );

    console.log(`${satellite}: ${latest.toISOString()}`);
  }

  Deno.exit();
}

let selectedLocation: LocationWithImageTime | undefined;

if (flags.location) {
  for (const location of allLocations) {
    if (location.name === flags.location) {
      selectedLocation = {
        ...location,
        imageTime: await getLatestTime(
          imageDirectory,
          location.satellite,
          sector,
          product,
        ),
      };
      break;
    }
  }

  if (!selectedLocation) {
    console.error("Location not found!");
    Deno.exit(1);
  }
} else if (flags.satellite) {
  if (!satellites.includes(flags.satellite as Satellite)) {
    console.error("Satellite not found!");
    Deno.exit(1);
  }

  const validLocations = locationsBySatellite[flags.satellite as Satellite];
  selectedLocation = {
    ...validLocations[Math.floor(Math.random() * validLocations.length)],
    imageTime: await getLatestTime(
      imageDirectory,
      flags.satellite as Satellite,
      sector,
      product,
    ),
  };

  if (flags.verbose) {
    console.log(
      `Found ${validLocations.length} locations (${
        validLocations.map((location) => location.name).join(", ")
      }).`,
    );
    console.log(
      `Selected '${selectedLocation.name}' (${selectedLocation.satellite}).`,
    );
  }
} else {
  const latestImageBySatellite = new Map<Satellite, Dayjs>();

  for (const satellite of satellites) {
    latestImageBySatellite.set(
      satellite,
      await getLatestTime(imageDirectory, satellite, sector, product),
    );
  }

  const validLocations = getSunlitLocationsWithRecentImage(
    latestImageBySatellite,
    imageMaxAge,
  );

  if (validLocations.length === 0) {
    console.error("ERROR: No valid locations found!");
    Deno.exit(1);
  }

  selectedLocation =
    validLocations[Math.floor(Math.random() * validLocations.length)];

  if (flags.verbose) {
    console.log(
      `Found ${validLocations.length} sunlit locations (${
        validLocations.map((location) => location.name).join(", ")
      }).`,
    );
    console.log(
      `Selected '${selectedLocation.name}' (${selectedLocation.satellite}).`,
    );
  }
}

const satellite: Satellite = selectedLocation.satellite;

const latest = selectedLocation.imageTime;

const sourceDir = `${imageDirectory}/${satellite}/${
  latest.format(sliderDateFormat)
}`;

Deno.mkdirSync(sourceDir, { recursive: true });

const locationImagePath = `${sourceDir}/${selectedLocation.name}.jpg`;

if (!existsSync(locationImagePath)) {
  if (flags.verbose) {
    console.log("Downloading tiles.");
  }

  const [numTiles, images] = await downloadAllTiles(
    satellite,
    sector,
    product,
    latest,
    zoomLevel,
  );

  if (flags.verbose) {
    console.log("All tiles downloaded, creating tiled image.");
  }

  const mergedImage = await mergeImages(images, numTiles).png().toBuffer();

  if (flags["save-tiled"]) {
    await sharp(mergedImage).toFile(`${sourceDir}/${sector}.png`);
  }

  if (flags.verbose) {
    console.log("Tiled image created.");
  }

  for (const location of locationsBySatellite[satellite]) {
    const _croppedImage = await cropImage(
      mergedImage,
      location.cropRegion,
    ).jpeg().toFile(`${sourceDir}/${location.name}.jpg`);
  }
}

setWallpaper(Deno.realPathSync(locationImagePath));

cleanupOldFiles(imageDirectory, cachedImageMaxAge);

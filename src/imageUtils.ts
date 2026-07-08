import sharp, { Region, SharpInput } from "sharp";

export function mergeImages(images: SharpInput[], numTiles: number) {
  return sharp(images, {
    join: {
      across: numTiles,
      background: "#000",
      halign: "centre",
      valign: "centre",
    },
  });
}

export function cropImage(
  mainImage: SharpInput,
  cropRegion: Region,
) {
  return sharp(mainImage)
    .extract(cropRegion);
}

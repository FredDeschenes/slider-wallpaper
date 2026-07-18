import Vips from "wasm-vips";

export interface Region {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function mergeImages(
  vips: typeof Vips,
  images: Vips.ArrayImage,
  numTiles: number,
) {
  return vips.Image.arrayjoin(images, {
    across: numTiles,
    shim: 0,
    background: [0, 0, 0],
  });
}

export function cropImage(
  mainImage: Vips.Image,
  cropRegion: Region,
) {
  return mainImage.crop(
    cropRegion.left,
    cropRegion.top,
    cropRegion.width,
    cropRegion.height,
  );
}

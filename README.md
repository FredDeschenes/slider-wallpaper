# SLIDER Wallpaper

[![License](https://img.shields.io/github/license/FredDeschenes/slider-wallpaper.svg)](https://github.com/FredDeschenes/slider-wallpaper/blob/main/LICENSE)
[![Release](https://img.shields.io/github/release/FredDeschenes/slider-wallpaper.svg)](https://github.com/FredDeschenes/slider-wallpaper/releases/latest)

A command-line tool to download images from the RAMMB/CIRA
[SLIDER](https://slider.cira.colostate.edu/) website and set them as your
desktop wallpaper.

The tool will attempt to find a currently sunlit location, download the
full-disk image from SLIDER, crop the zone into a separate (smaller) image and
set it as your desktop wallpaper.

Currently supports downloading images from the following satellites:

- GOES-18
- GOES-19
- Himawari-9
- Meteosat-12

Uses the awesome [wasm-vips](https://github.com/kleisauke/wasm-vips) image
library to merge/crop the downloaded images.

SLIDER is the
[Satellite Loop Interactive Data Explorer in Real-time](https://www.satelliteconferences.noaa.gov/2017/doc/poster/94.pdf).

> [!CAUTION]
> This tool will download ~180mb of data every time a new full image is
> available. This can end up using quite a lot of bandwidth if ran too often!

### Inspiration

This tool was inspired by [Downlink](https://downlinkapp.com/) and
[SLIDER-cli](https://github.com/colinmcintosh/SLIDER-cli).

**This is not an official product of NWS, NOAA, RAMMB, or CIRA. This is not
officially related to the SLIDER product.**

## Download

**Platforms Supported:** Windows only for now, PRs for other OSes welcome!

- Install [Deno](https://deno.com/) (tested with deno 2.9.1)
- `git clone` the repository

## Example Usage

### Download a random location's image and set the wallpaper

```bash
$ deno run set-wallpaper
```

### Download a specific location's image and set the wallpaper

```bash
$ deno run set-wallpaper --location=amazon
```

### Download a specific satellite's image, pick a random location covered by it and set the wallpaper

```bash
$ deno run set-wallpaper --satellite=himawari
```

## Help Dialog

```
deno run set-wallpaper

Usage:
  --location               Force using a specific location
  --satellite              Force using a specific satellite
  --image-directory        Override the directory where images are downloaded (default: .data/)
  --cached-image-max-age   Maximum time (in hours) that images should be kept on disk (default: 2 hours)
  --image-max-age          Maximum age (in hours) that an image should be considered as valid to download 
                           Himawari images are always delayed by 1 hour so keep this in mind if you change this
                           (default: 2 hours)
  --list-locations         List available locations
  --save-tiled             Also save the merged full size image
                           By default only the cropped zones are saved to save space
  --print-latest-times     Prints the latest available image time for all satellites
  --jpg-save-quality       The quality to save the wallpapers at (default: 95)"
  --verbose                Display log messages to show progress
  --help                   Show this help message
```

## To-Do List

- [ ] Allow adding/replacing the default locations
- [ ] Fix `deno compile` to produce native executables
- [ ] Support other image formats (PNG, currently some images end up too big to
      work as backgrounds (I think?))

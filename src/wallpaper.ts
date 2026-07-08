export function setWallpaper(wallpaperPath: string) {
  switch (Deno.build.os) {
    case "windows": {
      return setWallpaperWindows(wallpaperPath);
    }
    default: {
      console.error(`Invalid OS :: ${Deno.build.os}`);
      return false;
    }
  }
}

function setWallpaperWindows(wallpaperPath: string) {
  // https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-systemparametersinfow
  const SPI_SETDESKWALLPAPER = 0x0014;
  const SPIF_SENDCHANGE = 0x2;

  try {
    const dylib = Deno.dlopen(
      "user32.dll",
      {
        SystemParametersInfoW: {
          parameters: ["u32", "u32", "buffer", "u32"],
          result: "bool",
        },
      },
    );

    const result = dylib.symbols.SystemParametersInfoW(
      SPI_SETDESKWALLPAPER,
      0,
      Buffer.from(wallpaperPath + "\0", "utf16le"),
      SPIF_SENDCHANGE,
    );

    dylib.close();

    //TODO: Set lock screen registry keys?

    return result;
  } catch (err) {
    console.error(err);
    return false;
  }
}

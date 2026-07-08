import dayjs from "dayjs";

export function cleanupOldFiles(
  baseDirectory: string,
  deleteOlderThanHours: number,
) {
  function* walk(path: string): IterableIterator<string> {
    const entries = Deno.readDirSync(path);

    for (const entry of entries) {
      const entryPath = `${path}/${entry.name}`;

      if (entry.isFile) {
        yield entryPath;
      }

      if (entry.isDirectory) {
        yield* walk(entryPath);

        const entriesAfterClean = Deno.readDirSync(entryPath).toArray();

        if (entriesAfterClean.length === 0) {
          Deno.removeSync(entryPath);
        }
      }
    }
  }

  const now = dayjs.utc();

  for (const file of walk(baseDirectory)) {
    const creationTime = Deno.lstatSync(file).mtime;

    const timeDiff = now.diff(creationTime, "hours");

    if (timeDiff >= deleteOlderThanHours) {
      Deno.removeSync(file);
    }
  }
}

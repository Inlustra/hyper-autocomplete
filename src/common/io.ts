import * as fs from "fs-extra";
import * as path from "path";
import walk from "klaw";
import { Stats, constants, access } from "fs-extra";
import { join } from "path";

export const io = {
  filesIn: async (directoryPath: string): Promise<string[]> => {
    if (await io.directoryExists(directoryPath)) {
      return await fs.readdir(directoryPath);
    } else {
      return [];
    }
  },
  recursiveFilesIn: (directoryPath: string): Promise<string[]> => {
    let files: string[] = [];
    return new Promise(resolve =>
      walk(directoryPath)
        .on(
          "data",
          (file: { path: string; stats: fs.Stats }) =>
            file.stats.isFile() && files.push(file.path)
        )
        .on("end", () => resolve(files))
    );
  },
  lstatsIn: async (
    directoryPath: string
  ): Promise<
    {
      name: string;
      path: string;
      stat: Stats;
    }[]
  > => {
    return Promise.all(
      (await io.filesIn(directoryPath)).map(async fileName => {
        return {
          name: fileName,
          path: join(directoryPath, fileName),
          stat: await fs.lstat(path.join(directoryPath, fileName))
        };
      })
    );
  },
  canExecute: async (filePath: string) => {
    try {
      await access(filePath, constants.X_OK);
      return true;
    } catch {
      return false;
    }
  },
  fileExists: async (filePath: string): Promise<boolean> => {
    if (!(await fs.pathExists(filePath))) {
      return false;
    }

    const stat = await fs.lstat(filePath);

    if (stat.isFile()) {
      return true;
    }

    if (stat.isSymbolicLink()) {
      const realPath = await io.realPath(filePath);
      return io.fileExists(realPath);
    }

    return false;
  },
  directoryExists: async (directoryPath: string): Promise<boolean> => {
    try {
      if (await fs.pathExists(directoryPath)) {
        return (await fs.lstat(directoryPath)).isDirectory();
      } else {
        return false;
      }
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  readFile: async (filePath: string) =>
    (await fs.readFile(filePath)).toString(),
  executablesInPath: async (): Promise<string[]> => {
    const allFiles: string[][] = await Promise.all(
      process.env.PATH?.split(path.delimiter).map(io.filesIn) ?? []
    );
    const flatFiles = new Set(
      allFiles.reduce<string[]>((prev, curr) => [...prev, ...curr], [])
    );
    return [...flatFiles];
  },
  realPath: fs.realpath
};

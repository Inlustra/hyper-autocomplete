import * as childProcess from "child_process";
import { EOL } from "os";

export function executeCommand(
  command: string,
  args: string[] = [],
  directory: string,
  execOptions?: any
): Promise<string> {
  return new Promise((resolve, reject) => {
    const options = {
      ...execOptions,
      env: { PWD: directory, SHLVL: 1, ...process.env },
      cwd: directory
    };

    childProcess.exec(
      `${command} ${args.join(" ")}`,
      options,
      (error, output) => {
        if (error) {
          reject(error);
        } else {
          resolve(output.toString());
        }
      }
    );
  });
}

export async function executeCommandLined(
  command: string,
  args: string[],
  directory: string
): Promise<string[]> {
  let output = await executeCommand(command, args, directory);
  return output
    .split("\\" + EOL)
    .join(" ")
    .split(EOL)
    .filter(path => path.length > 0);
}

export const isWindows = process.platform === "win32";
export const homeDirectory = process.env[isWindows ? "USERPROFILE" : "HOME"]!;
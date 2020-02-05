import { join, normalize, basename, dirname } from "path";
import { io } from "../../common/io";
import { access, constants } from "fs-extra";
import { ui } from "../../common/ui";

export const fileAutocompletionProvider: AutocompleteProvider = async ({
  cwd,
  currentUserInput
}) => {
  if (currentUserInput.startsWith(".")) {
    const userFileName = basename(currentUserInput);
    const fullUserInputPath = normalize(join(cwd, currentUserInput));
    const directory = (await io.directoryExists(fullUserInputPath))
      ? fullUserInputPath
      : dirname(fullUserInputPath);
    let files = await io.lstatsIn(directory);
    if (directory !== fullUserInputPath) {
      // If the user has input a directory name (Or './')
      files = files.filter(file => file.name.includes(userFileName));
    }
    return await Promise.all(
      files.map<Promise<Suggestion>>(async file => {
        const isDir = file.stat.isDirectory();
        const kind = isDir
          ? "Directory"
          : (await io.canExecute(file.path))
          ? "Executable"
          : "File";

        return {
          label: file.name,
          kind
        };
      })
    );
  }
  return [];
};

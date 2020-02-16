import * as React from "react";
import { fileIcons } from "../icons-manifest/file-icons";
import { folderIcons } from "../icons-manifest/folder-icons";
import Fuse from "fuse.js";
import { reverse } from "./string";
import { ReactComponent as DefaultFile } from "../icons/default_file.svg";
import { ReactComponent as DefaultFolder } from "../icons/default_folder.svg";

const filesDictionary = fileIcons.reduce<{ [key: string]: Icon }>(
  (prev, curr) => {
    const files = curr.files?.reduce<{ [key: string]: Icon }>(
      (prev, file) => ({
        ...prev,
        [file]: { light: curr.light, dark: curr.dark }
      }),
      {}
    );
    if (!files) return prev;
    return { ...prev, ...files };
  },
  {}
);

const fileExtLookup = new Fuse(
  fileIcons.map(({ extensions, light, dark }) => ({
    light,
    dark,
    extensions: extensions?.map(reverse)
  })),
  {
    location: 0,
    findAllMatches: false,
    threshold: 0.6,
    shouldSort: true,
    distance: 0,
    matchAllTokens: false,
    keys: ["extensions"]
  }
);

const folderExtLookup = new Fuse(
  folderIcons.map(({ extensions, closed }) => ({
    extensions: extensions?.map(reverse),
    ...closed
  })),
  {
    location: 0,
    findAllMatches: false,
    threshold: 0.6,
    shouldSort: true,
    distance: 0,
    matchAllTokens: false,
    keys: ["extensions"]
  }
);

export const ui = {
  highlight: (text: string, higlight: string): React.ReactNode => {
    const parts = text.split(new RegExp(`(${higlight})`, "gi"));
    return (
      <span>
        {parts.map(part =>
          part.toLowerCase() === higlight.toLowerCase() ? <b>{part}</b> : part
        )}
      </span>
    );
  },
  getIconForFile: async (file: string, type: "light" | "dark") => {
    try {
      let fileMatch = filesDictionary[file];
      if (!fileMatch) {
        fileMatch = fileExtLookup.search(reverse(file), { limit: 1 })[0];
      }
      const iconName =
        type === "dark" ? fileMatch?.dark : fileMatch?.light ?? fileMatch?.dark;
      if (iconName) {
        const icon = await import(`../icons/${iconName}`);
        return icon.ReactComponent as React.StatelessComponent<
          React.SVGAttributes<SVGElement>
        >;
      }
    } catch (e) {
      console.error(e);
    }
    return DefaultFile;
  },
  getIconForFolder: async (file: string, type: "light" | "dark") => {
    try {
      let folderMatch = folderExtLookup.search(reverse(file), {
        limit: 1
      })[0];
      const iconName =
        type === "dark"
          ? folderMatch?.dark
          : folderMatch?.light ?? folderMatch?.dark;
      if (iconName) {
        const icon = await import(`../icons/${iconName}`);
        return icon.ReactComponent as React.StatelessComponent<
          React.SVGAttributes<SVGElement>
        >;
      }
    } catch (e) {
      console.error(e);
    }
    return DefaultFolder;
  }
};

import { ui } from "./ui";

describe("UI Utils", () => {
  xdescribe("getIconNameForFile", () => {
    it("should correctly get a dark icon", () => {
      // Fix this when we can mock dynamic imports
      expect(ui.getIconForFile("tslint.json", "dark")).toEqual(
        "file_type_tslint.svg"
      );
    });

    it("should match the default file type if none is known", () => {
      // Fix this when we can mock dynamic imports
      expect(ui.getIconForFile(".hyper.js.backup5", "dark")).toEqual(
        "default_file.svg"
      );
    });
  });
});

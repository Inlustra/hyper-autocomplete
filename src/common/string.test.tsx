import { deleteWordAt, deleteCharAt } from "./string";

describe("String Utils", () => {
  const str = "git checkout    tom";

  describe("deleteWordAt", () => {
    it("should delete at the end", () => {
      expect(deleteWordAt(str, 19)).toEqual("git checkout    ");
    });

    it("should delete in the middle of spaces", () => {
      expect(deleteWordAt(str, 14)).toEqual("git   tom");
      expect(deleteWordAt(str, 15)).toEqual("git  tom");
    });

    it("should delete in the middle of a word", () => {
      expect(deleteWordAt(str, 9)).toEqual("git out    tom");
    });

    it("Do nothing at the beginning", () => {
      expect(deleteWordAt(str, 0)).toEqual(str);
    });

    it("should delete first letter", () =>
      expect(deleteWordAt(str, 1)).toEqual("it checkout    tom"));

    it("should delete in the middle letter", () =>
      expect(deleteWordAt("git s afs", 4)).toEqual("s afs"));
  });

  it("deleteCharAt", () => {
    expect(deleteCharAt(str, 0)).toEqual(str);
    expect(deleteCharAt(str, 1)).toEqual("it checkout    tom");
    expect(deleteCharAt(str, 10)).toEqual("git checkut    tom");
    expect(deleteCharAt(str, 55)).toEqual("git checkout    tom");
  });
});

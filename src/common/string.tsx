export const deleteWordAt = (str: string, index: number): string => {
  if (index === 0) return str;
  let start = index;
  while (str.charAt(start - 1) === " " && start != 0) {
    start--; // Skip first spaces
  }
  while (str.charAt(start - 1) !== " " && start != 0) {
    start--; // Delete the word
  }
  if (start === 0) {
    return str.slice(index, str.length);
  }
  return str.slice(0, start) + str.slice(index, str.length);
};

export const inserCharAt = (str: string, index: number): string => {
  if (index === 0) return str;
  return str.slice(0, index - 1) + str.slice(index);
};

export const deleteCharAt = (str: string, index: number): string => {
  if (index === 0) return str;
  return str.slice(0, index - 1) + str.slice(index);
};

export const reverse = (str: string): string =>
  str
    .split("")
    .reverse()
    .join("");

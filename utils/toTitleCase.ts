export const toTitleCase = (str: string) =>
  str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

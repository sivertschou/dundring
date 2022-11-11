export const padLeadingZero = (nr: number) => (nr < 10 ? '0' + nr : nr);

export const generateRandomString = (length: number) => {
  const alphabet = '0123456789';
  const generatedString = new Array(length).fill(0).reduce((result) => {
    return result + alphabet.substring(Math.random() * alphabet.length, 1);
  }, '') as string;

  return generatedString;
};

export const removeDuplicateWords = (words: string[]) =>
  words.reduce(
    (entries, curr) =>
      entries.every((entry) => entry !== curr) ? [...entries, curr] : entries,
    [] as string[]
  );

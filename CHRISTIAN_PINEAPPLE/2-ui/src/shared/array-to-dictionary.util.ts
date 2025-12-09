// Dictianary = unordered collection of unique values stored in key value pairs
export const arrayToHashmap = <T>(items: T[], key: string = "id") =>
  items.reduce(
    (dictionary: { [id: string]: T }, item: T) => ({
      ...dictionary,
      [(item as any)[key]]: item,
    }),
    {}
  );

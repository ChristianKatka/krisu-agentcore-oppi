export const deleteItemByKeyFromGivenDictionary = <T>(
  id: string,
  items: { [id: string]: T },
): { [id: string]: T } => {
  const copyOfItems = { ...items };
  delete copyOfItems[id];

  return copyOfItems;
};

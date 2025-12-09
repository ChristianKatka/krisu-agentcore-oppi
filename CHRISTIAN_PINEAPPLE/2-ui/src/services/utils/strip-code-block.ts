export const stripCodeBlock = (raw: string): string => {
  return raw.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '');
};

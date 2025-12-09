export const getInitials = (firstName: any, lastName: any) => {
  if (!firstName || !lastName) {
    return "";
  }
  const firstInitial = firstName?.[0]?.toUpperCase() || "";
  const lastInitial = lastName?.[0]?.toUpperCase() || "";
  return firstInitial + lastInitial;
};

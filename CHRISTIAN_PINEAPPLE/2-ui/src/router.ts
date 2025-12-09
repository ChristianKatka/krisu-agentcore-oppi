let navigate: ReturnType<typeof import("react-router-dom").useNavigate>;

export const setNavigate = (nav: typeof navigate) => {
  navigate = nav;
};

export const navigateTo = (path: string) => {
  if (!navigate) {
    console.error("Navigate function not set");
  } else {
    navigate(path);
  }
};

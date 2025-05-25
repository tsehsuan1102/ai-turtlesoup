"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useMemo, ReactNode } from "react";
import NoSsr from "@mui/material/NoSsr";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2ec4b6", dark: "#159a8c", contrastText: "#fff" },
    secondary: { main: "#e0fbfc", dark: "#16302b", contrastText: "#22223b" },
    background: { default: "#f7fff7", paper: "#fff" },
    text: { primary: "#22223b", secondary: "#2ec4b6" },
    divider: "#b2becd",
  },
});
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#2ec4b6", dark: "#43e6d0", contrastText: "#0a0a0a" },
    secondary: { main: "#16302b", dark: "#22223b", contrastText: "#ededed" },
    background: { default: "#0a0a0a", paper: "#22223b" },
    text: { primary: "#ededed", secondary: "#2ec4b6" },
    divider: "#2ec4b6",
  },
});

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = useMemo(
    () => (prefersDarkMode ? darkTheme : lightTheme),
    [prefersDarkMode]
  );
  return (
    <NoSsr>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </NoSsr>
  );
}

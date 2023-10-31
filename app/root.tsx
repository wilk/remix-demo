import {
  Box,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { createHead } from "remix-island";

const theme = createTheme();

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  {
    rel: "icon",
    href: "/favicon.ico",
    type: "image/ico",
  },
];

export const Head = createHead(() => (
  <>
    <Meta />
    <Links />
  </>
));

export default function App() {
  return (
    <>
      <Head />
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xl" sx={{ marginBottom: 10 }}>
          <CssBaseline />
          <Box sx={{ my: 2 }}>
            <Outlet />
          </Box>
        </Container>
      </ThemeProvider>
      <ScrollRestoration />
      <Scripts />
      <LiveReload />
    </>
  );
}

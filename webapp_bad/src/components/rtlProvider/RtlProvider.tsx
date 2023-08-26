/* eslint-disable */
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import rtl from "stylis-plugin-rtl";
import { isWindowAvailable } from "utils/navigation";
import {
  ExoticComponent,
  ReactElement,
  ReactNode,
  ReactPortal,
} from ".pnpm/@types+react@18.0.11/node_modules/@types/react";
import { JsxElement } from ".pnpm/typescript@4.7.3/node_modules/typescript/lib/typescript";
// NB: A unique `key` is important for it to work!
let options = {
  rtl: { key: "css-ar", stylisPlugins: [rtl] },
  ltr: { key: "css-en" },
};
export function RtlProvider(props: { children: ReactNode }) {
  const { children } = props;
  const dir =
    isWindowAvailable() && window.document.documentElement.dir == "ar"
      ? "rtl"
      : "ltr";
  const cache = createCache(options[dir]);
  return <CacheProvider value={cache} children={children} />;
}

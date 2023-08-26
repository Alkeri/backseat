import Router from ".pnpm/next@13.4.19_react-dom@18.2.0_react@18.2.0/node_modules/next/router";
import React, {
  useEffect,
} from ".pnpm/@types+react@18.0.11/node_modules/@types/react";

export default function Home() {
  useEffect(() => {
    Router.push("/admin/default");
  });

  return <></>;
}

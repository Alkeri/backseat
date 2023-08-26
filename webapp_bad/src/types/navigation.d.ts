import { ReactComponentElement } from ".pnpm/@types+react@18.0.11/node_modules/@types/react";

export interface IRoute {
  name: string;
  layout: string;
  component: ReactComponentElement;
  icon: ReactComponentElement | string;
  secondary?: boolean;
  path: string;
}

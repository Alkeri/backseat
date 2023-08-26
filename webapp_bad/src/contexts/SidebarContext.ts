import {
  createContext,
  Dispatch,
  SetStateAction,
} from ".pnpm/@types+react@18.0.11/node_modules/@types/react";

interface SidebarContextType {
  toggleSidebar: boolean;
  setToggleSidebar: Dispatch<SetStateAction<boolean>>;
}

export const SidebarContext = createContext<Partial<SidebarContextType>>({});

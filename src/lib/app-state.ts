import { createContext } from "react";
import { AppState } from "./types";

export const AppStateContext = createContext<AppState>(newAppState());

/**
 * A factory function for generating app states to ensure immutability
 *
 * @returns new app state with proper initializations
 */
export function newAppState(): AppState {
  return {
    currentProject: undefined,
    setCurrentProject: () => {},
    apiToken: undefined,
    setApiToken: () => {},
  };
}

import { useFocusManager as inkUseFocusManager } from 'ink';

/** Global programmatic focus control — delegates to Ink's useFocusManager */
export function useFocusManager() {
  return inkUseFocusManager();
}

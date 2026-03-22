export type KeyBinding = {
    key?: string;
    ctrl?: boolean;
    shift?: boolean;
    meta?: boolean;
    action: () => void;
};
/**
 * Declarative keybinding registration with conflict detection.
 * Pass an array of KeyBinding objects; the hook handles matching and invocation.
 */
export declare function useKeymap(bindings: KeyBinding[], isActive?: boolean): void;
//# sourceMappingURL=useKeymap.d.ts.map
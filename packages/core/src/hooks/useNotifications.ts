import { useState, useCallback, createContext, useContext } from 'react';

export type NotificationVariant = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  body?: string;
  variant: NotificationVariant;
  timestamp: number;
  read: boolean;
  persistent?: boolean;
  duration?: number; // ms, default 5000
}

export interface NotificationsContextValue {
  notifications: Notification[];
  notify: (opts: Omit<Notification, 'id' | 'timestamp' | 'read'>) => string;
  dismiss: (id: string) => void;
  markRead: (id: string) => void;
  clear: () => void;
}

export let _notify: NotificationsContextValue['notify'] | null = null;
export let _dismiss: NotificationsContextValue['dismiss'] | null = null;
export let _clear: NotificationsContextValue['clear'] | null = null;

// Module-level counter for unique IDs
let _counter = 0;

export const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  notify: () => '',
  dismiss: () => {},
  markRead: () => {},
  clear: () => {},
});

/**
 * Consume the notifications context provided by a parent component that calls
 * `useNotificationsProvider()`. Use this hook anywhere in the tree below that
 * provider to read the current notification list or dispatch actions.
 *
 * @returns A `NotificationsContextValue` with:
 *   - `notifications` — Array of active `Notification` objects.
 *   - `notify(opts)` — Create a new notification. Accepts all `Notification`
 *     fields except `id`, `timestamp`, and `read` (auto-generated). Returns the
 *     generated `id` string so you can dismiss it later.
 *   - `dismiss(id)` — Remove a notification from the list immediately.
 *   - `markRead(id)` — Mark a notification as read without removing it.
 *   - `clear()` — Remove all notifications at once.
 *
 * @example
 * ```tsx
 * function SaveButton() {
 *   const { notify } = useNotifications();
 *
 *   const handleSave = () => {
 *     notify({ title: 'Saved', variant: 'success', duration: 3000 });
 *   };
 *
 *   return <Button onPress={handleSave}>Save</Button>;
 * }
 * ```
 */
export function useNotifications(): NotificationsContextValue {
  return useContext(NotificationsContext);
}

/**
 * Create and own the notifications state for a subtree. Call this hook once in
 * a root or layout component and spread the returned value into
 * `NotificationsContext.Provider`. Child components then access the same state
 * via `useNotifications()`.
 *
 * The hook also writes the `notify`, `dismiss`, and `clear` callbacks to
 * module-level references so they can be called imperatively from outside React
 * (e.g. from async handlers) if needed.
 *
 * @returns A `NotificationsContextValue` containing the live `notifications`
 *   array and the `notify`, `dismiss`, `markRead`, and `clear` action
 *   callbacks. Pass this directly as the `value` prop of
 *   `NotificationsContext.Provider`.
 *
 * @example
 * ```tsx
 * function RootLayout({ children }: { children: ReactNode }) {
 *   const notificationsValue = useNotificationsProvider();
 *
 *   // Auto-dismiss non-persistent notifications after their duration expires
 *   useEffect(() => {
 *     const timers = notificationsValue.notifications
 *       .filter((n) => !n.persistent)
 *       .map((n) =>
 *         setTimeout(
 *           () => notificationsValue.dismiss(n.id),
 *           n.duration ?? 5000
 *         )
 *       );
 *     return () => timers.forEach(clearTimeout);
 *   }, [notificationsValue.notifications]);
 *
 *   return (
 *     <NotificationsContext.Provider value={notificationsValue}>
 *       {children}
 *       <NotificationList />
 *     </NotificationsContext.Provider>
 *   );
 * }
 * ```
 */
export function useNotificationsProvider(): NotificationsContextValue {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((opts: Omit<Notification, 'id' | 'timestamp' | 'read'>): string => {
    const id = `notif-${++_counter}`;
    const notif: Notification = {
      ...opts,
      id,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications((prev) => [...prev, notif]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const clear = useCallback(() => setNotifications([]), []);

  _notify = notify;
  _dismiss = dismiss;
  _clear = clear;

  return { notifications, notify, dismiss, markRead, clear };
}

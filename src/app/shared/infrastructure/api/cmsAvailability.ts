/**
 * Whether the CMS answered the most recent request. Fed by callApiService,
 * read by the outage notice through useSyncExternalStore.
 */
type Listener = () => void;

let available = true;
const listeners = new Set<Listener>();

export function reportCmsAvailability(isAvailable: boolean): void {
    if (available === isAvailable) return;
    available = isAvailable;
    listeners.forEach((listener) => listener());
}

export function isCmsAvailable(): boolean {
    return available;
}

export function subscribeToCmsAvailability(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

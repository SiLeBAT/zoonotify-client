/**
 * @desc Generate the current date and time in a fixed format (YYYY-MM-DDThhmmss)
 * @returns {string} - string with the current date and time
 */
export function getCurrentDate(): string {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const d = today.getDate();
    const h = today.getHours();
    const mi = today.getMinutes();
    const s = today.getSeconds();
    return `${y}-${m}-${d}T${h}${mi}${s}`;
}

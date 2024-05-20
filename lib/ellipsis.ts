export function ellipsis(str: string, x = 6, y = 4): string {
    if (str.length <= x + y) {
        return str; // No need to truncate
    }

    const start = str.slice(0, x);
    const end = str.slice(-y);

    return `${start}...${end}`;
}
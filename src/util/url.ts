export function joinUrl(...parts: string[]) {
    const url = parts
        .map(part => part.replace(/\/*(.*?)\/*$/, "$1"))
        .filter(part => part)
        .join("/");

    return `/${url}`;
}

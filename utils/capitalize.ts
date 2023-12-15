export default function (str: string): string {
    const output = str.trim()
        .replaceAll('_', ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    return output;
}

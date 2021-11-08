export const truncate = (text: string, length: number, suffix: string = '...') => {
    if (text.length <= length) return text
    return text.substring(0, length) + suffix
}
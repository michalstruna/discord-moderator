import Collection from '@discordjs/collection'

const relations = [
    (x: string, y: string) => x.toLowerCase().includes(y.toLowerCase())
]

export const multiFind = <Item>(collection: Collection<string, Item>, value: string, accessor: (item: Item) => string[]) => {
    if (!value) return null
    if (collection.has(value)) return collection.get(value.replace(/[^0-9]/g, ''))

    for (const rel of relations) {
        const result = collection.find(item => !!accessor(item).find(val => rel(val, value)))
        if (result) return result
    }
}

export const unique = <Item>(array: Item[]) => {
    return Array.from(new Set(array).values())
}

export const getPageItems = <Item>(array: Item[], page: number, pageSize: number) => {
    const startIndex = page * pageSize
    const endIndex = startIndex + pageSize
    return array.slice(startIndex, endIndex)
}

export const subtract = <Item>(source: Item[], minus: Item[]): Item[] => {
    return source.filter(item => !minus.includes(item))
}
import Collection from '@discordjs/collection'

const relations = [
    (x: string, y: string) => x.toLowerCase() === y.toLowerCase(),
    (x: string, y: string) => x.toLowerCase().startsWith(y.toLowerCase()),
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
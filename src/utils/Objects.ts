import Equals from 'deep-equal'

export const filter = (obj: Record<any, any>, exclude: string[]) => {
    const result = { ...obj }

    for (const key of exclude) {
        delete result[key]
    }
    
    return result
}

export const equals = (obj1: Record<any, any>, obj2: Record<any, any>, exclude: string[] = []) => {
    return Equals(
        filter(obj1, exclude),
        filter(obj2, exclude)
    )
}
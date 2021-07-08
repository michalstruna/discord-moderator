const Db = require('./Db')

const serversCache = new Map()

exports.getById = async id => {
    if (serversCache.has(id)) {
        return serversCache.get(id)
    }

    const server = await Db.get(Db.Server, { id }, true)
    serversCache.set(id, server)
    
    return server
}

exports.updateById = async (id, update) => {
    const server = await Db.update(Db.Server, { id }, update)
    serversCache.set(id, server)
    return server
}
const db = require('./db')

const serversCache = new Map()

exports.getById = async (id, upsert = false) => {
    if (serversCache.has(id)) {
        return serversCache.get()
    }

    let server = await db.Server.findOne({ id })

    if (!server && upsert) {
        server = await exports.updateById({ id }, { })
    }

    serversCache.set(id, server)
    
    return server
}

exports.updateById = async (id, update) => {
    const server = await db.Server.updateOne({ id }, { $set: { id, ...update } }, { upsert: true })
    serversCache.set(id, server)
    return server
}
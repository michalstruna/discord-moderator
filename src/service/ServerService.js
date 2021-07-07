const db = require('./db')

const serversCache = new Map()

exports.getById = async id => {
    if (serversCache.has(id)) {
        return serversCache.get(id)
    }

    let server = await db.Server.findOne({ id })

    if (!server) {
        server = await new db.Server({ id }).save()
    }

    serversCache.set(id, server)
    
    return server
}

exports.updateById = async (id, update) => {
    const server = await db.Server.updateOne({ id }, { id, ...update }, { upsert: true })
    serversCache.set(id, server)
    return server
}
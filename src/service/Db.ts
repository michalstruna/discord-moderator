import { connect, model, Schema, Model, FilterQuery } from 'mongoose'

import Config from '../constants/Config'
import { ServerData as ServerData } from '../model/types'


export const get = async <Item>(model: Model<Item>, filter: FilterQuery<Item>, upsert: boolean = false): Promise<Item> => {
    let item: Item = await model.findOne(filter).lean()

    if (!item && upsert) {
        item = await new model(filter).save() as any // TODO
    }

    return item
}

export const update = <Item>(model: Model<Item>, filter: FilterQuery<Item>, item: Partial<Item>): Promise<Item> => (
    model.findOneAndUpdate(filter, { ...filter, ...item }, { upsert: true, useFindAndModify: false, new: true }).lean() as any // TODO
)

// ==============================================

connect(process.env.DB_HOST as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

// ==============================================

const Id = String

const Auth = new Schema({
    permitDefault: { type: [Id], required: true, default: [] },
    denyDefault: { type: [Id], required: true, default: [] },
    permit: { type: [Id], required: true, default: [] },
    deny: { type: [Id], required: true, default: [] }
})

const CommandAction = new Schema({
    auth: { type: Auth, required: true }
})

const Command = new Schema({
    actions: { type: Map, of: CommandAction, required: true, default: {} },
    enabled: { type: Boolean, required: true, default: true }
})

export const Server = model<ServerData>('Server', new Schema({
    id: { type: Id, required: true, index: true },
    prefix: { type: String, required: true, default: Config.DEFAULT_PREFIX },
    commands: { type: Map, of: Command, required: true, default: {} },
    roles: { type: Map, of: Id, required: false, default: {} }
}))
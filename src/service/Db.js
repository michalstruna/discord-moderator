const { connect, model, Schema } = require('mongoose')

const Config = require('../constants/Config')


exports.get = async (model, filter, upsert = false) => {
    let item = await model.findOne(filter)

    if (!item && upsert) {
        item = await new model(filter).save()
    }

    return item
}

exports.update = (model, filter, item) => (
    model.findOneAndUpdate(filter, { ...filter, ...item }, { upsert: true, useFindAndModify: false, new: true })
)

// ==============================================

connect(process.env.DB_HOST, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

// ==============================================

const Id = String

exports.Server = model('Server', new Schema({
    id: { type: Id, required: true, index: true },
    prefix: { type: String, required: true, default: Config.DEFAULT_PREFIX }
}))
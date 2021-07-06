const { connect, model, Schema } = require('mongoose')

const Config = require('../constants/Config')

connect(process.env.DB_HOST, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const Id = String

exports.Server = model('Server', new Schema({
    id: { type: Id, required: true, index: true },
    prefix: { type: String, required: true, default: '>' }
}))
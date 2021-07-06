const { connect, Model, Schema } = require('mongoose')

connect(process.env.DB_HOST, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
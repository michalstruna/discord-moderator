const fs = require('fs')
const path = require('path')

module.exports = client => {
    for (const dir of ['client', 'guild']) {
        const files = fs.readdirSync(path.join(__dirname, '../events', dir))

        for (const file of files) {
            const event = require(`../events/${dir}/${file}`)
            const eventName = file.split('.')[0]
            client.on(eventName, event.bind(null, client))
        }
    }
}

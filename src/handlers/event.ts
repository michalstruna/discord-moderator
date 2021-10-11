import fs from 'fs'
import path from 'path'
import Handler from '../model/Handler'

export default new Handler(client => {
    for (const dir of ['client', 'guild']) {
        const files = fs.readdirSync(path.join(__dirname, '../events', dir))

        for (const file of files) {
            const event = require(`../events/${dir}/${file}`).default
            const eventName = file.split('.')[0]
            client.on(eventName, event.bind(null, client))
        }
    }
})
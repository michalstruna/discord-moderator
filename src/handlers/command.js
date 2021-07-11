const fs = require('fs')
const path = require('path')

module.exports = client => {
    const files = fs.readdirSync(path.join(__dirname, '..', 'commands'))

    for (const file of files) {
        const command = require(`../commands/${file}`)

        if (Array.isArray(command.name)) {
            for (const n of command.name) {
                const cmd = { ...command, name: n, names: command.name }
                client.commands.set(n, cmd)
            }
        } else {
            client.commands.set(command.name, { ...command, names: [command.name] })
        }
    }
}

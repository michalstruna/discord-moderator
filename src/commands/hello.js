const Regex = require('../utils/Regex')

module.exports = {
    name: 'hello',
    description: 'Send hello to chat.',
    args: [
        { name: 'word', value: ['hello', 'hi', 'bye'], defaultValue: 'hello' },
        { name: 'age', value: Regex.Type.REAL },
        { name: 'name', value: Regex.Type.ANY, required: true },
    ],
    async execute(client, msg, { word, name, args }) {
        msg.channel.send(`${word}, ${name}! *${args.join(', ')}*`)
    }
}

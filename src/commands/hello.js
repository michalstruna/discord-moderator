module.exports = {
    name: 'hello',
    description: 'Send hello to chat.',
    async execute(client, msg) {
        msg.channel.send(`Hello ${msg.user}.`)
    }
}

module.exports = {
    name: 'hello',
    description: 'Send hello message.',
    on: {
        async run(client, msg) {
            msg.channel.send(`Hello ${msg.user}!`)
        }        
    }
}
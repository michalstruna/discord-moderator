import { Client } from 'discord.js'

type Body = (client: Client) => void

export default class Handler {

    private body: Body

    public constructor(body: Body) {
        this.body = body
    }

    public run(client: Client) {
        this.body(client)
    }

}
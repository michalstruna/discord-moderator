jest.useFakeTimers()
jest.setTimeout(100000)

import { Client } from 'discord.js'
import { createClient } from '../../../model/Client'

let client: Client

beforeAll(async () => {
    client = await createClient()
})


describe('Echo', () => {

    test('Plain echo', async () => {
        expect(1).toEqual(1)
    })

})
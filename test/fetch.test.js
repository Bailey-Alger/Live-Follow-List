global.chrome = {
    runtime: {
        onStartup: {
            addListener: jest.fn(),
        },
        sendMessage: jest.fn(),
        onMessage: {
            addListener: jest.fn(),
        },
    },
};

import { fetchTokenIsValid } from "../src/backgroundTwitch.js";



test('handles a 404', async ()=> {
    global.fetch = jest.fn (() =>
        Promise.resolve({
            json: () => Promise.resolve({ status: 404 }),
        })
    );


    const result = await fetchTokenIsValid("123")
    expect(result).toBe(false);
}) 
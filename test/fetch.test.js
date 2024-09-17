import { fetchTokenIsValid } from "../src/background_twitch/fetch.js";

describe('fetchTokenIsValid sends a token to twitch to validate', () => {
    let sut = fetchTokenIsValid;

    it('handles a 404', async ()=> {
        global.fetch = jest.fn (() =>
            Promise.resolve({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ message: 'dunno' }),
            })
        );

        const result = await sut("123");

        expect(result).toBe(false);
    });
});
// more later



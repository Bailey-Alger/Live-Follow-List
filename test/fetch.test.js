import chrome from 'sinon-chrome';
import browser from 'sinon-chrome';
// import { fetchTokenIsValid } from "../src/backgroundTwitch.js";

beforeAll(() => {
    global.chrome = chrome
  })

describe('your test', () => {
    let fetchTokenIsValid;

    beforeAll( async () => {
        const module = await import("../src/backgroundTwitch.js");
        fetchTokenIsValid = module.fetchTokenIsValid;
    })


    it('handles a 404', async ()=> {
        global.fetch = jest.fn (() =>
            Promise.resolve({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ message: 'dunno' }),
            })
        );


        const result = await fetchTokenIsValid("123")
        expect(result).toBe(false);
    })

    afterAll(() => {
        chrome.flush()
        browser.flush()
    })
})



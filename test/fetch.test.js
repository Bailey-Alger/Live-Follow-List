import chrome from 'sinon-chrome';
import browser from 'sinon-chrome';
import { fetchTokenIsValid } from "../src/backgroundTwitch.js";

describe('your test', () => {
  beforeAll(() => {
    global.chrome = chrome
    global.browser = browser
  })

  it('handles a 404', async ()=> {
    global.fetch = jest.fn (() =>
        Promise.resolve({
            json: () => Promise.resolve({ status: 404 }),
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



import { followListAssembler } from "../src/background_twitch/listService";
import chrome from "sinon-chrome";
// TODO: improve this mess

describe('followListAssembler is a controller function that calls the fetch and chrome get functions', () => {
    let sut = followListAssembler;

    beforeAll(() => {
        global.chrome = chrome;
    });

    it('something', async () => {
        // mock getStoredFollowList (should be mocking chrome storage instead)
        jest.spyOn(require("../src/background_twitch/chromeStorage"), 'getStoredFollowList').mockResolvedValue([
            { user_id: "2982838", user_name: "Surefour" }, 
            { user_id: "160504245", user_name: "39daph" }
        ]);
        jest.spyOn(require("../src/background_twitch/chromeStorage"), 'getTimeLastFetched').mockResolvedValue(10000000);
        const ID = 'moonmoon';
        jest.spyOn(require("../src/background_twitch/chromeStorage"), 'getStoredUserID').mockResolvedValue(ID);
        jest.spyOn(require("../src/background_twitch/chromeStorage"), 'getStoredAccessToken').mockResolvedValue('1234');
        global.fetch = jest.fn((url) => {
            if (url === `https://api.twitch.tv/helix/streams/followed?user_id=${ID}&first=100`) {
                return Promise.resolve(new Response(
                    JSON.stringify({
                        data: [
                            { user_id: "2982838", user_name: "Surefour" },
                            { user_id: "160504245", user_name: "39daph" },
                            { user_id: "466139555", user_name: "Dantes" }
                        ]
                    }),
                    { status: 200 } // Set the status to 200
                ))
            } else if (url === "https://id.twitch.tv/oauth2/validate") {
                return Promise.resolve(new Response(
                    JSON.stringify({ ok: true }),
                    { status: 200 }
                ))
            }
        });
        jest.spyOn(require("../src/background_twitch/chromeStorage"), 'getFavorites').mockResolvedValue([]);

        const result = await sut();

        expect(result).toEqual([
            { isFavorite: false, user_id: "160504245", user_name: "39daph" },
            { isFavorite: false, user_id: "466139555", user_name: "Dantes" },
            { isFavorite: false, user_id: "2982838", user_name: "Surefour" }
        ]);
    });
});
import chrome from 'sinon-chrome';

beforeAll(() => {
    global.chrome = chrome
  });

describe('sortCaseInsensitive', () => {
    let sut;

    beforeAll( async () => {
        const module = await import("../src/backgroundTwitch.js");
        sut = module.sortCaseInsensitive;
    });

    it('sorts a list in ascending order', async ()=> {
        let l = ["azz", "zZz", "aaa", "Aza", "aaz", "zza", "zaa"];

        l = sut(l, "list");

        expect(l).toStrictEqual(["aaa","aaz","Aza","azz", "zaa","zza", "zZz"]);
    });

    it('handles an empty string', async () => {
        let l = ["zzz", "zza", "aaa", ""];

        l = sut(l, "list");

        expect(l).toStrictEqual(["", "aaa", "zza", "zzz"]);
    });

    it('handles an empty type arg', async () => {
        let l = ["zzz", "aaa"];

        l = sut(l);

        expect(l).toStrictEqual(["aaa", "zzz"]);
    });

    it('handles an empty list', async () => {
        let l = [];

        l = sut(l);

        expect(l).toStrictEqual([]);
    });

    it('sorts a list of twitch account json objects by user_name', async () => {
        let j = [{
            user_id: "2982838", 
            user_name: "Surefour"
        }, 
            {
            user_id: "160504245", 
            user_name: "39daph"
        }, 
            {
            user_id: "466139555", 
            user_name: "Dantes"
        }];

        j = sut(j, "twitch");

        expect(j).toStrictEqual([
            {
            user_id: "160504245",
            user_name: "39daph"
        },
            { 
            user_id: "466139555",
            user_name: "Dantes"
        },
            {
            user_id: "2982838",
            user_name: "Surefour"
        }]);
    });

    it('Handles an empty user_name', async () => {
        let j = [{
            user_id: "2982838", 
            user_name: "Surefour"
        }, 
            {
            user_id: "160504245", 
            user_name: ""
        }, 
            {
            user_id: "466139555", 
            user_name: "Dantes"
        }];

        j = sut(j, "twitch");

        expect(j).toStrictEqual([
            {
            user_id: "160504245",
            user_name: ""
        },
            { 
            user_id: "466139555",
            user_name: "Dantes"
        },
            {
            user_id: "2982838",
            user_name: "Surefour"
        }]);
    });

    afterAll(() => {
        chrome.flush()
    });
})

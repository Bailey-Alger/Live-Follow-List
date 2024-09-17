import { favListCombiner } from "../src/background_twitch/listService.js";

describe('favListCombiner combines a list of user json objects with a list of favorites, sorts it and returns it', () => {
    const sut = favListCombiner;

    it('combines a list of user json objects with a list of favorites', async () => {
        const followList = [{
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
        const favList = ['Surefour', 'Dantes'];


        const result = await sut(followList, favList);


        expect(result).toStrictEqual([
            { 
            user_id: "466139555",
            user_name: "Dantes",
            isFavorite: true
        },
            {
            user_id: "2982838",
            user_name: "Surefour",
            isFavorite: true
        },
            {
            user_id: "160504245",
            user_name: "39daph",
            isFavorite: false
        }]);
    });

    it('works with an empty favorites list', async () => {
        const followList = [{
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
        let favList = [];


        const result = await sut(followList, favList);


        expect(result).toStrictEqual([
            {
            user_id: "160504245",
            user_name: "39daph",
            isFavorite: false
        },
            { 
            user_id: "466139555",
            user_name: "Dantes",
            isFavorite: false
        },
            {
            user_id: "2982838",
            user_name: "Surefour",
            isFavorite: false
        }]);
    });

    it('works with an empty followList', async () => {
        const followList = [];
        const favList = ['Surefour', 'Dantes'];


        const result = await sut(followList, favList);


        expect(result).toStrictEqual([]);
    });

    it('works with both lists empty', async () => {
        const followList = [];
        const favList = [];


        const result = await sut(followList, favList);


        expect(result).toStrictEqual([]);
    });
});
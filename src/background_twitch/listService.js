import * as storage from './chromeStorage.js';
import * as twitchAPI from './fetch.js';

export async function followListAssembler() {
    let followList = await storage.getStoredFollowList();

    var followTime = await storage.getTimeLastFetched('fetchFollowList');
    console.log("follow time:", followTime);
    // if the array doesn't exist or it's been a minute, fetch an updated follow list
    if (!Array.isArray(await followList) || (await followTime === undefined) || ((Date.now() - 60000) > await followTime)) {
        const ID = await storage.getStoredUserID();
        const authToken = await storage.getStoredAccessToken();
        followList = await twitchAPI.fetchFollowList(ID, authToken);
        // followList = await fetchFollowList();
    };
    
    if (!followList){
        return false;
    };

    const favList = await storage.getFavorites();
    followList = await favListCombiner(await followList, await favList);

    return followList;
};

export async function favListCombiner(followList, favList) {
    
    followList.forEach(obj => {
        obj.isFavorite = favList.includes(obj.user_name);
    });

    followList.sort((a, b) => {
        if (a.isFavorite === b.isFavorite) {
            return a.user_name.localeCompare(b.user_name);
        }
        return b.isFavorite ? 1 : -1;
    });

    return followList;
};


export async function toggleFavorite(favorite) {
    console.log("toggling favorite");
    const favorites = await storage.getFavorites();
    const index = favorites.indexOf(favorite);
    if (index !== -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(favorite);
    }
    await chrome.storage.local.set({ favorites });
    return;
};

// function sortCaseInsensitive(arr, type = "list") {
//     console.log("Sorting: ", arr);
//     if (type == "twitch") {
//         return arr.sort((a, b) => a.user_name.localeCompare(b.user_name, undefined, { sensitivity: 'base' }));
//     } else {
//         return arr.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
//     };
// };
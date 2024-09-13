import * as storage from './background_twitch/chromeStorage.js';
import * as twitchAPI from './background_twitch/fetch.js';
import { followListAssembler, toggleFavorite} from './background_twitch/listService.js';

// if token is invalid what will break?
// Removes invalid token timer on startup
chrome.runtime.onStartup.addListener(async function() {
    let storedToken = await storage.getStoredAccessToken();
    if ( !(await twitchAPI.fetchTokenIsValid(await storedToken)) ) {
        chrome.storage.local.remove(["fetchTokenIsValid"], function() {
            console.log("invalid token found in storage, removing validation time.");
        });
    } else { return };
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
(async function () {
    console.log("message recieved: ", request);
    if (request === "fetchTwitchData") {
        const followList = await followListAssembler();
        if (followList) {
            sendResponse({
                success: true,
                followList: followList
            });
        } else {
            sendResponse({
                success: false
            });
        };

    } else if (await request.type === "toggleFavorite") {
        const favorite = request.favorite;
        console.log(favorite);
        const combinedList = await toggleFavorite(favorite);
        sendResponse({success: true, combinedList});

    } else if (await request.type === "OAuthURL") {
        var url = new URL(request.url.slice(0,-1));
        console.log(url);
        console.log(url.hash);
        if (url.hash && !url.search) {
            const accessToken = url.hash.slice(14, url.hash.indexOf('&'));
            console.log(accessToken);
            chrome.storage.local.set({ accessToken });
            storage.setStoredUserID(await twitchAPI.fetchUserID());
        } else if (!url.hash && url.search) {
            console.log(url.search);
        } else {
            console.log('unknown error');
        };
    };
})();
        return true; // indicates that we will send the response asynchronously
});
import * as storage from './background_twitch/chromeStorage.js';
import * as twitchAPI from './background_twitch/fetch.js';
import { followListAssembler, toggleFavorite} from './background_twitch/listService.js';
import { ytListAssembler } from './background_youtube/ytListService.js';

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
        console.log(followList);
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
        toggleFavorite(favorite);
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

    } else if (await request.type === "OAuthURL") {
        var url = new URL(request.url);
        console.log(url);
        console.log(url.hash);
        if (url.hash && !url.search) {
            const twitchToken = url.hash.slice(14, url.hash.indexOf('&'));
            // console.log(twitchToken);
            storage.setStoredAccessToken("twitchToken", twitchToken);
            storage.setStoredUserID(await twitchAPI.fetchUserID(twitchToken));
            sendResponse({
                success: true
            });
        } else if (!url.hash && url.search) {
            console.log(url.search);
            sendResponse({
                success: false
            });
        } else {
            console.log('unknown error');
            sendResponse({
                success: false
            });
        };
    } else if (await request.type === "YTOAuthURL") {
        var url = new URL(request.url);
        console.log(url);
        console.log(url.hash);
        if (url.hash && !url.search) {
            const ytToken = url.hash.slice(14, url.hash.indexOf('&'));
            console.log(ytToken);
            storage.setStoredAccessToken("ytToken", ytToken);;
            // maybe some more
            sendResponse({
                success: true
            });
        } else if (!url.hash && url.search) {
            console.log(url.search);
            sendResponse({
                success: false
            });
        };
    } else if (request === "fetchYTData") {
        ytListAssembler();
        const followList = ["foo", "bar"];   // await followListAssembler(); // change to YT version
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
    };
})();
        return true; // indicates that we will send the response asynchronously
});
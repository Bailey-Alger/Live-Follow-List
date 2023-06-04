import { CLIENT_SECRET } from "./config.js";

const tokenPromise = fetchOAuth();
const userID = fetchUserID();
const clientId = 'pa669by8xti1oag6giphneaeykt6ln';
const favName = "+";
const unFavName = "-";


// FETCHES

async function fetchCombinedList() {
    const followList = await fetchFollowList();
    const favorites = sortCaseInsensitive(await getFavorites()) || [];

    return [...favorites.filter(item => followList.includes(item)).map(item => item + unFavName), ...followList.filter(item => !favorites.includes(item)).map(item => item + favName)];
};

async function fetchFollowList() {
    const iD = await userID;
    const authToken = await tokenPromise;
    let followList = [];
    let response = await fetch(`https://api.twitch.tv/helix/users/follows?from_id=${iD}&first=100`, {
        headers: {
            "Authorization": `Bearer ${authToken}`,
            "Client-Id": "pa669by8xti1oag6giphneaeykt6ln" 
        }
    });
    let data = await response.json();
    console.log(data);
    let promises = data.data.map(async (item) => {
        let isLive = await fetchIsLive(item.to_name);
        if (isLive) {
            console.log(item.to_name);
            followList.push(item.to_name);
        };
    })
    await Promise.all(promises);
    console.log("follow list created");
    return followList;
};

async function fetchIsLive(channel) {
    let isLive = false;
    const authToken = await tokenPromise;
    let response = await fetch(encodeURI(`https://api.twitch.tv/helix/search/channels?query=${channel}&first=1`), {
        headers: {
            "Authorization": `Bearer ${await authToken}`,
            "Client-Id": "pa669by8xti1oag6giphneaeykt6ln" 
        }
    });
    let data = await response.json();
    if ((data.data.length > 0) && data.data[0].is_live) {
        isLive = true;
    };
    return isLive;
};

async function fetchOAuth() {
    let response = await fetch("https://id.twitch.tv/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"client_id": "pa669by8xti1oag6giphneaeykt6ln", "client_secret": CLIENT_SECRET, "grant_type": "client_credentials"})
    });
    let data = await response.json();
    return data.access_token;
};
// TODO: record token time limit and only fetch if not stored

async function fetchUserID() {
    // Check if userID is stored locally
    const userID = await getStoredUserID();
    if (userID) {
        console.log("User ID found locally.");
        return userID;
    }

    // Fetch userID if not stored locally
    const authToken = await tokenPromise;
    let response = await fetch("https://api.twitch.tv/helix/users?login=tiltzer", {
        headers: {
            "Authorization": `Bearer ${authToken}`,
            "Client-Id": "pa669by8xti1oag6giphneaeykt6ln" 
        }
    });
    let data = await response.json();
    const fetchedUserID = data.data[0].id;
    // 1st data = promise, 2nd data = array of responses. Likely because this fetch can return multiple responses? Perhaps?
    await setStoredUserID(fetchedUserID);
    console.log("User ID fetched from Twitch API.");
    return fetchedUserID;
};


// GET/SET CHROME STORAGE

async function getFavorites() {
    const favorites = await new Promise(resolve => chrome.storage.local.get(['favorites'], resolve));
    console.log(await favorites);
    return favorites && favorites.favorites ? favorites.favorites : [];
};

async function addFavorite(favorite) {
    let favorites = await getFavorites();
    favorites.push(favorite);
    await chrome.storage.local.set({favorites});
};

async function removeFavorite(favorite) {
    let favorites = await getFavorites();
    const index = favorites.indexOf(favorite);
    if (index !== -1) {
        favorites.splice(index, 1);
        await chrome.storage.local.set({favorites});
    }
};

function getStoredUserID() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["userID"], (result) => {
            const userID = result.userID;
            resolve(userID);
        });
    });
};

function setStoredUserID(userID) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ userID: userID }, () => {
            resolve();
        });
    });
};


// LISTENERS

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
(async function () {
    console.log("message recieved: " + request);
    if (request === "fetchTwitchData") {
        const combinedList = await fetchCombinedList();
        sendResponse({
            success: true,
            followList: combinedList
        });
    } else if (request.type === "toggleFavorite") {
        const favorite = request.favorite.slice(0, -1);
        console.log(favorite);
        const combinedList = await toggleFavorite(favorite);
        sendResponse({success: true, combinedList});
    }
})();
        return true; // indicates that we will send the response asynchronously
});


// MISC FUNCTIONS

async function toggleFavorite(favorite) {
    const favorites = await getFavorites();
    const index = favorites.indexOf(favorite);
    if (index !== -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(favorite);
    }
    await chrome.storage.local.set({ favorites });
    return await fetchCombinedList();
}

function sortCaseInsensitive(arr) {
    return arr.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
};
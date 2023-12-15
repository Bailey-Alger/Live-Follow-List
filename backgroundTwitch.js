import { CLIENT_SECRET } from "./config.js";

const clientID = 'pa669by8xti1oag6giphneaeykt6ln';
const favName = "+";
const unFavName = "-";



async function fetchCombinedList() {
    let followList = await getStoredFollowList();
    console.log(followList);

    console.log(Date.now());
    var followTime = await getTimeLastFetched('fetchFollowList');
    if (!Array.isArray(followList) || (followTime === undefined) || ((Date.now() - 60000) > followTime)) {
        followList = await fetchFollowList();
    };
    
    console.log(followList);
    followList = sortCaseInsensitive(followList || []);
    const favorites = sortCaseInsensitive(await getFavorites()) || [];

    return [...favorites.filter(item => followList.includes(item)).map(item => item + unFavName), ...followList.filter(item => !favorites.includes(item)).map(item => item + favName)];
};

async function fetchFollowList() {
    console.log("Fetching follow list from twitch api.");
    const ID = await getStoredUserID();
    const authToken = await getStoredAccesstoken();
    console.log(ID);
    console.log(authToken);
    
    // get followlist
    let followList = [];
    let response = await fetch(`https://api.twitch.tv/helix/streams/followed?user_id=${ID}&first=100`, {
        headers: {
            "Authorization": `Bearer ${authToken}`,
            "Client-Id": "pa669by8xti1oag6giphneaeykt6ln" 
        }
    });
    let data = await response.json();
    console.log(data);
    let promises = data.data.map(async (item) => {
        console.log(item.user_name);
        followList.push(item.user_name);
    });
    await Promise.all(promises);
    console.log("follow list created");
    console.log(followList);
    setStoredFollowList(followList);
    setTimeLastFetched('fetchFollowList');
    return followList;
};



async function fetchTokenIsValid(token) {
    if(!token){return false};
    let response = await fetch("https://id.twitch.tv/oauth2/validate", {
        headers: {
            "Authorization": `OAuth ${token}`
        }
    });
    const isSuccessful = response.ok;
    return isSuccessful;
};

async function fetchUserID() {
    let response = await fetch("https://api.twitch.tv/helix/users", {
        headers: {
            "Authorization": `Bearer ${await getStoredAccesstoken()}`,
            "Client-ID": `${clientID}`
        }
    });
    if (response.ok) {
        let data = await response.json();
        console.log(data);
        console.log(data.data[0].id);
        return data.data[0].id;
    } else {console.error('user ID fetch denied')};
};


// GET/SET CHROME STORAGE

async function setTimeLastFetched(functName) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ [`${functName}`]: Date.now() }, () => {
            console.log(`Time set for ${functName}`);
            resolve();
        });
    });
};

async function getTimeLastFetched(functName) {
    return new Promise((resolve) => {
        chrome.storage.local.get([`${functName}`], (result) => {
            const timeStamp = result.timeStamp;
            console.log('Time last fetched: ', timeStamp);
            resolve(timeStamp);
        })
    })
}

async function getStoredAccesstoken() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["accessToken"], (result) => {
            const accessToken = result.accessToken;
            resolve(accessToken);
        })
    })
};

async function getFavorites() {
    const favorites = await new Promise(resolve => chrome.storage.local.get(['favorites'], resolve));
    console.log(await favorites);
    return favorites && favorites.favorites ? favorites.favorites : [];
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
            console.log("user ID stored.");
            resolve();
        });
    });
};


function getStoredFollowList() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["followList"], (result) => {
            const followList = result.followList;
            resolve(followList);
        });
    });
};

async function setStoredFollowList(followList) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ followList: followList }, () => {
            resolve();
        });
    });
};



// LISTENERS

chrome.runtime.onStartup.addListener(async function() {
    storedToken = await getStoredAccesstoken();
    if ( !(await fetchTokenIsValid(await storedToken)) ) {
        chrome.storage.local.remove(["fetchTokenIsValid"], function() {
            console.log("invalid token found in storage, removing validation time.");
        });
    } else { return };
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
(async function () {
    console.log("message recieved: ");
    console.log(request);
    if (request === "fetchTwitchData") {
        console.log(await getStoredAccesstoken());

        // this doesnt feel like the best way to do this but fk it we ball
        var tokenValidTime = await getTimeLastFetched('fetchTokenIsValid');
        var tokenIsValid;
        // about a week in milliseconds
        if ((!(await tokenValidTime)) || ((Date.now() - 600000000) > tokenValidTime)) {
            // eventually need to change so it refreshes the token through the twitch api after a week or so
            tokenIsValid = await fetchTokenIsValid(await getStoredAccesstoken());
            if (tokenIsValid) {
                setTimeLastFetched('fetchTokenIsValid')
            } else { console.log('invalid token') };
        } else { tokenIsValid = true };

        if ( tokenIsValid ) {
            const combinedList = await fetchCombinedList();
            sendResponse({
                success: true,
                followList: combinedList
            });
        } else {
            sendResponse({
                success: false
            });
        }
    } else if (await request.type === "toggleFavorite") {
        const favorite = request.favorite.slice(0, -1);
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
            setStoredUserID(await fetchUserID());
        } else if (!url.hash && url.search) {
            console.log(url.search);
        } else {
            console.log('unknown error');
        };
    };
})();
        return true; // indicates that we will send the response asynchronously
});


// MISC FUNCTIONS

async function toggleFavorite(favorite) {
    console.log("toggling favorite");
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
    console.log("Sorting: ", arr);
    return arr.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
};
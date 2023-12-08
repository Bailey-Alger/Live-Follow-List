import { CLIENT_SECRET } from "./config.js";

var tokenPromise = getStoredAccesstoken();
var userID = getStoredUserID();
const clientId = 'pa669by8xti1oag6giphneaeykt6ln';
const favName = "+";
const unFavName = "-";
console.log(fetchCombinedList());

// chrome.identity.launchWebAuthFlow({
//     url: 'https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=pa669by8xti1oag6giphneaeykt6ln&redirect_uri=https://cpoaimdmdpkehkijhkidhdlacmogedel.chromiumapp.org&scope=user%3Aread%3Afollows',
//     interactive: true
// },
//
// function(redirect_url){
//     console.log(redirect_url);
// });

// FETCHES

async function fetchCombinedList() {
    let followList = await getStoredFollowList();
    console.log(followList);
    if (!Array.isArray(followList)) {
        followList = await fetchFollowList();
    } else if ((Date.now() - 60000) > getTimeLastFetched()) {
        followList = await fetchFollowList();
    }; // calls fetchFollowList if it has been more than a minute since the list was last updated
    
    console.log(followList);
    followList = sortCaseInsensitive(followList || []);
    const favorites = sortCaseInsensitive(await getFavorites()) || [];

    return [...favorites.filter(item => followList.includes(item)).map(item => item + unFavName), ...followList.filter(item => !favorites.includes(item)).map(item => item + favName)];
};

async function fetchFollowList() {
    console.log("Fetching follow list from twitch api.");
    const ID = await userID;
    const authToken = await tokenPromise;
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
    // let promises = data.data.map(async (item) => {
    //     let isLive = await fetchIsLive(item.to_name);
    //     if (isLive) {
    //         console.log(item.to_name);
    //         followList.push(item.to_name);
    //     };
    // })
    // await Promise.all(promises);
    let promises = data.data.map(async (item) => {
        console.log(item.user_name);
        followList.push(item.user_name);
    });
    await Promise.all(promises);
    console.log("follow list created");
    console.log(followList);
    setStoredFollowList(followList);
    setTimeLastFetched();
    return followList;
};

// async function fetchIsLive(channel) {
//     let isLive = false;
//     const authToken = await tokenPromise;
//     let response = await fetch(encodeURI(`https://api.twitch.tv/helix/search/channels?query=${channel}&first=1`), {
//         headers: {
//             "Authorization": `Bearer ${await authToken}`,
//             "Client-Id": "pa669by8xti1oag6giphneaeykt6ln" 
//         }
//     });
//     let data = await response.json();
//     console.log(data);
//     if ((data.data.length > 0) && data.data[0].is_live) {
//         isLive = true;
//     };
//     return isLive;
// };

// async function fetchOAuth() {
//     const token = await getStoredOAuth();
//     console.log(token);
//     if (await fetchTokenIsValid(token)){
//         return token;
//     };

//     let response = await fetch("https://id.twitch.tv/oauth2/token", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({"client_id": "pa669by8xti1oag6giphneaeykt6ln", "client_secret": CLIENT_SECRET, "grant_type": "client_credentials"})
//     });
//     let data = await response.json();
//     setStoredOAuth(data.access_token);
//     return data.access_token;
// };

// async function fetchUserID() {
//     // Check if userID is stored locally
//     const userID = await getStoredUserID();
//     if (userID) {
//         console.log("User ID found locally.");
//         return userID;
//     }

//     // Fetch userID if not stored locally
//     const authToken = await tokenPromise;
//     let response = await fetch("https://api.twitch.tv/helix/users?login=tiltzer", {
//         headers: {
//             "Authorization": `Bearer ${authToken}`,
//             "Client-Id": "pa669by8xti1oag6giphneaeykt6ln" 
//         }
//     });
//     let data = await response.json();
//     const fetchedUserID = data.data[0].id;
//     // 1st data = promise, 2nd data = array of responses. Likely because this fetch can return multiple responses? Perhaps?
//     await setStoredUserID(fetchedUserID);
//     console.log("User ID fetched from Twitch API.");
//     return fetchedUserID;
// };

async function fetchTokenIsValid(token) {
    let response = await fetch("https://id.twitch.tv/oauth2/validate", {
        headers: {
            "Authorization": `OAuth ${token}`
        }
    });
    //const statusCode = response.status;
    const isSuccessful = response.ok;
    if (isSuccessful) {
        userID = response.user_id;
        setStoredUserID(response.user_id);
    };
    return isSuccessful;
};


// GET/SET CHROME STORAGE

async function setTimeLastFetched() {
    return new Promise((resolve) => {
        chrome.storage.local.set({ timeStamp: Date.now() }, () => {
            console.log("Time set");
            resolve();
        });
    });
};

async function getTimeLastFetched() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["timeStamp"], (result) => {
            const timeStamp = result.timeStamp;
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
            console.log("user ID stored.");
            resolve();
        });
    });
};

// function getStoredOAuth() {
//     return new Promise((resolve) => {
//         chrome.storage.local.get(["token"], (result) => {
//             const token = result.token;
//             resolve(token || "Missing_Token");
//         });
//     });
// };

// function setStoredOAuth(token) {
//     return new Promise((resolve) => {
//         chrome.storage.local.set({ token: token }, () => {
//             resolve();
//         });
//     });
// };

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
    }).then(() => {
        chrome.alarms.clear("fetchFollow");
        chrome.alarms.create("fetchFollow", { delayInMinutes: 1 });
        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === "fetchFollow") {
                fetchFollowList();
            }
        });
    });
};



// LISTENERS



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
(async function () {
    console.log("message recieved: ");
    console.log(request);
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

    } else if (request.type === "OAuthURL") {
        var url = new URL(request.url.slice(0,-1));
        console.log(url);
        console.log(url.hash);
        if (url.hash && !url.search) {
            const accessToken = url.hash.slice(14, url.hash.indexOf('&'));
            console.log(accessToken);
            chrome.storage.local.set({ accessToken });
            fetchTokenIsValid(accessToken);
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

// async function toggleFavorite(favorite) {
//     const favorites = await getFavorites();
//     const index = favorites.indexOf(favorite);
//     if (index !== -1) {
//         favorites.splice(index, 1);
//     } else {
//         favorites.push(favorite);
//     }
//     await chrome.storage.local.set({ favorites });
//     return await fetchCombinedList();
// }

function sortCaseInsensitive(arr) {
    console.log("Sorting: ", arr);
    return arr.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
};
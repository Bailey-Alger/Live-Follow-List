import { CLIENT_SECRET } from "./config.js";

const tokenPromise = fetchOAuth();
const userID = fetchUserID();
const clientId = 'pa669by8xti1oag6giphneaeykt6ln';
const redirectUri = chrome.identity.getRedirectURL();

chrome.identity.launchWebAuthFlow({
    'url': `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=user:read:follows`,
    'interactive': true
}, function(redirectUrl) {
    // Handle the redirect URL containing the authorization code
    if (redirectUrl && redirectUrl.match(/access_token=([^&]+)/)) {
        const userAccessToken = redirectUrl.match(/access_token=([^&]+)/)[1];
    } else {
        console.error('redirectUrl error');
        console.log(redirectUrl);
    }
    chrome.storage.local.set({userAccessToken: userAccessToken}, function() {
        console.log('User access token is stored');
    });
});

function getStoredUserAccessToken() {
    chrome.storage.local.get(['userAccessToken'], function(result) {
        console.log('User access token is retrieved', result.userAccessToken);
      });
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
    for (var i = 0; i < data.data.length; i++){
        let isLive = await fetchIsLive(data.data[i].to_name);
        if (isLive) {
            console.log(data.data[i].to_name);
            // console.log(isLive);
            followList.push(data.data[i].to_name);
        };
    };
    console.log("follow list created");
    return followList;
};

async function fetchIsLive(channel) {
    let isLive = false;
    const authToken = await tokenPromise;
    let response = await fetch(encodeURI(`https://api.twitch.tv/helix/search/channels?query=${channel}&first=1`), {
        headers: {
            "Authorization": `Bearer ${authToken}`,
            "Client-Id": "pa669by8xti1oag6giphneaeykt6ln" 
        }
    });
    let data = await response.json();
    // console.log(data);
    if ((data.data.length > 0) && data.data[0].is_live) {
        // console.log(data.data[0].is_live);
        isLive = true;
    };
    return isLive;
};


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
(async function () {
    console.log("message recieved: " + request);
    if (request === "fetchData") {
        const respFollowList = await fetchFollowList();
        sendResponse({
            success: true,
            followList: respFollowList
        });
    }
})();
        return true; // indicates that we will send the response asynchronously
});


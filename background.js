import { CLIENT_SECRET } from "./config.js";

const tokenPromise = fetchOAuth();

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

async function fetchUserID() {
    // Check if userID is stored locally
    const userID = await getStoredUserID();
    if (userID) {
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
    return fetchedUserID;
};

function getStoredUserID() {
    return new Promise((resolve) => {
      chrome.storage.local.get(["userID"], (result) => {
        const userID = result.userID;
        resolve(userID);
      });
    });
  }
  
  function setStoredUserID(userID) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ userID: userID }, () => {
        resolve();
      });
    });
  }


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
(async function () {
    console.log("message recieved: " + request);
    if (request === "fetchData") {
        const rUserID = await fetchUserID();
        const token = await tokenPromise;
        sendResponse({
            success: true,
            token: token,
            userID: rUserID
        });
    }
})();
        return true; // indicates that we will send the response asynchronously
});
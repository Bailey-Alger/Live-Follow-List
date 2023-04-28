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
    const authToken = await tokenPromise;
    let response = await fetch("https://api.twitch.tv/helix/users?login=tiltzer", {
        headers: {
            "Authorization": `Bearer ${authToken}`,
            "Client-Id": "pa669by8xti1oag6giphneaeykt6ln" 
        }
    });
    let data = await response.json();
    return data.data[0].id;
    // 1st data = promise, 2nd data = array of responses. Likely because this fetch can return multiple responses? Perhaps?
};

// const userIDPromise = fetchUserID();

// async function main() {
//     const token = await tokenPromise;
//     const userID = await userIDPromise;
//     console.log(token);
//     console.log(userID);
// };

// let followList = fetch(`https://api.twitch.tv/helix/users/follows?from_id=${userID}&first=100`).then((response) => response.json()).then((json) => console.log(json))

chrome.runtime.onMessage.addListener(async function(message, sender, sendResponse) {
    console.log("message recieved: " + message);
    if (message === "fetchData") {
        const token = await tokenPromise;
        const userID = await fetchUserID();
        console.log(token);
        console.log(userID);
        sendResponse({
            success: true,
            token: token,
            userID: userID
        });
        return true; // indicates that we will send the response asynchronously
    }
});
// TODO: response port is timing out.

// main();
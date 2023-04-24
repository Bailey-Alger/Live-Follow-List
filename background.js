require('dotenv').config();
async function fetchOAuth() {
    let response = await fetch("https://id.twitch.tv/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"client_id": "pa669by8xti1oag6giphneaeykt6ln", "client_secret": process.env.CLIENT_SECRET, "grant_type": "client_credentials"})
    });
    let data = await response.json();
    return data.access_token;
};

const tokenPromise = fetchOAuth();
const userIDPromise = fetchUserID();

async function main() {
    const token = await tokenPromise;
    const userID = await userIDPromise;
    console.log(token);
    console.log(userID);
};
main();

async function fetchUserID() {
    const authToken = await tokenPromise;
    let response = await fetch("https://api.twitch.tv/helix/users?login=tiltzer", {
        headers: {
            "Authoraization": `Bearer ${authToken}`,
            "Client-Id": "pa669by8xti1oag6giphneaeykt6ln" 
        }
    });
    let data = await response.json();
    return data.id;
};

// let followList = fetch(`https://api.twitch.tv/helix/users/follows?from_id=${userID}&first=100`).then((response) => response.json()).then((json) => console.log(json))

chrome.runtime.onMessage.addListener(async function(message, sender, sendResponse) {
    if (message === "fetchData") {
        const token = await fetchOAuth();
        const userID = await fetchUserID(token);
        sendResponse({ token, userID });
    }
});
  
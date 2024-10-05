// import { setStoredFollowList, setTimeLastFetched, getStoredAccessToken } from "../background_twitch/chromeStorage.js";

// replace with static assigned ID once uploaded to chrome store

export async function fetchYTList(authToken) {
    console.log(authToken);

    console.log("Fetching YouTube sub list from Youtube API");
    let followList = [];
    let response = await fetch("https://www.googleapis.com/youtube/v3/subscriptions?part=snippet,contentDetails&mine=true&maxResults=50", {
        headers: {
            "Authorization": `Bearer ${authToken}`,
            "Accept": "application/json"
        }
    });
    if (response.ok) {
        let data = await response.json();
        console.log(data);
    } else {
        console.log(response);
    }
}
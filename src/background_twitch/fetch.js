import { CLIENT_SECRET } from "../../config.js";
import { setStoredFollowList, setTimeLastFetched, getStoredAccessToken } from "./chromeStorage.js";
// replace with static assigned ID once uploaded to chrome store
const clientID = 'pa669by8xti1oag6giphneaeykt6ln';

export async function fetchFollowList(ID, authToken) {
    // const ID = await getStoredUserID();
    // const authToken = await getStoredAccessToken();
    console.log(ID);
    console.log(authToken);
    
    console.log("Fetching follow list from twitch api.");
    // get followlist
    let followList = [];
    let response = await fetch(`https://api.twitch.tv/helix/streams/followed?user_id=${ID}&first=100`, {
        headers: {
            "Authorization": `Bearer ${authToken}`,
            "Client-Id": "pa669by8xti1oag6giphneaeykt6ln" 
        }
    });
    if (response.ok){
        let data = await response.json();
        console.log(data);
        let promises = data.data.map(async (item) => {
            console.log(item);
            followList.push(item);
        });
        await Promise.all(promises);
        console.log("follow list created");
        console.log(followList);
        setStoredFollowList(followList);
        setTimeLastFetched('fetchFollowList');
        return followList;
    } else { return false };
};



export async function fetchTokenIsValid(token) {
    let isSuccessful = false;
    try { 
        if(!token){return false};
        let response = await fetch("https://id.twitch.tv/oauth2/validate", {
            headers: {
                "Authorization": `OAuth ${token}`
            }
        });
        console.log(response);
        isSuccessful = (response.status == 200)
        if (isSuccessful) {
            setTimeLastFetched('fetchTokenIsValid');
        } else {
            console.log(response.status);
        }
    } catch (error) {
        console.error(error);
    } finally {
        return isSuccessful;
    }
};

export async function fetchUserID() {
    let response = await fetch("https://api.twitch.tv/helix/users", {
        headers: {
            "Authorization": `Bearer ${await getStoredAccessToken()}`,
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


// async function tokenValidator() {
//     let tokenIsValid;
//     let token = await getStoredAccessToken();
//     if (token) {
//         tokenIsValid = await fetchTokenIsValid(await token);
//     } else { tokenIsValid = false };
//     console.log("token valid?", tokenIsValid);
//     return tokenIsValid;
// };
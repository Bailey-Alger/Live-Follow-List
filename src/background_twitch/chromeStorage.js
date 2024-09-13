export async function setTimeLastFetched(functName) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ [`${functName}`]: Date.now() }, () => {
            // console.log(`Time set for ${functName}`);
            resolve();
        });
    });
};

export async function getTimeLastFetched(functName) {
    return new Promise((resolve) => {
        chrome.storage.local.get([`${functName}`], (result) => {
            const timeStamp = result[functName];
            // console.log('Time last fetched for', functName, timeStamp);
            resolve(timeStamp);
        })
    })
}

export async function getStoredAccessToken() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["accessToken"], (result) => {
            const accessToken = result.accessToken;
            resolve(accessToken);
        })
    })
};

export async function getFavorites() {
    const favorites = await new Promise(resolve => chrome.storage.local.get(['favorites'], resolve));
    // console.log(await favorites);
    return favorites && favorites.favorites ? favorites.favorites : [];
};


export function getStoredUserID() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["userID"], (result) => {
            const userID = result.userID;
            resolve(userID);
        });
    });
};

export function setStoredUserID(userID) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ userID: userID }, () => {
            // console.log("user ID stored.");
            resolve();
        });
    });
};


export function getStoredFollowList() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["followList"], (result) => {
            const followList = result.followList;
            resolve(followList);
        });
    });
};

export async function setStoredFollowList(followList) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ followList: followList }, () => {
            resolve();
        });
    });
};


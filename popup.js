chrome.runtime.sendMessage("fetchData", async function(response) {
    if (response && response.token && response.userID) {
        console.log(response.token);
        console.log(response.userID);
    } else {
        console.error("Error retrieving data from background script");
    }
});
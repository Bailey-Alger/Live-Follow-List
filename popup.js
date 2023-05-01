chrome.runtime.sendMessage("fetchData", async function(response) {
    if (response && response.followList) {
        console.log("response successful");
        console.log(response.followList);
    } else {
        console.error("Error retrieving data from background script");
    }
});
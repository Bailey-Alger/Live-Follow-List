console.log("content script is working");

chrome.runtime.sendMessage("fetchData", function(response) {
    console.log(response.token);
    console.log(response.userID);
});

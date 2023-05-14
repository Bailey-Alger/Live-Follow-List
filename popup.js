chrome.runtime.sendMessage("fetchTwitchData", async function(response) {
    if (response && response.followList) {
        console.log("response successful");
        console.log(response.followList);

        const followList = sortCaseInsensitive(response.followList);
        let twitchList = document.getElementById("twitchList");
        console.log(followList);
        followList.forEach((item) => {
            let li = document.createElement("li");
            li.innerText = item;
            twitchList.appendChild(li);
        });
        
    } else {
        console.error("Error retrieving data from background script");
    }
});

function sortCaseInsensitive(arr) {
    return arr.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }
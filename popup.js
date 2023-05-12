chrome.runtime.sendMessage("fetchData", async function(response) {
    if (response && response.followList) {
        console.log("response successful");
        console.log(response.followList);

        const followList = response.followList;
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


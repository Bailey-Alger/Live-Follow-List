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
            let favoriteButton = document.createElement("button");
            favoriteButton.innerText = "Favorite";
            favoriteButton.addEventListener("click", function() {
                toggleFavorite(item, favoriteButton);
            });

            li.appendChild(favoriteButton);
            twitchList.appendChild(li);
        });
        
    } else {
        console.error("Error retrieving data from background script");
    }
});

function orderListByFavorites() {
    chrome.storage.local.get("favorites", function(data) {
        let favorites = data.favorites || [];
        let twitchList = document.getElementById("twitchList");
        let listItems = Array.from(twitchList.getElementsByTagName("li"));
        listItems.sort(function(a, b) {
            if (favorites.includes(a.innerText)) {
            return -1;
            } else if (favorites.includes(b.innerText)) {
            return 1;
            } else {
            return 0;
            }
        });
        listItems.forEach(function(li) {
            twitchList.appendChild(li);
        });
    });
};

function toggleFavorite(item, favoriteButton) {
    chrome.runtime.sendMessage({ type: "toggleFavorite", favorite: item }, function(response) {
        if (response && response.success) {
            if (favoriteButton.addEventListener === "Favorite") {
                favoriteButton.innerText = "Unfavorite";
            } else {
                favoriteButton.innerText = "Favorite";
            }
            orderListByFavorites();
        } else {
            console.error("Error toggling favorite");
        }
    });
};
  

function sortCaseInsensitive(arr) {
    return arr.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
};

chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (changes.favorites) {
        orderListByFavorites();
    }
});
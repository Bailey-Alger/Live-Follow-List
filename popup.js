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
                addFavorite(item);
            });
            li.appendChild(favoriteButton);
            twitchList.appendChild(li);
        });
        
    } else {
        console.error("Error retrieving data from background script");
    }
});

function addFavorite(item) {
    chrome.storage.local.get("favorites", function(data) {
        let favorites = data.favorites || [];
        favorites.push(item);
        chrome.storage.local.set({favorites: favorites}, function() {
            // Handle updating the UI to show the new favorites list
        });
    });
};

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

function updateFavoritesList(favorites) {
    // Get the list element and clear its contents
    const list = document.getElementById('twitchList');
    list.innerHTML = '';

    // Add the favorite items to the top of the list
    favorites.forEach((item) => {
    const li = document.createElement('li');
    li.innerText = item;

    // Add a button to remove the item from favorites
    const removeButton = document.createElement('button');
    removeButton.innerText = 'Remove';
    removeButton.addEventListener('click', () => {
        removeFavorite(item);
        updateFavoritesList(favorites);
    });
    li.appendChild(removeButton);

    list.appendChild(li);
    });

    // Add the non-favorite items to the bottom of the list
    twitchList.forEach((item) => {
    if (!favorites.includes(item)) {
        const li = document.createElement('li');
        li.innerText = item;

        // Add a button to add the item to favorites
        const addButton = document.createElement('button');
        addButton.innerText = 'Favorite';
        addButton.addEventListener('click', () => {
        addFavorite(item);
        updateFavoritesList(favorites);
        });
        li.appendChild(addButton);

        list.appendChild(li);
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
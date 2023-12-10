const favName = "+";
const unFavName = "-";
const extID = chrome.runtime.id;
const loginTwitch = document.querySelector('#loginTwitch');



window.onload = function() {
    fetchTwitchData();
}


function onLoginTwitchClick() {
    chrome.identity.launchWebAuthFlow({
        url: `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=pa669by8xti1oag6giphneaeykt6ln&redirect_uri=https%3A%2F%2F${extID}.chromiumapp.org&scope=user%3Aread%3Afollows`,
        interactive: true
    },
    function(redirect_url){
        console.log(redirect_url);
        sendOAuthURL(redirect_url);
    })
    console.log("url sent to background script");
    loginClicked = true;
    setTimeout(() => {
        fetchTwitchData();
    }, 2000)
};

loginTwitch.addEventListener('click', onLoginTwitchClick);

// console.log(document.location.hash);

async function fetchTwitchData(){
    chrome.runtime.sendMessage("fetchTwitchData", async function(response) {
        if (response && response.followList) {
            console.log("response successful");
            console.log(response.followList);

            // const followList = sortCaseInsensitive(response.followList);
            const followList = response.followList;

            let twitchList = document.getElementById("twitchList");

            console.log(followList);
            
            while (twitchList.firstChild) {
                twitchList.removeChild(twitchList.firstChild);
            };

            followList.forEach((item) => {
                let li = document.createElement("li");
                li.innerText = item.slice(0, -1);
                if (li.querySelector("button") == null) {
                    let favoriteButton = document.createElement("button");
                    if (item[item.length - 1] == "-"){
                        favoriteButton.innerText = unFavName;
                    } else {
                        favoriteButton.innerText = favName;
                    }
                    favoriteButton.addEventListener("click", function() {
                        toggleFavorite(item, favoriteButton);
                    });
                    li.appendChild(favoriteButton);               
                };
                twitchList.appendChild(li);
            });
            // orderListByFavorites();
            
        } else {
            console.log(response);
        }
    });
};

// function orderListByFavorites() {
//     chrome.storage.local.get("favorites", function(data) {
//         let favorites = data.favorites || [];
//         let twitchList = []; //change

//         // listItems.sort(function(a, b) {
//         //     if (favorites.includes(a.innerText)) {
//         //         console.log(a.innerText, "-1");
//         //         return -1;
//         //     } else if (favorites.includes(b.innerText)) {
//         //         console.log(a.innerText, "1");
//         //         return 1;
//         //     } else {
//         //         console.log(a.innerText, "0");
//         //         return 0;
//         //     }
//         // });

//         console.log(listItems);

//         while (twitchList.firstChild) {
//             twitchList.removeChild(twitchList.firstChild);
//         }
//         console.log(twitchList);

//         listItems.forEach(function(li) {
//             let itemText = li.innerText;

//             let favoriteButton = li.querySelector("button");

//             if (!favoriteButton) {
//                 favoriteButton = document.createElement("button");
//                 favoriteButton.addEventListener("click", function() {
//                     toggleFavorite(itemText, favoriteButton);
//                 });
//                 li.appendChild(favoriteButton);
//             }

//             if (favorites.includes(itemText)) {
//                 favoriteButton.innerText = unFavName;
//             } else {
//                 favoriteButton.innerText = unFavName;
//             }

//             twitchList.appendChild(li);
//         });
//     });
// };

function toggleFavorite(item, favoriteButton) {
    chrome.runtime.sendMessage({ type: "toggleFavorite", favorite: item }, function(response) {
        if (response && response.success) {
            if (favoriteButton.innerText === favName) {
                favoriteButton.innerText = unFavName;
            } else {
                favoriteButton.innerText = favName;
            }
            console.log("Favorite toggled");
            fetchTwitchData();
        } else {
            console.error("Error toggling favorite");
        }
    });
};
  
function sendOAuthURL(url){
    chrome.runtime.sendMessage({ type: 'OAuthURL', url})
};

function sortCaseInsensitive(arr) {
    return arr.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
};

// chrome.storage.onChanged.addListener(function(changes, namespace) {
//     if (changes.favorites) {
        
//         orderListByFavorites();
//     }
// });
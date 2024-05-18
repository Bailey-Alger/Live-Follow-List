import { useEffect, useState } from "react";

async function twitchDataFetcher() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage("fetchTwitchData", function (response) {
            if (response && response.followList) {
                console.log("response successful");
                console.log(response.followList);
                resolve(response.followList);
            } else {
                console.log(response);
                reject(new Error("Failed to fetch Twitch data"));
            }
        });
    });
}

async function toggleFav(item) {
    chrome.runtime.sendMessage(
        { type: "toggleFavorite", favorite: item },
        function (response) {
            if (response && response.success) {
                console.log("favorite toggled");
            } else {
                console.error("Error toggling favorite");
            }
        }
    );
}

function TwitchFollowList() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function fetchData() {
        try {
            const data = await twitchDataFetcher();
            console.log("37", data);
            if (data == undefined || false) {
                throw new Error("failed to fetch data from twitchDataFetcher");
            }
            setData(data);
            setLoading(false);
            console.log("data at twitchFollowList:", data);
        } catch (error) {
            setError(error);
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);
    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    // togglefav might need the item.user_name vvv
    return (
        <div>
            <ol>
                {data.map((item) => (
                    <li key={item.user_name}>
                        {item.user_name}{" "}
                        <button
                            onClick={() => {
                                toggleFav(item.user_name);
                                fetchData();
                            }}
                        >
                            {item.isFavorite ? "-" : "+"}
                        </button>
                    </li>
                ))}
            </ol>
        </div>
    );
}

export default TwitchFollowList;

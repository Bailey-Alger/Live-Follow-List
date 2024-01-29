import { useEffect, useState } from "react";

async function twitchDataFetcher() {
    chrome.runtime.sendMessage("fetchTwitchData", async function (response) {
        if (response && response.followList) {
            console.log("response successful");
            console.log(response.followList);
            return response.followList;
        } else {
            console.log(response);
        }
    });
}

async function toggleFav(item) {
    chrome.runtime.sendMessage(
        { type: "toggleFavorite", favorite: item },
        function (response) {
            if (response && response.success) {
                console.log("favorite toggled");
            } else {
                console.error("Error toggline favorite");
            }
        }
    );
}

function TwitchFollowList() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await twitchDataFetcher();
                setData(data);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        }

        fetchData();
    }, []);
    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div>
            <ol>
                {data.map((item) => (
                    <li key={item}>
                        {item}{" "}
                        <button
                            onClick={() => {
                                toggleFav();
                            }}
                        >
                            {item.isFav ? "-" : "+"}
                        </button>
                    </li>
                ))}
            </ol>
        </div>
    );
}

export default TwitchFollowList;

import { useEffect, useState } from "react";

async function ytDataFetcher() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage("fetchYTData", function (response) {
            if (response && response.followList) {
                console.log("response successful");
                console.log(response.followList);
                resolve(response.followList);
            } else {
                console.log(response);
                reject(new Error("Failed to fetch YouTube data"));
            }
        });
    });
}

async function toggleFav(item) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { type: "toggleFavorite", favorite: item },
            function (response) {
                if (response && response.followList) {
                    console.log("favorite toggled");
                    console.log(response.followList);
                    resolve(response.followList);
                } else {
                    console.log(response);
                    reject(new Error("Error toggling favorite"));
                }
            }
        );
    });
}

function YTFollowList() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function fetchRouter(item) {
        try {
            const data =
                item == undefined
                    ? await ytDataFetcher()
                    : await toggleFav(item);
            console.log("37", data);
            if (data == undefined || false) {
                throw new Error("failed to fetch data from ytDataFetcher");
            }
            setData(data);
            setLoading(false);
            console.log("data at ytFollowList:", data);
        } catch (error) {
            setError(error);
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchRouter();
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
                    <li key={item.user_name}>
                        {item.user_name}{" "}
                        <button
                            onClick={() => {
                                fetchRouter(item.user_name);
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

export default YTFollowList;

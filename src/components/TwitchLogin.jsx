import { useState } from "react";

const extID = chrome.runtime.id;

function sendOAuthURL(url) {
    chrome.runtime.sendMessage({ type: "OAuthURL", url });
}

// implicit grant flow
function TwitchLogin() {
    const [loginClicked, setLoginClicked] = useState(false);
    return (
        <>
            <button
                onClick={() => {
                    chrome.identity.launchWebAuthFlow(
                        {
                            url: `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=pa669by8xti1oag6giphneaeykt6ln&redirect_uri=https%3A%2F%2F${extID}.chromiumapp.org&scope=user%3Aread%3Afollows`,
                            interactive: true,
                        },
                        function (redirect_url) {
                            console.log(redirect_url);
                            sendOAuthURL(redirect_url);
                        }
                    );
                    console.log("url sent to background script");
                    setLoginClicked(true);
                }}
            >
                Login with Twitch
            </button>
        </>
    );
}
// make signout button?

export default TwitchLogin;

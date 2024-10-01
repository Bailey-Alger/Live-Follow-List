import { useState } from "react";

const extID = chrome.runtime.id;
// write function to send oauthurl to background script
function sendYouTubeOAuthURL(url) {
    chrome.runtime.sendMessage({ type: "YTOAuthURL", url });
}

function YTLogin() {
    const [loginClicked, setLoginClicked] = useState(false);
    return (
        <>
            <button
                onClick={() => {
                    chrome.identity.launchWebAuthFlow(
                        {
                            url: `https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A//www.googleapis.com/auth/youtube.readonly&response_type=token&redirect_uri=https%3A%2F%2Fmfbjnbjkagdjedgknpmmhdgkoiegmnkc.chromiumapp.org&client_id=41485212886-3c175931jm9p7b95l7spghnvc5kfntg8.apps.googleusercontent.com`,
                            interactive: true,
                        },
                        function (redirect_url) {
                            console.log(redirect_url);
                            sendYouTubeOAuthURL(redirect_url);
                        }
                    );
                    console.log("url sent to background script");
                    setLoginClicked(true);
                }}
            >
                Login with YouTube
            </button>
        </>
    );
}
// make signout button?

export default YTLogin;

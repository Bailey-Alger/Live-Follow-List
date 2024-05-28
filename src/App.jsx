import { Link, Route, Routes } from "react-router-dom";
import Twitch from "./components/Twitch";
import { Settings } from "./components/Settings";

function App() {
    return (
        <>
            <nav>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/settings">Settings</Link>
                    </li>
                </ul>
            </nav>

            <Routes>
                <Route path="/" element={<Twitch />} />
                <Route path="popup.html" element={<Twitch />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </>
    );
}
// not sure if popup.html is the best way to route this by default

export default App;

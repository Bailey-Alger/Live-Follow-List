import * as storage from '../background_twitch/chromeStorage.js';
import * as ytAPI from './ytFetch.js';

export async function ytListAssembler() {
    const token = await storage.getStoredAccessToken("ytToken");
    console.log(token);
    ytAPI.fetchYTList(token);
}
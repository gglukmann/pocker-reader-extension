import __consumer_key from '../../../env.js';
import { authService } from './index.js';
import pocket from '../App.js';
import * as helpers from '../utils/helpers.js';
import * as globals from '../utils/globals.js';

class ApiService {
    /**
     * @constructor
     */
    constructor() {
        this._fetchData = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF8',
            },
        };
    }

    /**
     * Get data from pocket api.
     *
     * @function get
     * @return {Promise} - Response from pocket api.
     */
    get() {
        this._fetchData.body = {
            access_token: authService.getToken(),
            consumer_key: __consumer_key,
            detailType: 'complete',
        };

        let state;

        switch (pocket.getActivePage()) {
            case globals.PAGES.LIST:
                const listSince = helpers.getFromStorage('listSince');

                if (listSince) {
                    this._fetchData.body.since = listSince;
                } else {
                    state = 'unread';
                }
                break;
            case globals.PAGES.ARCHIVE:
                if (pocket.isArchiveLoaded()) {
                    this._fetchData.body.since = helpers.getFromStorage('archiveSince');
                } else {
                    state = 'archive';
                }
                break;
        }

        this._fetchData.body.state = this._fetchData.body.since ? 'all' : state;

        if (pocket.fullSync) {
            this._fetchData.body.since = null;

            switch (pocket.getActivePage()) {
                case globals.PAGES.LIST:
                    this._fetchData.body.state = 'unread';
                    break;
                case globals.PAGES.ARCHIVE:
                    this._fetchData.body.state = 'archive';
                    break;
            }
        }

        this._fetchData.body = JSON.stringify(this._fetchData.body);

        try {
            return helpers.makeFetch(globals.API.url_get, this._fetchData);
        } catch (error) {
            console.log(error);
            helpers.showMessage(chrome.i18n.getMessage('ERROR_GETTING_CONTENT'), false);

            if (error.response.status === 401) {
                pocket.logout();
            }
        }
    }

    /**
     * Make actions.
     *
     * @function send
     * @param {Array} actions - Array of current action data.
     * @return {Promise} - Response from pocket api.
     */
    send(actions) {
        this._fetchData.body = JSON.stringify({
            access_token: authService.getToken(),
            consumer_key: __consumer_key,
            actions: actions,
        });

        try {
            return helpers.makeFetch(globals.API.url_send, this._fetchData);
        } catch (error) {
            console.error(error);
            helpers.showMessage(chrome.i18n.getMessage('ACTION'), false);

            if (error.response.status === 401) {
                pocket.logout();
            }
        }
    }

    /**
     * Add new item to Pocket.
     *
     * @function add
     * @param {Object} data - New item object.
     * @return {Promise} - Response from pocket api.
     */
    add(data) {
        this._fetchData.body = JSON.stringify({
            access_token: authService.getToken(),
            consumer_key: __consumer_key,
            url: data.url,
        });

        try {
            return helpers.makeFetch(globals.API.url_add, this._fetchData);
        } catch (error) {
            console.error(error);
            helpers.showMessage(chrome.i18n.getMessage('ERROR_ADDING'), false);

            if (error.response.status === 401) {
                pocket.logout();
            }
        }
    }
}

const apiService = new ApiService();
export default apiService;

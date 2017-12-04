'use strict';

class ApiService {
    /**
     * @constructor
     */
    constructor() {
        this._fetchData = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF8'
            }
        }
    }

    /**
     * Get data from pocket api.
     *
     * @function get
     * @param {String} state - List type to get.
     * @return {Promise} - Response from pocket api.
     */
    async get() {
        this._fetchData.body = {
            access_token: authService.getToken(),
            consumer_key: __consumer_key,
            detailType: 'complete'
        };

        let state;

        switch (pocket.getActivePage()) {
            case 'list':
                if (localStorage.getItem('listSince')) {
                    this._fetchData.body.since = localStorage.getItem('listSince');
                } else {
                    state = 'unread';
                }
            break;
            case 'archive':
                if (pocket.isArchiveLoaded()) {
                    this._fetchData.body.since = localStorage.getItem('archiveSince');
                } else {
                    state = 'archive';
                }
            break;
        }

        this._fetchData.body.state = this._fetchData.body.since ? 'all' : state;
        this._fetchData.body = JSON.stringify(this._fetchData.body);

        let data = await helper.makeFetch(API.url_get, this._fetchData)
            .then(response => response.json())
            .catch(error => {
                console.log(error);
                helper.showMessage(chrome.i18n.getMessage('ERROR_GETTING_CONTENT'), false);
            });

        return data;
    }

    /**
     * Make actions
     *
     * @function send
     * @param {Array} actions - Array of current action data.
     * @return {Promise} - Response from pocket api.
     */
    async send(actions) {
        this._fetchData.body = JSON.stringify({
            access_token: authService.getToken(),
            consumer_key: __consumer_key,
            actions: actions
        });

        let action = await helper.makeFetch(API.url_send, this._fetchData)
            .then(response => response.json())
            .catch(error => {
                console.log(error);
                helper.showMessage(chrome.i18n.getMessage('ACTION'), false);
            });

        return action;
    }

    /**
     * Add new item to Pocket.
     *
     * @function add
     * @param {Object} data - New item object.
     * @return {Promise} - Response from pocket api.
     */
    async add(data) {
        this._fetchData.body = JSON.stringify({
            access_token: authService.getToken(),
            consumer_key: __consumer_key,
            url: data.url
        });

        let add = await helper.makeFetch(API.url_add, this._fetchData)
            .then(response => response.json())
            .catch(error => {
                console.log(error);
                helper.showMessage(chrome.i18n.getMessage('ERROR_ADDING'), false);
            });

        return add;
    }
}

const apiService = new ApiService();

'use strict';

class Search {
    show() {
        document.querySelector('#js-searchForm').classList.add('is-active');
        document.querySelector('#js-searchInput').focus();
        document.querySelector('#js-searchButton').classList.add('is-disabled');

        this.bindEvents();
    }

    bindEvents() {
        document.querySelector('#js-searchInput').addEventListener('keyup', e => {
            this.search(e.target.value);
        });

        document.querySelector('#js-emptySearch').addEventListener('click', e => {
            e.preventDefault();

            this.resetSearch();
            this.hide();
        });
    }

    hide() {
        document.querySelector('#js-searchForm').classList.remove('is-active');
        document.querySelector('#js-searchButton').classList.remove('is-disabled');
    }

    resetSearch() {
        document.querySelector('#js-searchInput').value = '';
        document.querySelector('#js-results-message').style.display = 'none';
        pocket.render();
    }

    search(value) {
        if (value.length === 0) {
            this.resetSearch();
            return;
        }

        document.querySelector('#js-results-message').removeAttribute('style');
        document.querySelector('#js-searchValue').innerText = value;
        document.querySelector('#js-list').innerHTML = '';
        value = value.toLowerCase();

        let array;
        let count = 0;

        switch (pocket.getActivePage()) {
            case 'list':
                array = JSON.parse(localStorage.getItem('listFromLocalStorage'));
            break;
            case 'archive':
                array = JSON.parse(localStorage.getItem('archiveListFromLocalStorage'));
            break;
        }

        Object.keys(array).forEach(key => {
            let searchableString = '';

            if (array[key].resolved_title && array[key].resolved_title !== '') {
                searchableString = array[key].resolved_title;
            } else if (array[key].given_title && array[key].given_title !== '') {
                searchableString = array[key].given_title;
            } else if (array[key].resolved_url && array[key].resolved_url !== '') {
                searchableString = array[key].resolved_url;
            } else {
                searchableString = array[key].given_url;
            }

            if (searchableString.toLowerCase().indexOf(value) > -1) {
                let newItem = item.create(array[key], pocket.getActivePage());
                item.render(newItem);

                count++;
            }
        });

        let resultsStringElement = document.querySelector('#js-resultsString');
        if (count === 0) {
            resultsStringElement.innerText = chrome.i18n.getMessage('NO_RESULTS_MESSAGE');
        } else {
            resultsStringElement.innerText = chrome.i18n.getMessage('RESULTS_MESSAGE');
        }

        lazyload.load();
    }
}

const search = new Search();
import * as helpers from '../utils/helpers.js';
import { search } from './index.js';

class Tags {
    constructor() {
        this.tagClicks = this.handleTagClicks.bind(this);
    }
    /**
     * Initialize header.
     *
     * @function init
     * @return {void}
     */
    init() {
        this.bindEvents();
    }

    /**
     * Bind all events.
     *
     * @function bindEvents
     * @return {void}
     */
    bindEvents() {
        document.body.addEventListener('click', this.tagClicks, false);
    }

    /**
     * Remove all events.
     *
     * @function removeEvents
     * @return {void}
     */
    removeEvents() {
        document.body.removeEventListener('click', this.tagClicks, false);
    }

    /**
     * Handle all clicks within tag component.
     *
     * @function handleTagClicks
     * @param event {Event} - Click event.
     * @return {void}
     */
    handleTagClicks(event) {
        if (event.target.classList.contains('js-tagsLink')) {
            event.preventDefault();

            search.search(decodeURI(event.target.hash));
            search.show();
        } else if (event.target.id === 'js-tagsAllLink') {
            event.preventDefault();
            search.reset(true);
        }

        if (event.target.id === 'js-tagsMoreLink') {
            event.preventDefault();

            this.toggleTooltip();
        } else if (event.target.id !== 'js-tagsMoreLink') {
            this.closeTooltip();
        }
    }

    /**
     * Show or hide tooltip.
     *
     * @function toggleTooltip
     * @return {void}
     */
    toggleTooltip() {
        const tagsTooltip = document.querySelector('#js-tagsTooltip');

        if (tagsTooltip.classList.contains('is-visible')) {
            this.closeTooltip();
        } else {
            this.showTooltip();
        }
    }

    /**
     * Show tooltip.
     *
     * @function showTooltip
     * @return {*}
     */
    showTooltip() {
        const tagsTooltip = document.querySelector('#js-tagsTooltip');
        return helpers.addClass(tagsTooltip, 'is-visible');
    }

    /**
     * Hide tooltip.
     *
     * @function hideTooltip
     * @return {*}
     */
    closeTooltip() {
        const tagsTooltip = document.querySelector('#js-tagsTooltip');
        return helpers.removeClass(tagsTooltip, 'is-visible');
    }

    /**
     * Add all tags to localStorage.
     *
     * @function createTags
     * @param {Array} array - Array of items to find tags.
     * @param {Boolean} isFullSync - Is array coming from full sync.
     * @return {void}
     */
    createTags(array, isFullSync) {
        for (const item of array) {
            if (item.tags) {
                for (const tag in item.tags) {
                    if (item.tags.hasOwnProperty(tag)) {
                        this.addTag(tag, isFullSync);
                    }
                }
            }
        }

        this.renderTags();
    }

    /**
     * Add tags to dom.
     *
     * @function renderTags
     * @return {void}
     */
    renderTags() {
        const tagsArray = JSON.parse(helpers.getFromStorage('tags'));

        if (tagsArray === null || !tagsArray.length) {
            return;
        }

        helpers.show(document.querySelector('#js-tags'), true);
        const tagsElement = document.querySelector('#js-tagsList');
        const tagsTooltipElement = document.querySelector('#js-tagsTooltipList');

        helpers.clearChildren(tagsElement);
        helpers.clearChildren(tagsTooltipElement);

        for (const tag of tagsArray) {
            const tagElement = this.createTag(tag);
            this.renderTag(tagsElement, tagElement, tagsTooltipElement);
        }
    }

    /**
     * Create tag HTMLElement.
     *
     * @function createTag
     * @param tag {String} - Tag name string.
     * @return {HTMLElement}
     */
    createTag(tag) {
        const listElement = helpers.createNode('li');
        const linkElement = helpers.createNode('a');
        const tagNode = helpers.createTextNode(tag);

        listElement.setAttribute('class', 'tags__item');
        linkElement.setAttribute('href', `#${tag}`);
        linkElement.setAttribute('class', 'btn btn--link tags__link js-tagsLink');
        linkElement.setAttribute('title', `${chrome.i18n.getMessage('TAG')}: ${tag}`);

        helpers.append(linkElement, tagNode);
        helpers.append(listElement, linkElement);

        return listElement;
    }

    /**
     * Add HTMLElement to DOM.
     *
     * @function renderTag
     * @param tagsElement {HTMLElement} - Tags wrapper element in DOM (ul).
     * @param tagElement {HTMLElement} - Tag element on add to DOM.
     * @param tagsTooltipElement {HTMLElement} - Tags tooltip wrapper element in DOM (ul).
     * @return {*}
     */
    renderTag(tagsElement, tagElement, tagsTooltipElement) {
        if (tagsElement.children.length < 5) {
            return helpers.append(tagsElement, tagElement);
        }

        return helpers.append(tagsTooltipElement, tagElement);
    }

    /**
     * Add tags to localStorage.
     *
     * @function addTag
     * @param {String} tag - Tag string.
     * @param {Boolean} isFullSync - If is full sync, remove all tags from localStorage and add from server.
     * @return {void}
     */
    addTag(tag, isFullSync) {
        const tagsArray = isFullSync ? [] : JSON.parse(helpers.getFromStorage('tags')) || [];

        if (!tagsArray.includes(tag)) {
            tagsArray.push(tag);
            tagsArray.sort();

            helpers.setToStorage('tags', JSON.stringify(tagsArray));
        }
    }

    /**
     * Destroy plugin.
     *
     * @function destroy
     * @return {void}
     */
    destroy() {
        this.removeEvents();
    }
}

const tags = new Tags();
export default tags;

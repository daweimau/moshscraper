"use strict";

class HtmlHelper {
    constructor(){
        this._domparser = new DOMParser();
    }

    parse = (text) => {
        return this._domparser.parseFromString(text, "text/html");
    };

    /**
     * Fetch and pre-parse an HTML document at the given URL
     */
    getDocument = async (documentUrl) => {
        const res = await fetch(documentUrl);
        const text = await res.text();
        return this.parse(text);
    };

    /**
     * Remove HTML noise like `\n` from the given string
     */
    cleanText = (str) => (
        str
            .replaceAll("  ", "")
            .replaceAll("\n", "")
            .replaceAll(" ", "")
            .trim()
    );
};

class Scraper {
    constructor(){
        this._htmlHelper = new HtmlHelper();
        this._activeUrl = this._getActiveUrl();
        this._baseUrl = this._getBaseUrl();
    };

    _getBaseUrl = () => {
        return document.location.origin;
    };

    _getActiveUrl = () => {
        return document.location.href;
    };

    _getActiveDocument = async () => {
        return this._htmlHelper.getDocument(this._activeUrl);
    };

    // -- Sections --

    _getAllSectionElements = (doc) => {
        return Array.from(doc.getElementsByClassName("course-section"));
    };

    _generateSectionTitle = (sectionElement, sectionIndex) => {
        return this._htmlHelper.cleanText(
            `${sectionIndex} ${sectionElement.querySelector('[class="section-title"]').innerText}`
        );
    };

    _getSectionPageElements = (sectionElement) => {
        return Array.from(sectionElement.getElementsByClassName("section-list")[0].children);
    };

    // -- Pages --

    _getPageTitle = (pageElement) => {
        return this._htmlHelper.cleanText(pageElement.querySelector(".item .title-container").innerText);
    };

    _getPageUrl = (pageElement) => {
        return this._baseUrl + pageElement.getAttribute("data-lecture-url");
    };

    _getPageInfo = (pageElement) => {
        const pageTitle = this._getPageTitle(pageElement);
        const pageUrl = this._getPageUrl(pageElement);
        return {
            pageTitle,
            pageUrl
        };
    };

    _getPageDownloadInfo = async (pageInfo) => {
        const doc = await this._htmlHelper.getDocument(pageInfo.pageUrl);
        const downloadButton = doc.getElementsByClassName("download")[0];

        if(!downloadButton) return {
            downloadUrl: ""
        };

        const downloadUrl = downloadButton.href;
        const downloadFileName = downloadButton.getAttribute("data-x-origin-download-name");
        return {
            downloadUrl,
            downloadFileName
        };
    };

    // Orchestration

    _getSectionPageInfos = (sectionElement) => {
        const sectionPageElements = this._getSectionPageElements(sectionElement);
        return sectionPageElements.map(this._getPageInfo);
    };

    _getCourseSectionPageInfos = (sectionElements) => {
        return sectionElements.map((s, idx) => {
            const sectionTitle = this._generateSectionTitle(s, idx);
            const sectionPageInfos = this._getSectionPageInfos(s);
            return {
                sectionTitle,
                sectionPageInfos
            };
        });
    };

    _getSectionPagesDownloadInfos = async (sectionPageInfos) => {
        const downloadInfos = await Promise.all(sectionPageInfos.map(this._getPageDownloadInfo));
        const filteredInfos = downloadInfos.filter((info) => info.downloadUrl != "");
        return filteredInfos;
    };

    _getCoursePageDownloadInfos = async (courseInfo) => {
        return Promise.all(courseInfo.map(async ({ sectionTitle, sectionPageInfos }) => {
            const pageDownloadInfos = await this._getSectionPagesDownloadInfos(sectionPageInfos);
            return {
                sectionTitle,
                content: pageDownloadInfos
            };
        }));
    };

    scrapeCourseDownloads = async () => {
        const activeDoc = await this._getActiveDocument();
        const sections = this._getAllSectionElements(activeDoc);
        const courseInfo = this._getCourseSectionPageInfos(sections);
        const courseDownloads = await this._getCoursePageDownloadInfos(courseInfo);
        console.log(JSON.stringify(courseDownloads));
    };
}

new Scraper().scrapeCourseDownloads();

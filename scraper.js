// Inject this into any open mosh 'course' page (with the sidebar open)
// The result will be a JSON object printed on the console.
// Copy this output, and save it as `scraped_links.json` in this directory.

function main() {
    const baseUrl = "https://codewithmosh.com";

    /**
     * The various section HTML elements
     */
    const sectionElements = Array.from(
        document.getElementsByClassName("course-section")
    );

    const sections = sectionElements.map((s, i) => {
        // Get section numbered title
        const sTitle = `${i} ${
            s.querySelector('[class="section-title"]').innerText
        }`;

        console.log(`Processing ${sTitle}...`);

        // Get the lecture pages in this section
        const sectionPages = getPages(s, baseUrl);

        // Get lecture download links from each page
        const completeSection = sectionPages.map((page) => {
            const { fileName, url } = getDownloadInfo(page.pageLink);
            page = { ...page, fileName, url };
            return page;
        });
        return { sectionTitle: sTitle, content: completeSection };
    });
}

/**
 * For a given section element: scrapes interior page titles and urls
 */
function getPages(section, baseUrl) {
    const pageElements = Array.from(
        section.getElementsByClassName("section-list")[0].children
    );
    const sectionPages = pageElements.map((el) => {
        const pageLink = baseUrl + el.getAttribute("data-lecture-url");
        const title = el.querySelector(".item .title-container").innerText;
        return { pageLink, title };
    });
    return sectionPages;
}

/**
 * For a given lecture page link: GETs the page, parses it,
 * and scrapes the lecture download link
 */
function getDownloadInfo(pageLink) {
    // This works but it's synchronous. Oh well.
    const req = new XMLHttpRequest();
    req.open("GET", pageLink, false);
    req.send();
    const res = req.response;
    const domparser = new DOMParser();
    const doc = domparser.parseFromString(res, "text/html");
    var url = "";
    var fileName = "";
    try {
        const downButton = doc.getElementsByClassName("download")[0];
        url = downButton.href;
        fileName = downButton.getAttribute("data-x-origin-download-name");
        console.log("Scraped a lecture download link...");
    } catch (err) {
        console.log("Skipping a page where no lecture download link found...");
    }

    return { url, fileName };
}

main();

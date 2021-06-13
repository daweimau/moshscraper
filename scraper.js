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
            page.downloadLink = getDownloadLink(page.pageLink);
            return page;
        });
        return { sectionTitle: sTitle, content: completeSection };
    });

    console.log(JSON.stringify(sections));
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
function getDownloadLink(pageLink) {
    // This works but it's synchronous. Oh well.
    const req = new XMLHttpRequest();
    req.open("GET", pageLink, false);
    req.send();
    const res = req.response;
    const domparser = new DOMParser();
    const doc = domparser.parseFromString(res, "text/html");
    var downLink = "";
    try {
        downLink = doc.getElementsByClassName("download")[0].href;
        console.log("Scraped a lecture download link...");
    } catch (err) {
        console.log("Skipping a page where no lecture download link found...");
    }

    return downLink;
}

main();

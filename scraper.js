// Inject this into any open mosh 'course' page (with the sidebar open)
// The result will be a JSON object printed on the console.
// Copy this output, and save it as `scraped_links.json` in this directory.


const baseUrl = "https://codewithmosh.com";


function main() {
    const sectionElements = getRawSectionElements()
    const sections = refineSectionObjects(sectionElements)
    // Final output 
    console.log(JSON.stringify(sections));
}


/**
 * Refines a collection of HTML section elements into useful js objects
 */
const refineSectionObjects = (sectionElements) => sectionElements.map(processOneSection);

/**
 * The various section HTML elements
 */
const getRawSectionElements = () => 
    Array.from(document.getElementsByClassName("course-section"));

/**
 * Takes an HTML section element, and returns a useful js object
 */
const processOneSection = (section, sectionIndex) => {
    // Get section numbered title
    const sTitle = removeTextNoise(
        getSectionTitle(section, sectionIndex)
    )

    // Log progress
    console.log(`Processing ${sTitle}...`);

    // Get the lecture pages in this section
    let sectionPages = getSectionPages(section, baseUrl);

    // Get lecture download links from each page
    sectionPages = sectionPages.map((page) => {
        const { fileName, url } = getDownloadInfo(page.pageLink);
        page = {
            ...page, 
            filename: removeTextNoise(fileName), 
            url
        };
        return page;
    });

    // Discard pages with no download links
    sectionPages = sectionPages.filter(page => page.url !== "")

    return { sectionTitle: sTitle, content: sectionPages };
};



/**
 * Remove HTML noise like `\n` from the given string
 */
const removeTextNoise = (titleString) => (
    titleString
        .replaceAll("  ", "")
        .replaceAll("\n", "")
        .replaceAll(" ", "")
        .trim()
)


/**
 * For a given section element: find the section title elsewhere in the DOM
 */
const getSectionTitle = (section, sectionIndex) => 
    `${sectionIndex} ${section.querySelector('[class="section-title"]').innerText}`;

/**
 * Get the raw HTML 'page' elements for this section
 */
const getSectionPageElements = (section) =>
    Array.from(section.getElementsByClassName("section-list")[0].children);


/**
 * For a given HTML 'page' element: returns a useful js object
 */
const refineOnePageElement = (pageElement) => {
    const pageLink = baseUrl + pageElement.getAttribute("data-lecture-url");
    const title = removeTextNoise(pageElement.querySelector(".item .title-container").innerText);
    return { pageLink, title };
}

/**
 * For a given section element: scrapes interior page titles and urls
 */
function getSectionPages(section, baseUrl) {
    const pageElements = getSectionPageElements(section)
    const sectionPages = pageElements.map(refineOnePageElement);
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

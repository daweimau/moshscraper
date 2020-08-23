// Use node to run this code using the output of scraper.js
// This is downloading a lot of mp4 files.
// It will take a while depending on your internet speed

var http = require("https");
var fs = require("fs");

function main() {
    const rawdata = fs.readFileSync("scraped_links.json");
    const sections = JSON.parse(rawdata);
    sections.forEach((s) => {
        const sPath = `course_content/${s.sectionTitle}`;
        fs.mkdirSync(sPath, { recursive: true });

        s.content.forEach((lec) => {
            if (lec.downloadLink) {
                const dest = `${sPath}/${lec.title}.mp4`;
                if (!fs.existsSync(dest)) download(lec.downloadLink, dest);
                else console.log(`${dest} already exists. Skipping...`);
            }
        });
    });
}

function clearIfExists(path) {
    if (fs.existsSync(path)) fs.unlinkSync(path);
}

// This is asynchronous, but doesn't use promises
function download(url, dest, cb) {
    const placeholderPath = `${dest}-incomplete`;

    // Remove any previous incomplete downloads
    clearIfExists(placeholderPath);

    // Create a new placeholder file
    var file = fs.createWriteStream(placeholderPath);
    http.get(url, function (response) {
        response.pipe(file);
        file.on("finish", function () {
            file.close(cb);
            // The download has complete: remove the placeholder flag
            fs.renameSync(placeholderPath, dest);
            console.log(`Completed download for: ${dest}`);
        });
    });
}

main();

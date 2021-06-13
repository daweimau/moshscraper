// Use node to run this code using the output of scraper.js
// This is downloading a lot of mp4 files.
// It will take a while depending on your internet speed

var http = require("https");
var fs = require("fs");

function main() {
    const rawdata = fs.readFileSync("scraped_links.json");
    const sections = JSON.parse(rawdata);

    sections.forEach(async (section) => {
        const sPath = `course_content/${section.sectionTitle}`;
        fs.mkdirSync(sPath, { recursive: true });

        // The promise implementation was an attempt to restrict downloading
        // just one section at a time. Currently it's still downloading everything at once.
        await Promise.all(
            section.content.map((lec) => {
                return new Promise(async (resolve) => {
                    if (lec.downloadLink) {
                        const dest = `${sPath}/${lec.title}.mp4`;
                        if (!fs.existsSync(dest)) {
                            await download(lec.downloadLink, dest);
                            resolve();
                        } else {
                            console.log(`${dest} already exists. Skipping...`);
                            resolve();
                        }
                    }
                });
            })
        );
    });
}

function clearIfExists(path) {
    if (fs.existsSync(path)) fs.unlinkSync(path);
}

// Async
function download(url, dest, callback) {
    const placeholderPath = `${dest}-incomplete`;

    return new Promise((resolve) => {
        // Remove any previous incomplete downloads
        clearIfExists(placeholderPath);

        // Create a new placeholder file
        var file = fs.createWriteStream(placeholderPath);
        try {
            http.get(url, function (response) {
                response.pipe(file);
                file.on("finish", function () {
                    file.close(callback);
                    // The download has complete: remove the placeholder flag
                    fs.renameSync(placeholderPath, dest);
                    console.log(`Completed download for: ${dest}`);
                    resolve();
                });
            });
        } catch (err) {
            file.close(callback);
            console.log(`This download failed: ${dest}`);
            console.log(err);
            resolve();
        }
    });
}

main();

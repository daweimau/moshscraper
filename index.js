// Use node to run this code using the output of scraper.js
// This is downloading a lot of mp4 files.
// It will take a while depending on your internet speed

var http = require("https");
var fs = require("fs");

async function main() {
    const rawdata = fs.readFileSync("scraped_links.json");
    const sections = JSON.parse(rawdata);

    for (var i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sPath = `course_content/${section.sectionTitle}`;
        fs.mkdirSync(sPath, { recursive: true });
        await downloadSectionLectures(section, sPath);
        console.log(
            `Completed section ${i} of ${
                sections.length - 1
            }, moving to next...\n`
        );
    }
    console.log("All downloads complete.\n");
}

async function downloadSectionLectures(section, sPath) {
    const downloadableLectures = section.content.filter((item) =>
        Boolean(item.url)
    );
    await Promise.all(
        downloadableLectures.map(
            (lec) =>
                new Promise((resolve) => {
                    const dest = `${sPath}/${lec.fileName}`;
                    if (!fs.existsSync(dest))
                        download(lec.url, dest).then(resolve);
                    else {
                        console.log(`${dest} already exists. Skipping...`);
                        resolve();
                    }
                })
        )
    );
}

function clearIfExists(path) {
    if (fs.existsSync(path)) fs.unlinkSync(path);
}

function download(url, dest) {
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
                    file.close();
                    // The download has complete: remove the placeholder flag
                    fs.renameSync(placeholderPath, dest);
                    console.log(`Completed download for: ${dest}`);
                    resolve();
                });
            });
        } catch (err) {
            file.close();
            console.log(`This download failed: ${dest}`);
            console.log(err);
            resolve();
        }
    });
}

main();

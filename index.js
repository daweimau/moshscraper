// Use node to run this code using the output of scraper.js
// This is downloading a lot of mp4 files.
// It will take a while depending on your internet

var http = require("https");
var fs = require("fs");

const rawdata = fs.readFileSync("scraped_links.json");
const sections = JSON.parse(rawdata);

fs.mkdirSync("course_content");

sections.forEach((s) => {
    const sPath = `course_content/${s.sectionTitle}`;
    fs.mkdirSync(sPath);
    s.content.forEach((lec) => {
        if (lec.downloadLink)
            download(lec.downloadLink, `${sPath}/${lec.title}.mp4`);
    });
});

// I think this is kind of synchronous
function download(url, dest, cb) {
    var file = fs.createWriteStream(dest);
    http.get(url, function (response) {
        response.pipe(file);
        file.on("finish", function () {
            file.close(cb);
            console.log(`Completed download for: ${dest}`);
        });
    });
}

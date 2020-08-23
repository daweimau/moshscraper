# What is this?

The courses featured on https://codewithmosh.com/ include download links for each lecture.

There is no feature on the website to "download all lectures". Users are forced to go to each individual lecture page, click "Download", and work through each.

This is a silly script to download all the lectures.

This should work on any mosh course, and will probably also work on other course-provider pages if they use the same page template/provider as mosh does. Although, it

# How to use

You need node installed.

1. Log in to codewithmosh, and navigate to your desired course
2. Navigate to any individual lecture page in the course (eg https://codewithmosh.com/courses/357787/lectures/5634517). This should be the page containing a video.
3. Open Chrome developer tools and go to the console. Don't extend the console too wide: the page sidebar needs to still be in view (but it collapses if you open the console too wide)
4. In the console, paste the entire contents of the `scraper.js` file in this project. Enter. This will take a few minutes depending on the course, but it will give you updates as it progresses.
5. Once the script has run, you will have a giant JSON object in your console. Copy this object, and paste it into `scraped_links.json`. Save.
6. Run `node index` in this directory. This will download the actual lecture files. It will take serious time depending on the particular course and your internet. You will get updates as it progresses, but try to avoid starting it unless you can give it time to finish. If you cancel partway through, it may be hard to tell which lecture files were finished downloading, and which were not.

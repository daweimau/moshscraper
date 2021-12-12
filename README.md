# What is this?

https://teachable.com/ is a service which hosts paid courses, lectures, and similar.

Sellers can create store fronts, upload their course content, and sell subscriptions to viewers.

At least some teachable shopfronts allow viewers to download the course content.

However, if a viewer wants to download many videos in a course, this is a very tedious process.

This repo contains:

1. A scraper (to run in a browser) which collects all the video download links in a course (relatively quickly), and
2. A separate script (to run on a local machine) that utilises this info to download all the videos into an organised folder structure (matching the course structure)

This was originally written for a specific teachable store front: https://codewithmosh.com/

No promises this works for you! This is really just for me.

# How to use

You need node installed.

1. Log in to codewithmosh, and navigate to your desired course
2. Navigate to any individual watch-video page in the course (eg https://codewithmosh.com/courses/357787/lectures/5634517)
3. Open Chrome developer tools and go to the console. Don't extend the console too wide: the page sidebar needs to still be in view. (Opening the console too wide will collapse the sidebar; we don't want that.)
4. In the console, paste the entire contents of the `scraper.js` file in this project. Enter. This will take a few minutes depending on the course, but it will give you updates as it progresses.
5. Once the script has run, you will have a giant JSON object in your console. Copy this object, and paste it into `scraped_links.json`. Save.
6. On your local terminal, run `node index` in this directory. This will download the actual lecture files. It will take serious time depending on the particular course and your internet. You will get updates as it progresses, but try to avoid starting it unless you can give it time to finish. If the script / download process is interrupted, that's ok: re-running the script will purge any incomplete files and resume progress from there.

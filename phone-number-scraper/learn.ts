import puppeteer from "puppeteer";

const getQuotes = async () => {
    // Start puppeteer session w/ an invisible browser: headless : false
    // No default viewport, will start max size screen: defaultViewport: null
    const webBrowser = await puppeteer.launch({
        // headless: true,
        defaultViewport: null,
    });

    // Open page
    const page = await webBrowser.newPage();

    // On this new page;
    // Open the website
    // Wait until dom content is loaded and HTML is ready
    await page.goto('http://quotes.toscrape.com/', {
        waitUntil: 'domcontentloaded'
    });

    const quotes = await page.evaluate(() => {
        const quoteElements = document.querySelectorAll('.quote');
        const quotesArray = [];

        for (const quoteElement of quoteElements) {
            //@ts-ignore
            const quoteText: string = quoteElement.querySelector('.text').innerText;
            quotesArray.push(quoteText);
        }
        return quotesArray;
    });

    console.log(quotes);
};

// Start scraping
getQuotes();

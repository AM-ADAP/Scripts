import puppeteer from "puppeteer";
import { scrapedData } from "./interfaces";

export const getPhoneNumbers = async (data: scrapedData): Promise<string[]> => {
    try {
        const browser = await puppeteer.launch({
            defaultViewport: null,
            headless: "new"
        });

        const page = await browser.newPage();

        await page.goto(data.url, {
            waitUntil: "domcontentloaded"
        });
        await page.setRequestInterception(true);

        page.on('request', (request) => {
            if (['image', 'stylesheet', 'font'].indexOf(request.resourceType()) !== -1) {
                request.abort();
            } else {
                request.continue();
            }
        });

        const phoneNumbersOnPage = await page.evaluate(() => {
            const phoneNumberElements = document.querySelectorAll<HTMLAnchorElement>('[href^="tel"]');
            const phoneNumbers: (string | null)[] = [];

            phoneNumberElements.forEach(element => {
                const hrefParts = element.href.split('tel:');
                phoneNumbers.push(hrefParts[1]);
            });

            return phoneNumbers;
        });

        await browser.close();

        const filteredPhoneNumbers: string[] = phoneNumbersOnPage.filter((phoneNumber) => phoneNumber !== null) as string[];

        return filteredPhoneNumbers;
    }
    catch (error) {
        console.error(error);
        return [];
    }
};



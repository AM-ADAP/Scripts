import { parentPort, workerData } from "worker_threads";
import { getPhoneNumbers } from "./functions";
import { scrapedData } from "./interfaces";

const handleData = async (data: scrapedData) => {
    try {
        const phoneNumbers = await getPhoneNumbers(data);
        data.numbers = phoneNumbers;

        // console.log(data);
        parentPort?.postMessage(data);

    } catch (error) {
        console.error(error);
    }
}

parentPort?.on('message', (data) => {
    handleData(data);
});
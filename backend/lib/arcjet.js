//arcjet is used for bot detection and rate limiting

import arcjet, { tokenBucket,shield,detectBot} from "@arcjet/node";
import "dotenv/config";


//intialize arcjet
export const aj = arcjet(
    {
        key: process.env.ARCJET_KEY,
        characteristics: ["ip.src"],
        rules:[
            // shield protects from common attacks like sql injection, xss, lfi, rce etc
            shield({mode:"LIVE"}),
            // detectBot identifies bots based on their behavior
            detectBot({
                mode:"LIVE",
                //block bots except search engine bots
                allow:[
                    "CATEGORY:SEARCH_ENGINE"
                    //can see the full list of categories here: https://docs.arcjet.com/bot-list
                ]
            }),
            // rate limiting using token bucket algorithm
            tokenBucket({
                mode:"LIVE",
                capacity:30, //max 30 requests in the window
                refillRate:5, //refill 5 tokens every second
                interval:10, //window of 10 seconds
            })
        ]
    }
)
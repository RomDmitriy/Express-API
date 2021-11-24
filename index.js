import app from "./app.js";
import { getCurrTime } from "./times.js";

console.log("API v4.9");

app.listen(5000, () =>
    console.log(
        (" " + getCurrTime() + " ").bgWhite.black +
            " Grand Carnival starts!".bold
    )
);

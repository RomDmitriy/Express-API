import app from "./app.js";
import { getCurrTime } from "./shared/times.js";

console.log("API v5.1");

app.listen(5000, () =>
    console.log(
        (" " + getCurrTime() + " ").bgWhite.black +
            " Grand Carnival starts!".bold
    )
);

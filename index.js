import app from "./shared/app.js";
import { getCurrTime } from "./shared/times.js";

console.log("API v5.1.10");

app.listen(5000, () =>
    console.log(
        (" " + getCurrTime() + " ").bgWhite.black +
            " Grand Carnival starts!".bold
    )
);

import app from "./shared/app.js";
import { getCurrTime } from "./shared/times.js";

console.log("API v5.1.11_01");

app.listen(5000, () =>
    console.log(
        (" " + getCurrTime() + " ").bgWhite.black +
            " Grand Carnival starts!".bold
    )
);

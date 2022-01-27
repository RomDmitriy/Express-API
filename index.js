import app from "./shared/app.js";
import { getCurrTime } from "./shared/times.js";

console.log("API v6.0.1 Final");

app.listen(5000, () =>
    console.log(
        (" " + getCurrTime() + " ").bgWhite.black +
            " Grand Carnival starts!".bold
    )
);

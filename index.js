import app from "./app.js";
import { getCurrTime } from "./currTime.js";

console.log("API v4.7.1");

app.listen(5000, () =>
    console.log(
        (" " + getCurrTime() + " ").bgWhite.black +
            " Grand Carnival starts!".bold
    )
);

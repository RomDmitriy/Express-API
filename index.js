import app from "./app.js";
import { getCurrTime } from "./currTime.js";

console.log("API v4.5");

app.listen(5000, () =>
    console.log(
        (" " + getCurrTime() + " ").bgWhite.black + " Grand carnival starts!".bold
    )
);

import app from "./app.js";
import { getCurrTime } from "./currTime.js";

app.listen(5000, () =>
    console.log(
        getCurrTime() + " - API v4.3.2 started working!"
    )
);

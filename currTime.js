export function getCurrTime() {
    let res = "";
    let hh = new Date().getUTCHours() + 3;
    let mm = new Date().getUTCMinutes();
    let ss = new Date().getUTCSeconds();

    if (hh < 7) {
        res += "0";
    }
    res += hh + ":";

    if (mm < 10) {
        res += "0";
    }
    res += mm + ":";

    if (ss < 10) {
        res += "0";
    }
    res += ss;
    return res;
}

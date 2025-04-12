import { URL } from "url";
import { JSDOM } from "jsdom"
function redirectTo(url: string): Response {
    return new Response(null, {
        status: 302,
        headers: {
            Location: url
        }
    });
}
async function labeled(label: string, message: string, color: string) {
    label = label.replaceAll('_', '__');
    message = message.replaceAll('_', '__');
    label = encodeURI(label);
    message = encodeURI(message);
    return redirectTo(`https://img.shields.io/badge/${label}-${message}-${color}?style=for-the-badge`);
}
async function unlabeled(message: string, color: string) {
    message = message.replaceAll('_', '__');
    message = encodeURI(message);
    return redirectTo(`https://img.shields.io/badge/${message}-${color}?style=for-the-badge`);
}
async function error(message: string) {
    return unlabeled(message, "gray");
}
async function codeforces(id: string, rating: number | null) {
    var color = "FFFFFF";
    var message = "unrated";
    if (rating) {
        if (rating < 1200) {
            message = `Newbie ${rating}`;
            color = "808080";
        } else if (rating < 1400) {
            message = `Pupil ${rating}`;
            color = "008000";
        } else if (rating < 1600) {
            message = `Specialist ${rating}`;
            color = "03A89E";
        } else if (rating < 1900) {
            message = `Expert ${rating}`;
            color = "0000FF";
        } else if (rating < 2100) {
            message = `Candidate Master ${rating}`;
            color = "AA00AA";
        } else if (rating < 2200) {
            message = `Master ${rating}`;
            color = "FF8C00";
        } else if (rating < 2400) {
            message = `International Master ${rating}`;
            color = "FF8C00";
        } else if (rating < 2600) {
            message = `Grandmaster ${rating}`;
            color = "FF0000";
        } else if (rating < 3000) {
            message = `International Grandmaster ${rating}`;
            color = "FF0000";
        } else if (rating < 4000) {
            message = `Legendary Grandmaster ${rating}`;
            color = "FF0000";
        } else {
            message = `${id[0].toUpperCase()}${id.substring(1)} ${rating}`;
            color = "FF0000";
        }
    }
    return labeled(id, message, color);
}
async function atcoder(id: string, rating: string, color: string) {
    if (color == "gray") {
        color = "808080";
    } else if (color == "brown") {
        color = "804000";
    } else if (color == "green") {
        color = "008000";
    } else if (color == "cyan") {
        color = "00C0C0";
    } else if (color == "blue") {
        color = "0000FF"
    } else if (color == "yellow") {
        color = "C0C000";
    } else if (color == "orange") {
        color = "FF8000";
    } else if (color == "red") {
        color = "FF0000";
    }
    return labeled(id, `Atcoder ${rating}`, color);
}
export async function GET(request: Request) {
    const url = new URL(request.url);
    const params = url.searchParams;
    const oj = params.get("oj");
    if (!oj) {
        return error("param:oj not found");
    }
    const id = params.get("id");
    if (!id) {
        return error("param:id not found");
    }
    if (oj == "codeforces") {
        const response = await fetch(`https://codeforces.com/api/user.rating?handle=${id}`);
        if (!response.ok) {
            return error(`${oj}:${id} not found`);
        }
        const json = await response.json();
        const result: Array<any> = json["result"];
        if (result.length == 0) {
            return codeforces(id, null);
        }
        const rating = result[result.length - 1]["newRating"];
        return codeforces(id, rating);
    }
    if (oj == "atcoder") {
        const response = await fetch(`https://atcoder.jp/users/${id}`);
        const html = await response.text();
        const document = new JSDOM(html).window.document;
        var ratings = document.querySelector('table.dl-table.mt-2').children[0].children[1].children[1] as HTMLElement;
        if (ratings?.children.length == 1) {
            ratings = ratings.children[0] as HTMLElement;
        } else {
            ratings = ratings.children[1] as HTMLElement;
        }
        return atcoder(id, ratings.textContent as string, ratings.className.substring(5));
    }
    return error(`${oj} not supported`);
}
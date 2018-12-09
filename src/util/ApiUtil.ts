export class ApiUtil {

    static makeUrlWithQueryParams(link: string, params: any) {
        link += '?';
        let firstParam = true;
        for (let key in params) {
            if (!firstParam) {
                link += '&';
            } else {
                firstParam = false;
            }
            link += `${key}=${params[key]}`;
        }
        return link;
    }

}
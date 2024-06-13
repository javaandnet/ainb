
class Util {
    copy(obj){
        return JSON.parse( JSON.stringify(obj));
    }
    deepCopy(obj) {
        console.log(obj);
        if (Array.isArray(obj)) {
            return obj.map(deepCopy);
        } else if (typeof obj === 'object' && obj !== null) {
            return Object.fromEntries(
                Object.entries(obj).map(([key, val]) => [key, deepCopy(val)])
            );
        } else {
            return obj;
        }
    }
    isObject(obj){
        return typeof obj === "object";
    }
}

export { Util };
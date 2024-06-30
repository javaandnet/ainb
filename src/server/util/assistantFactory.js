
import { Company } from "../assistant/company.js";
import { Restaurant } from "../assistant/restaurant.js";
class AssistantFactory {
    // SERVER = "http://160.16.216.251:8379/";
    SERVER = "http://192.168.1.160:8379/";
    assistants = {};
    get = function (id = "company") {
        if (this.assistants[id]) {
            return this.assistants[id];
        } else {
            var obj = null
            if (id == "company") {
                obj = new Company();
                obj.setServer(this.SERVER);
            } else if (id == "restaurant") {
                obj = new Restaurant();
            } else {
                console.error("no Id:", id);
            }
            this.assistants[id] = obj;
            obj.func.parent = obj;
            return obj;
        }
    }
}
export { AssistantFactory };

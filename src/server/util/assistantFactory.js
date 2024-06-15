
import { Company } from "../assistant/company.js";
class AssistantFactory {
    get = function(id = "company"){
        if(id =="company"){
            return  new Company();
        }
    }
}
export { AssistantFactory };

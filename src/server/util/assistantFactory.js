
import { Company } from "../assistant/company.js";

import { Restaurant } from "../assistant/restaurant.js";
class AssistantFactory {
    get = function(id = "company"){
        if(id =="company"){
            return  new Company();
        }  else if(id =="restaurant"){
            return  new Restaurant();
        }
    }
}
export { AssistantFactory };

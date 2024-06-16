
import { Company } from "../assistant/company.js";

import { Restaurant } from "../assistant/restaurant.js";
class AssistantFactory {
    assistants = {};
    get = function(id = "company"){
        if(assistants[id]){
            return assistants[id];
        }else{
            var obj = null
            if(id =="company"){          
                obj =   new Company();
            }  else if(id =="restaurant"){
                obj =   new Restaurant();
            }else{
                console.error("no Id:",id);
            }
            assistants[id] = obj;
        }
    }
}
export { AssistantFactory };

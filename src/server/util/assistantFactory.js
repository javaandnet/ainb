
import { Company } from "../assistant/company.js";
import { Restaurant } from "../assistant/restaurant.js";
class AssistantFactory {
    assistants = {};
    get = function(id = "company"){
        if(this.assistants[id]){
            return this.assistants[id];
        }else{
            var obj = null
            if(id =="company"){          
                obj =   new Company();
            }  else if(id =="restaurant"){
                obj =   new Restaurant();
            }else{
                console.error("no Id:",id);
            }
            this.assistants[id] = obj;
            return obj;
        }
    }
}
export { AssistantFactory };

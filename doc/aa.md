 
    public   String formatToFourDigits(Integer num) {
        // 将数字转换为字符串
        String numberStr = String.valueOf(num);
        
        // 如果数字的长度小于4，则在前面补零
        while (numberStr.length() < 4) {
            numberStr = '0' + numberStr;
        }
        
        // 如果数字的长度大于4，则截取最后的4位
        if (numberStr.length() > 4) {
            numberStr = numberStr.substring(numberStr.length() - 4);
        }
        
        return numberStr;
    }
      List<Worker__c> workers = [SELECT Id, name,AutoNo__c FROM Worker__c  limit 200];
        integer index = 1;
        // 修改每个记录的 Name 字段
        for (Worker__c worker : workers) {
            worker.AutoNo__c = formatToFourDigits(index);
            index = index +1;
        }
        
        // 更新记录
        try {
            update workers;
            System.debug('Account names updated to ' + index);
        } catch (DmlException e) {
            System.debug('An error occurred while updating the accounts: ' + e.getMessage());
        }
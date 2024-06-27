export default class TestUtil {
    constructor() {
        // 初始化类属性
    }
    // 使用对象来存储类引用
    classRegistry = {

    };
    createInstance(className, ...args) {
        if (classRegistry[className]) {
            return new classRegistry[className](...args);
        } else {
            throw new Error(`Class ${className} not found.`);
        }
    }

    async testAwait(instance, methodName, ...args) {
        console.log(`############开始测试方法: ${methodName}##########\r\n`);

        // const instance = new className();
        const result = await instance[methodName](...args);

        console.log(`方法 ${methodName} 的返回值: \r\n${result}\r\n`);
        console.log(`########结束测试方法: ${methodName}#########\r\n`);

        return result;
    }
    test(instance, methodName, ...args) {
        console.log(`############开始测试方法: ${methodName}##########\r\n`);

        // const instance = new className();
        const result = instance[methodName](...args);

        console.log(`方法 ${methodName} 的返回值: \r\n${result}\r\n`);
        console.log(`########结束测试方法: ${methodName}#########\r\n`);

        return result;
    }
}






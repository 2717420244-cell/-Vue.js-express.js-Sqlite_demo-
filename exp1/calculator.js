// calculator.js  第一题1

/**
 * 执行基本四则运算
 * @param {number} a - 第一个操作数
 * @param {string} operator - 运算符 (+, -, *, /)
 * @param {number} b - 第二个操作数
 * @returns {number|string} 运算结果或错误信息
 */
function calculate(a, operator, b) {
    // 检查操作数是否为有效数字
    if (typeof a !== 'number' || typeof b !== 'number' || isNaN(a) || isNaN(b)) {
        return "错误：操作数必须是有效的数字";
    }

    // 检查运算符是否合法
    const validOperators = ['+', '-', '*', '/'];
    if (!validOperators.includes(operator)) {
        return `错误：不支持的运算符 "${operator}"，请使用 +, -, *, /`;
    }

    // 执行运算
    switch (operator) {
        case '+':
            return a + b;
        case '-':
            return a - b;
        case '*':
            return a * b;
        case '/':
            if (b === 0) {
                return "错误：除数不能为零";
            }
            return a / b;
        default:
            return "未知错误";
    }
}

// ========== 测试部分 ==========
console.log("=== Node.js 四则运算测试 ===\n");

// 正常情况测试
console.log("1 + 2 =", calculate(1, '+', 2));       // 3
console.log("3 - 2 =", calculate(3, '-', 2));       // 1
console.log("2 * 3 =", calculate(2, '*', 3));       // 6
console.log("4 / 2 =", calculate(4, '/', 2));       // 2

// 边界/错误情况测试
console.log("\n--- 错误处理测试 ---");
console.log("5 / 0 =", calculate(5, '/', 0));       // 除零错误
console.log("'a' + 2 =", calculate('a', '+', 2));   // 非数字操作数
console.log("5 ^ 2 =", calculate(5, '^', 2));       // 无效运算符
console.log("null + 3 =", calculate(null, '+', 3)); // null 作为操作数
console.log("undefined - 1 =", calculate(undefined, '-', 1)); // undefined

console.log("\n=== 测试结束 ===");
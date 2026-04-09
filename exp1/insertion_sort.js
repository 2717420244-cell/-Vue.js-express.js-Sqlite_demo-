// insertion_sort.js  第二题

const fs = require('fs');

// 1. 生成100个随机整数（0~999）
function generateRandomArray(size) {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 1000));
}

// 2. 插入排序算法实现
function insertionSort(arr) {
    const len = arr.length;
    for (let i = 1; i < len; i++) {
        let key = arr[i];
        let j = i - 1;
        // 将比key大的元素向后移动
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
    return arr;
}

// 3. 主程序
const randomArray = generateRandomArray(100);
console.log("原始数组（前10个）:", randomArray.slice(0, 10));

const sortedArray = insertionSort([...randomArray]); // 拷贝一份避免修改原数组
console.log("排序后数组（前10个）:", sortedArray.slice(0, 10));

// 写入文件
const filename = 'sorted_array.txt';
fs.writeFileSync(filename, sortedArray.join('\n'), 'utf8');
console.log(`✅ 排序完成！结果已保存至 ${filename}`);

// 可选：验证是否真的有序
const isSorted = sortedArray.every((val, i, arr) => i === 0 || arr[i-1] <= val);
console.log("数组是否已排序？", isSorted ? "✅ 是" : "❌ 否");
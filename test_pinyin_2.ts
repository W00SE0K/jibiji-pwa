import { pinyin } from 'pinyin-pro';

const text = "Hello 银行 123";
// Test without nonZh: consecutive
const pinyinArray = pinyin(text, { 
    type: 'array', 
    toneType: 'symbol'
});

console.log("Input length:", text.length);
console.log("Array length:", pinyinArray.length);
console.log("Array:", pinyinArray);

const text2 = "行"; 
// Context check again to be sure default array doesn't break context
const text3 = "银行"; 
console.log("Context Check (Array):", pinyin(text3, { type: 'array', toneType: 'symbol' }));

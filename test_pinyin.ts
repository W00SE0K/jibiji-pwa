import { pinyin } from 'pinyin-pro';

const text = "Hello 银行 123";
const pinyinArray = pinyin(text, { 
    type: 'array', 
    toneType: 'symbol',
    nonZh: 'consecutive' 
});

console.log("Input:", text);
console.log("Array:", pinyinArray);

// Check if lengths match?
// nonZh: 'consecutive' might group "Hello" into one item.
// Let's see if we can map it back to characters.

const text2 = "行";
const text3 = "银行";
const text4 = "行动";

console.log(text2, pinyin(text2, { toneType: 'symbol' }));
console.log(text3, pinyin(text3, { toneType: 'symbol' }));
console.log(text4, pinyin(text4, { toneType: 'symbol' }));

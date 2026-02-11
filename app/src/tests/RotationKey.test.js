import { VigenereCoder } from '../logic/vigenere.js';
import { RusABC } from '../logic/abc.js';

describe("Проверка S блока на ротацию ключа", () => {
    const abc = new RusABC();
    const coder = new VigenereCoder("S_Block_Mod");
    const RUS_CHARS = Object.values(abc.ABC);

    const blocks = [
        "АБВГ", "ДЕЖЗ", "ИЙКЛ", "МНОП",
        "РСТУ", "ФХЦЧ", "ШЩЫЬ", "ЭЮЯ_",
        "СЫЗР", "ГЛАД", "ТУСУ", "ПРОБ",
        "КОД_", "БЛОК", "ТЕСТ", "ДАНН",
        "КЛЮЧ", "ШИФР", "АЛГО", "ОРЕХ"
    ];

    const keys = [
        "АБВГДЕЖЗИЙКЛМНОП",
        "РСТУФХЦЧШЩЫЬЭЮЯ_",
        "ШИФРШИФРШИФРШИФР",
        "ТЕСТТЕСТТЕСТТЕСТ",
        "АЛГОРИТМАЛГОРИТМ",
        "ОЛОЛОЛОЛОЛОЛОЛОЛ",
        "КОЛЮЧИЙ__ЕЖИК___",
        "ТОРТТОРТТОРТТОРТ",
        "СЕКРЕТНЫЙКЛЮЧ___",
        "ЖАРОВЫНОСЛИВОСТЬ"
    ];

    function countDifferences(str1, str2) {
        let count = 0;
        for (let i = 0; i < Math.min(str1.length, str2.length); i++) {
            if (str1[i] !== str2[i]) {
                count++;
            }
        }
        
        return count;
    }

    function rotateKey(key) {
        
        return key.slice(1) + key[0];
    }

    test("Проверка S блока на ротацию ключа", () => {
        let totalTests = 0;
        let fullDiff = 0;
        let partialDiff = 0;
        let failedDiff = 0;
        const failedCases = [];

        for (const block of blocks) {
            for (const key of keys) {
                const keyRotated = rotateKey(key);

                const encoded1 = coder.Encode(block, key);
                const encoded2 = coder.Encode(block, keyRotated);

                const decoded1 = coder.Decode(encoded1, key);
                const decoded2 = coder.Decode(encoded2, keyRotated);

                const diffCount = countDifferences(encoded1, encoded2);
                totalTests++;

                //console.log(`Block: ${block}, Rotated: ${keyRotated}, Key: ${key}, 
                    //Encoded1: ${encoded1}, Encoded2: ${encoded2}, 
                    //Decoded1: ${decoded1}, Decoded2: ${decoded2}`);

                if (diffCount === 4) {
                    fullDiff++;
                } else if (diffCount >= 2) {
                    partialDiff++;
                } else {
                    failedDiff++;
                    failedCases.push({ block, key, keyRotated, diffCount });
                }

                if (decoded1 !== block || decoded2 !== block) {
                    failedCases.push({ block, key, keyRotated, decoded1, decoded2 });
                }
            }
        }

        console.log(
            "Количество тестов: " + totalTests + "\n" +
            "Все символы разные: " + fullDiff + "\n" +
            "3 символа разные: " + partialDiff + "\n" +
            "1 символ отличается: " + failedDiff + "\n" +
            "Процент пройденных тестов: " + (fullDiff / totalTests * 100).toFixed(2) + "%"
        );

        expect(fullDiff / totalTests).toBeGreaterThan(0.7);
    });
});

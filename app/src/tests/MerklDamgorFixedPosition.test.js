import { Merkl_Damgor } from "../logic/merkl_damgor.js";
import { RusABC } from "../logic/abc.js";
import fs from "fs";


const abc = new RusABC();
const letters = Object.values(abc.ABC);

function hash(msg) {
    const md = new Merkl_Damgor();
    return md.merDam_hash(msg);
}

function randomMessage(length) {
    let msg = '';
    for (let i = 0; i < length; i++) {
        const randIndex = Math.floor(Math.random() * letters.length);
         msg += letters[randIndex];
    }
    return msg;
}

function modifyOneChar(msg, position) {
    const currentChar = msg[position];
    const index = letters.indexOf(currentChar);
    let nextIndex;

    nextIndex = (index + 1) % letters.length;
    const newChar = letters[nextIndex];


    return msg.slice(0, position) + newChar + msg.slice(position + 1);
}

test("Лавинный тест с фиксированной позицией", () => {

    const iterations = 10000;
    const messageLength = 64;
    const fixedPosition = 10;
    let totalDiff = 0;

        
    const freq = {};
    for (const symbol of letters) {
        freq[symbol] = 0;
    }

    for (let i = 0; i < iterations; i++) {
        const baseMessage = randomMessage(messageLength);
        const modifiedMessage = modifyOneChar(baseMessage, fixedPosition);

        const hash1 = hash(baseMessage);
        const hash2 = hash(modifiedMessage);

        for (let j = 0; j < hash1.length; j++) {
            if (hash1[j] !== hash2[j]) {
                totalDiff++;
                freq[hash2[j]]++;
            }
        }
    }

    const avgDiff = totalDiff / iterations;

    console.log(
        "Лавинный тест\n" +
        "Среднее различий: " + avgDiff + "\n" +
        "Частоты символов:\n",
        freq
    );

    let csv = "Символ,Частота\n";
    for (const [symbol, count] of Object.entries(freq)) {
        csv += `${symbol},${count}\n`;
    }

    fs.writeFileSync("MerklDamgorFixedPosition.csv", "\uFEFF" + csv, "utf8");

    expect(avgDiff).toBeGreaterThan(30);
});   

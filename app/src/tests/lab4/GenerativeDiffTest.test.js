import { SPNet } from "../../logic/spNet";
import { RusABC } from "../../logic/abc";
import fs from "fs";

const CHAIN_LENGTH = 1000;

test("Генеративный дифференциальный тест", () => {
    const worker = new SPNet();
    const abc = new RusABC();
    const letters = Object.values(abc.ABC);

    const key = "ХЭЛЛО_КИТТИ__ТЧК";

    const sets = [
        [worker.tapsToBinaryArray([19,18]), worker.tapsToBinaryArray([18,7]), worker.tapsToBinaryArray([17,3])],
        [worker.tapsToBinaryArray([19,18]), worker.tapsToBinaryArray([18,7]), worker.tapsToBinaryArray([16,14,13,11])],
        [worker.tapsToBinaryArray([19,18]), worker.tapsToBinaryArray([18,7]), worker.tapsToBinaryArray([15,13,12,10])],
        [worker.tapsToBinaryArray([19,18]), worker.tapsToBinaryArray([18,7]), worker.tapsToBinaryArray([14,5,3,1])]
    ];
    const roundKeys = worker.produceRoundKeys(key, 2, sets);

    let X = "";
    let Y = "";
    for (let i = 0; i < 16; i++) {
        X += letters[Math.floor(Math.random() * letters.length)];
        Y += letters[Math.floor(Math.random() * letters.length)];
    }

    const di = [];

    for (let i = 0; i < CHAIN_LENGTH; i++) {
        // C[Xi] и C[Yi]
        const Ci_X = worker.frw_SPNet(X, roundKeys, 2);
        const Ci_Y = worker.frw_SPNet(Y, roundKeys, 2);

        // Qi = Ci_X XOR Ci_Y
        const Ci_X_bits = worker.lb2b(Ci_X);
        const Ci_Y_bits = worker.lb2b(Ci_Y);
        const Qi_bits = Ci_X_bits.map((b, idx) => b ^ Ci_Y_bits[idx]);

        // Oi = C[Xi XOR Yi]
        const X_XOR_Y_bits = worker.lb2b(X).map((b, idx) => b ^ worker.lb2b(Y)[idx]);
        const X_XOR_Y = worker.b2lb(X_XOR_Y_bits);
        const Oi_bits = worker.lb2b(worker.frw_SPNet(X_XOR_Y, roundKeys, 2));

        let hamming = 0;
        for (let j = 0; j < Qi_bits.length; j++) {
            if (Qi_bits[j] !== Oi_bits[j]) hamming++;
        }
        di.push(hamming);

        X = worker.frw_SPNet(X, roundKeys, 2);
        Y = worker.frw_SPNet(Y, roundKeys, 2);
    }

    console.log("Массив расстояний di:", di);

    let csv = "i,HammingDistance\n";
    di.forEach((d, idx) => {
        csv += `${idx + 1},${d}\n`;
    });

    fs.writeFileSync("GenDifferentialDistances2.csv", "\uFEFF" + csv, "utf8");
});
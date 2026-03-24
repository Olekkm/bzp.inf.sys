import { SPNet } from "../../logic/spNet";
import { RusABC } from "../../logic/abc";
import fs from "fs";

const TESTS = 100;
const COPIES = 80;

test("Строгий аваланш тест", () => {
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

    const totalSum = Array(COPIES).fill(0);

    for (let t = 0; t < TESTS; t++) {

        let PT = '';
        for (let i = 0; i < 16; i++) {
            PT += letters[Math.floor(Math.random() * letters.length)];
        }

        const CT = worker.frw_SPNet(PT, roundKeys, 2);

        const PT_bits = worker.lb2b(PT);
        const CT_bits = worker.lb2b(CT);

        for (let copyIdx = 0; copyIdx < COPIES; copyIdx++) {
            const bitsCopy = [...PT_bits];
            bitsCopy[copyIdx] ^= 1;

            const PT_variant = worker.b2lb(bitsCopy);
            const CT_variant = worker.frw_SPNet(PT_variant, roundKeys, 2);
            const CT_variant_bits = worker.lb2b(CT_variant);

            let hammingDist = 0;
            for (let i = 0; i < CT_bits.length; i++) {
                if (CT_bits[i] !== CT_variant_bits[i]) hammingDist++;
            }
            totalSum[copyIdx] += hammingDist;
        }
    }

    console.log("Хэммингово расстояние:", totalSum);
    let csv = "Позиция,Частота\n";
    totalSum.forEach((count, pos) => {
        csv += `${pos + 1},${count}\n`;
    });

    fs.writeFileSync("AvalancheFrequencies2.csv", "\uFEFF" + csv, "utf8")


});
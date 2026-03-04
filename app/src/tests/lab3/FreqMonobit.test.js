import { RandomGenerator } from "../../logic/randomGenerator";
import { RusABC } from "../../logic/abc";

const REPLICATIONS = 200;
const OUTPUTS_NEEDED = 50;

const SET = [
    [[19,18], [18,7], [17,3]],
    [[19,18], [18,7], [16,14,13,11]],
    [[19,18], [18,7], [15,13,12,10]],
    [[19,18], [18,7], [14,5,3,1]]
];

test("Частотный монобитный тест для C-AS-LFSR", () => {
    const gen = new RandomGenerator();
    const abc = new RusABC();
    const letters = Object.values(abc.ABC);
    
    let passed = 0;
    const xValues = []; 

    for (let rep = 0; rep < REPLICATIONS; rep++) {
        let seed = '';
        for (let i = 0; i < 16; i++) seed += letters[(rep + i * 13) % 32];
        
        let bits = [];
        let state = null;
        
        const binarySet = SET.map(genArr => 
            genArr.map(taps => gen.tapsToBinaryArray(taps))
        );

        for (let out = 0; out < OUTPUTS_NEEDED; out++) {
            
            const [stream, newState] = gen.cAsLFSRnext(
                out ? 'down' : 'up', 
                state, 
                out ? null : seed, 
                binarySet
            );
            
            for (let c of stream) { 
                bits.push(...abc.getCodeFromKey(abc.getKey(c)).split('').map(Number));
            }
            state = newState;
        }
        
        const n1 = bits.filter(b => b === 1).length;
        const p1 = n1 / bits.length;
        const x = Math.abs(1 - 2*p1) / (Math.sqrt(bits.length * p1 * (1-p1)) / bits.length);
        
        xValues.push(x);
        if (x < 3) passed++;
    }
    
    console.log(`\nГистограмма`);
    
    const bins = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 8, 10, 15, 20, 30, 50, 100];
    let histogram = '';
    
    for (let i = 0; i < bins.length - 1; i++) {
        const from = bins[i];
        const to = bins[i+1];
        const count = xValues.filter(x => x >= from && x < to).length;
        
        if (count > 0 || i < 10) {
            const bar = '♡'.repeat(Math.ceil(count / 2)); 
            histogram += `${from.toFixed(1).padStart(5)} - ${to.toFixed(1).padStart(5)} : ${bar.padEnd(50)} ${count}\n`;
        }
    }
    
    console.log(histogram);
    console.log(`\nДоля прошедших (x < 3): ${passed}/${REPLICATIONS} = ${(passed/REPLICATIONS*100).toFixed(1)}%`);
    
    const avgX = xValues.reduce((a, b) => a + b, 0) / xValues.length;
    console.log(`\nСредний x: ${avgX.toFixed(4)}\nМинимальный x: ${Math.min(...xValues).toFixed(4)}\nМаксимальный x: ${Math.max(...xValues).toFixed(4)}`);
    
    expect(passed).toBeGreaterThan(REPLICATIONS * 0.9);
});
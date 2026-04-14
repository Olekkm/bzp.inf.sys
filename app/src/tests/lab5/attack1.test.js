import { lab5 } from "../../logic/lab5.js";
import { RusABC } from "../../logic/abc.js";

test("Атака 1: Bit Flipping через шифротекст", () => {
    const lab = new lab5();
    const keys = "СЕАНСОВЫЙ_КЛЮЧИК";
    const nonce = "СЕМИХАТОВ_КВАНТЫ";
    
    const originalMsg = "ПЕРЕВЕСТИ_НОЛЬ_РУБЛЕЙ";
    const AD = ["ВБ", "АЛИСА_АЖ", "БОБ___ОЧ", "ЕГИПТЯНИН"];
    
    // Шифруем исходное сообщение
    const channel = lab.EAX_CFB(AD, [originalMsg], keys, nonce, "send");
    const packet = lab.receive(channel[0]);
    const [header, iv, ciphertext, originalMAC] = packet;
    
    // Выполняем атаку
    const position = 0;
    const alphabet = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ_";
    
    const originalChar = originalMsg[position];
    const targetChar = originalChar === 'П' ? 'Р' : 'П';
    
    const origIdx = alphabet.indexOf(originalChar);
    const targetIdx = alphabet.indexOf(targetChar);
    const delta = origIdx ^ targetIdx;
    
    const origCipherIdx = alphabet.indexOf(ciphertext[position]);
    const newCipherIdx = origCipherIdx ^ delta;
    const newCipherChar = alphabet[newCipherIdx];
    
    const modifiedCiphertext = newCipherChar + ciphertext.substring(position + 1);
    
    const fakePacket = [header, iv, modifiedCiphertext, originalMAC];
    const fakeStream = lab.transmit(fakePacket);
    const result = lab.EAX_CFB(AD, [fakeStream], keys, nonce, "recieve");
    const isAccepted = result && result[0] && result[0][3] === "OK";
    
    // Вся информация в одном логе
    console.log(`
        Исходное сообщение:   ${originalMsg.padEnd(38)}
        Шифротекст:           ${ciphertext.padEnd(38)}
        Пощиция атаки: ${position}

        Модифицированный:     ${modifiedCiphertext.substring(0, 35)}${modifiedCiphertext.length > 35 ? '...' : ' '.repeat(38 - Math.min(modifiedCiphertext.length, 35))}
        Результат:            ${isAccepted ? "ПРИНЯТО" : "ОТКЛОНЕНО"}${" ".repeat(38 - (isAccepted ? 8 : 11))}
    `);
    
    expect(isAccepted).toBe(false);
});
import { lab5 } from "../../logic/lab5.js";

test("Атака 2: Replay Attack", () => {
    const lab = new lab5();
    const keys = "СЕАНСОВЫЙ_КЛЮЧИК";
    const nonce = "СЕМИХАТОВ_КВАНТЫ";
    
    const msg1 = "ПЕРЕВЕСТИ_НОЛЬ_РУБЛЕЙ";
    const msg2 = "ПЕРЕВЕСТИ_ПЯТЬ_РУБЛЕЙ";
    const AD = ["ВБ", "АЛИСА_АЖ", "БОБ___ОЧ", "ЕГИПТЯНИН"];
    
    // Отправляем первое сообщение
    const channel1 = lab.EAX_CFB(AD, [msg1], keys, nonce, "send");
    const packet1 = lab.receive(channel1[0]);
    const [header1, iv1, ciphertext1, mac1] = packet1;
    
    // Отправляем второе сообщение
    const channel2 = lab.EAX_CFB(AD, [msg2], keys, nonce, "send");
    const packet2 = lab.receive(channel2[0]);
    const [header2, iv2, ciphertext2, mac2] = packet2;
    
    // Replay: пытаемся отправить первое сообщение снова
    const replayStream = lab.transmit([header1, iv1, ciphertext1, mac1]);
    const replayResult = lab.EAX_CFB(AD, [replayStream], keys, nonce, "recieve");
    const isReplayAccepted = replayResult && replayResult[0] && replayResult[0][3] === "OK";
    
    // Вся информация в одном логе
    console.log(`

        Сообщение 1:        ${msg1.padEnd(38)}
        IV:                 ${iv1.padEnd(38)}
        Сообщение 2:        ${msg2.padEnd(38)}
        IV:                 ${iv2.padEnd(38)}
        REPLAY: повторная отправка сообщения 1                         
        Результат replay:   ${isReplayAccepted ? "ПРИНЯТО" : "ОТКЛОНЕНО"}${" ".repeat(38 - (isReplayAccepted ? 8 : 11))}
    `);
    
    expect(isReplayAccepted).toBe(false);
});
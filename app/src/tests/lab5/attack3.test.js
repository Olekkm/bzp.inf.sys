import { lab5 } from "../../logic/lab5.js";

test("Атака: Подмена типа сообщения (Type Confusion)", () => {
    const lab = new lab5();
    const keys = "СЕАНСОВЫЙ_КЛЮЧИК";
    const nonce = "СЕМИХАТОВ_КВАНТЫ";
    
    const originalMsg = "ПЕРЕВЕСТИ_НОЛЬ_РУБЛЕЙ";
    const AD_VB = ["ВБ", "АЛИСА_АЖ", "БОБ___ОЧ", "ЕГИПТЯНИН"];
    const AD_VA = ["ВА", "АЛИСА_АЖ", "БОБ___ОЧ", "ЕГИПТЯНИН"];
    
    // Отправляем защищённое сообщение (тип ВБ)
    const channel = lab.EAX_CFB(AD_VB, [originalMsg], keys, nonce, "send");
    const packet = lab.receive(channel[0]);
    const [header, iv, ciphertext, mac] = packet;
    
    // Меняем тип с "ВБ" на "ВА" в заголовке
    const modifiedHeader = [...header];
    modifiedHeader[0] = "ВА";
    
    // Отправляем поддельный пакет с новым типом
    const fakePacket = [modifiedHeader, iv, ciphertext, mac];
    const fakeStream = lab.transmit(fakePacket);
    
    const result = lab.EAX_CFB(AD_VA, [fakeStream], keys, nonce, "recieve");
    const isAccepted = result && result[0] && result[0][3] === "OK";
    
    // Вся информация в одном логе
    console.log(`
        Исходный тип:        ${header[0].padEnd(38)}
        Сообщение:           ${originalMsg.padEnd(38)}
        MAC:                 ${mac.padEnd(38)}
        Модифицированный тип: ${modifiedHeader[0].padEnd(38)}
        Результат:           ${isAccepted ? "ПРИНЯТО" : "ОТКЛОНЕНО"}${" ".repeat(38 - (isAccepted ? 8 : 11))}
    `);
    
    expect(isAccepted).toBe(false);
});
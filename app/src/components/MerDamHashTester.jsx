import { useState } from "react"
import { Merkl_Damgor } from "../logic/merkl_damgor.js"

export default function MerDamHashTester({ style }) {
    const [plainText, setPlainText] = useState("")
    const [encoded, setEncoded] = useState("")

    function handleClick() {
        const worker = new Merkl_Damgor()
        const hash = worker.merDam_hash(plainText)
        setEncoded(hash)
    }

    return (
        <div style={{ paddingLeft: "1rem", ...style }}><h2>Меркл-Дамгор. Хэш-функция</h2>
            <br />
            <div style={{ minHeight: "3rem", display: "inline-block" }}>
                <input
                    value={plainText}
                    placeholder="Хэшируемый текст"
                    onChange={(e) => setPlainText(e.target.value)}
                    style={{ border: "1px solid black", display: "block", marginBottom: "0.5rem", fieldSizing: "content", minWidth: "30rem" }}></input>
                <button style={{ border: "1px solid black" }}
                    onClick={handleClick}
                >Зашифровать</button>
            </div>
            <div style={{ minHeight: "3rem", display: "block", paddingLeft: "0rem" }}>
                <p>Зашифрованное значение:</p>
                <p>{encoded ? encoded : "Ожидаем..."}</p>
            </div>
        </div >)

}
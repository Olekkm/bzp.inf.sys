import { useState } from "react"

export default function MerDamHashTester({ style }) {
    const [encoded, setEncoded] = useState("")

    return (
        <div style={{ paddingLeft: "1rem", ...style }}><h2>Меркл-Дамгор. Хэш-функция</h2>
            <br />
            <div style={{ minHeight: "3rem", display: "inline-block" }}>
                <input
                    style={{ border: "1px solid black", display: "block", marginBottom: "0.5rem", fieldSizing: "content", minWidth: "30rem" }}></input>
                <button style={{ border: "1px solid black" }}
                >Зашифровать</button>
            </div>
            <div style={{ minHeight: "3rem", display: "block", paddingLeft: "0rem" }}>
                <p>Зашифрованное значение:</p>
                <p>{encoded ? encoded : "Ожидаем..."}</p>
            </div>
        </div >)

}
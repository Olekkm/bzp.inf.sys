import CyphererTester from "../components/CyphererTester";
import VigenereSelector from "../components/VigenereSelector";
import { CaesarCoder } from "../logic/caesar";
import { VigenereCoder } from "../logic/vigenere";

export default function Lab1_page() {
    return (<>
        <CyphererTester componentLabel={"Шифр Цезаря"} cypherer={new CaesarCoder()} />
        <CyphererTester style={{ marginTop: "3rem" }} componentLabel={"Шифр Виженера"} cypherer={new VigenereCoder("BaseVigenere")}>
            <VigenereSelector />
        </CyphererTester>
    </>)

}
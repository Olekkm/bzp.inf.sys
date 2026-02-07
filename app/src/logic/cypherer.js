class cypherer {
    encoder

    constructor(encoder) {
        this.encoder = encoder
    }

    Encode(plainText, keyWord) {
        return this.encoder.Encode()
    }

    Decode(EncodedText, keyWord) {
        return this.encoder.Encode()
    }
}

new cypherer()
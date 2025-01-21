import { decode, encode } from './../libraries/base65536.js'
import { compress, decompress } from './../libraries/compressjson.js'
import jsonCrush from './../libraries/jsoncrush.js'

export const compressJson = dataObject => {
	const jsonCompuressed = compress(dataObject)
	const jsonCrushed = jsonCrush.crush(JSON.stringify(jsonCompuressed))
	const base65536Encoded = encode(new TextEncoder().encode(jsonCrushed))
	return base65536Encoded
}

export const decompressJson = jsonString => {
	const base65536decoded = new TextDecoder().decode(decode(jsonString))
	const jsonUncrushed = JSON.parse(jsonCrush.uncrush(base65536decoded))
	const jsonUncompressed = decompress(jsonUncrushed)
	return jsonUncompressed
}

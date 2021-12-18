import ItemGrabber from './Items'
import { writeFileSync, readFileSync } from 'fs'

const main = async () => {
    const keyData = await ItemGrabber()

    writeFileSync('keys.json', JSON.stringify(keyData, null, 4))
}

main()

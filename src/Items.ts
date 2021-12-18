import RequestData from './Data'
import { CreateHyperlinks, GrabWikiPage } from './Utils'

// const Overrides = JSON.parse(String(readFileSync('overrides.json')).toString()) as Override

export default async function () {
    const keys = await RequestData()

    let keyData: { [key: string]: string[] } = {}

    let i = -1
    for (let key of keys) {
        console.log(`{${i++}/${keys.length}} ${key.name}`)
        keyData[key.id] = await WikiInfo(key)
    }

    return keyData
}

async function WikiInfo(item: Item) {
    //if (Overrides[item.name] !== undefined) return Overrides[item.name]

    const wikiTitle = item.wikiLink.replace('https://escapefromtarkov.fandom.com/wiki/', '')

    const wikiPage = await GrabWikiPage(wikiTitle)

    if (wikiPage) {
        let locationData = wikiPage.slice(wikiPage.indexOf('==Behind the Lock==') + 1)

        locationData.forEach((line, i) => {
            if (line.startsWith('==') && !line.startsWith('===[')) {
                locationData = locationData.slice(0, i)
            }
        })

        if (locationData[0].startsWith('{{Infobox')) {
            return ['No Data']
        }

        return locationData
            .filter((line) => {
                // Only give us lines that have useful information
                return line.startsWith('*') || line.startsWith('===[[')
            })
            .map((l) => {
                let line = l

                if (line.startsWith('*')) {
                    // Bulleted location on the map
                    line = line.replace('* ', '').replace('*', '')
                    line = `${line}`
                } else if (line.startsWith('===')) {
                    // Name of map
                    line = line.replace('===', '').replace('===', '')
                    line = `- ${line}`
                }

                // {{PAGENAME}} is a variable for the items name so we use it as such
                line = line.replaceAll('{{PAGENAME}}', item.shortName)

                // Remove excess HTML tags
                line = line.replaceAll('<[^>]*>', '')

                if (line.includes('Room')) line = `**${line}**`

                return CreateHyperlinks(line)
            })
            .filter((l) => l !== '')
    } else {
        return ['No Data']
    }
}

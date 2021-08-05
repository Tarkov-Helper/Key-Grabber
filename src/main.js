const fs = require('fs')
const got = require('got')

const Insert = (str, add, position) => {
    return [str.slice(0, position), add, str.slice(position)].join('');
}
const Slice = (str, pos) => {
    return str.slice(0, pos) + str.slice(pos + 1)
}

async function GrabKeys() {
    let query = JSON.stringify({
        query: `{
            itemsByType(type: keys) {
              id
              name
              wikiLink
            }
          }`
    })
    let response = await got.post('https://tarkov-tools.com/graphql', {
        body: query,
        responseType: 'json',
    })

    return response.body.data.itemsByType
}


(async() => {
    try {
        fs.rmSync('./output', { recursive: true })
    } catch {}
    fs.mkdirSync('./output')

    let keyList = await GrabKeys()

    let output = new Object()

    for (let key of keyList) {
        console.log(`Grabbing key: ${key.name}`)

        let wikiPage = key.wikiLink.replace('https://escapefromtarkov.fandom.com/wiki/', '')

        let response = await got(`https://escapefromtarkov.fandom.com/api.php?action=query&prop=revisions&titles=${wikiPage}&rvprop=content&format=json`)
        response = JSON.parse(response.body)

        let wikiText = response.query.pages
        wikiText = wikiText[Object.keys(wikiText)[0]]
            // console.log(wikiText.revisions)
        wikiText = wikiText.revisions[0]['*']

        if (!wikiText.includes('==Behind the Lock==')) {
            output[key.name] = []
            continue
        } else {
            let loot = wikiText.split('==Behind the Lock==')[1].split('==')[0].split('{')[0].split('<')[0].split('\n').filter(str => str !== '')

            // Add links
            for (i in loot) {
                let item = loot[i]

                if (item.startsWith('*')) { // One Room Key

                    while (item.includes('[[') && item.includes(']]')) {

                        let start = item.indexOf('[[')
                        let end = item.indexOf(']]')

                        // Remove one set of brackets
                        item = Slice(item, start)
                        item = Slice(item, end)

                        // Format link
                        let mentionedItem = item.substring(start + 1, end - 1).replaceAll(' ', '_').split('|')[0]
                        let itemLink = `(https://escapefromtarkov.fandom.com/wiki/${mentionedItem})`

                        // Add link to string to create hyperlink
                        item = Insert(item, itemLink, end)
                    }

                } else { // Key has multiple rooms 



                }

                if (item.toLowerCase().includes('room') && !item.includes('https://')) {
                    item = `**${item.replaceAll('* ', '').replaceAll('*', '')}**` // Bolds room name for better readability
                } else {
                    item = item.replaceAll('* ', '').replaceAll('*', '')
                }

                loot[i] = item
            }

            loot = loot.filter(str => str !== '')
            output[key.id] = loot
        }
    }

    fs.writeFileSync('./output/keys.json', JSON.stringify(output, null, 4))

})()
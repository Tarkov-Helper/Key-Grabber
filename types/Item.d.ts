type ItemType =
    | 'any'
    | 'ammo'
    | 'armor'
    | 'backpack'
    | 'barter'
    | 'glasses'
    | 'grenade'
    | 'gun'
    | 'helmet'
    | 'keys'
    | 'markedOnly'
    | 'mods'
    | 'noFlea'
    | 'provisions'
    | 'unLootable'
    | 'wearable'
    | 'rig'
    | 'headphones'
    | 'suppressor'

interface Item {
    id: string
    name: string
    shortName: string
    wikiLink: string
    types: ItemType[]
}

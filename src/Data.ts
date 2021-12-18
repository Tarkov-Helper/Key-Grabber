import { request, gql } from 'graphql-request'

const itemQuery = gql`
    {
        itemsByType(type: any) {
            id
            name
            shortName
            wikiLink
            types
        }
    }
`

export default async function (): Promise<Item[]> {
    const itemResponse = await request('https://tarkov-tools.com/graphql', itemQuery).then((res) => res.itemsByType)
    const itemData = itemResponse as Item[]

    return itemData.filter((item) => item.types.includes('keys'))
}

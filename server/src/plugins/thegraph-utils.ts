import { GraphQLClient, gql } from 'graphql-request'
import { getEvent, getEvents } from '../db';
import { Address, TokenInfo } from '../types';

const mainnetSubgraph = new GraphQLClient('https://api.thegraph.com/subgraphs/name/poap-xyz/poap')

const xDaiSubgraph = new GraphQLClient('https://api.thegraph.com/subgraphs/name/poap-xyz/poap-xdai')

async function getTokenInfo(tokenId: string | number): Promise<TokenInfo> {
    const query = gql`
    {
      token (id: ${tokenId}) {
        id
        owner {
          id
        }
        event {
          id
        }
      }
    }
  `
  let data = await mainnetSubgraph.request(query);
  if (data.token === null) {
      data = await xDaiSubgraph.request(query);
  }
  const token = data.token;
  const event = await getEvent(token.event.id);
  const owner = token.owner.id;
  if (!event) {
    throw new Error('Invalid Event Id');
  }
  return {
    event,
    tokenId: tokenId.toString(),
    owner
  };
}


async function getAllTokens(address: Address): Promise<TokenInfo[]> {
  const events = await getEvents();
  const tokens: TokenInfo[] = []

  const getEvent = (id: number) => {
    const ev = events.find(e => e.id === id);
    if (!ev) {
      throw new Error(`Invalid EventId: ${id}`);
    }
    return ev;
  };

  const mapTokens = (query_tokens: []) => {
    query_tokens.forEach((token: {id: string, event: {id: string, token_count: number}}) => {
        const event = getEvent(Number.parseInt(token.event.id))
        event.supply = token.event.token_count
        tokens.push({
            event: event,
            tokenId: token.id.toString(),
            owner: address,
          });
    });
  }

  const query = gql`
    {
      account (id: "${address.toLowerCase()}") {
        tokens {
          id
          event {
            id
            token_count
          }
        }
      }
    }
  `
  // Get the data from both subgraphs
  let l1Data = await mainnetSubgraph.request(query);
  let l2Data = await xDaiSubgraph.request(query);
    
  // Add the data to the tokens array
  if (l1Data.account) {
    mapTokens(l1Data.account.tokens)
  }
  if (l2Data.account) {
    mapTokens(l2Data.account.tokens)
  }
  
  return tokens.sort((a:any, b:any) => {
    try{
      return new Date(b.event.start_date) > new Date(a.event.start_date) ? 1 : -1
    } catch (e) {
      return -1
    }
  })
}

export default {
    mainnetGraph: mainnetSubgraph,
    xDaiGraph: xDaiSubgraph,
    getTokenInfo: getTokenInfo,
    getAllTokens: getAllTokens
}

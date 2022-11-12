import axios from "axios";
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API;
axios.defaults.headers.post['Content-Type'] = 'application/json';

async function fetchAPI(query, variables = {}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })
  const json = await res.json()
  if (json.errors) {
    throw new Error('Failed to fetch API')
  }

  return json.data;
}

export async function getHomePage() {
    const data = await fetchAPI(
      `
      query {
        home {
            announcement {
              Title,
              paragraph
            }
            Gimmicks {
                Title,
                Description,
                Pics {
                    Picture {
                        url,
                    },
                },
            },
            About {
                Title1,
                Description1,
                Title2,
                Members {
                    Name,
                    Picture {
                        url,
                    },
                    Hover {
                        url,
                    },
                },
            },
            FAQ {
                Question,
                Answer,
            },
        },
    }
    `,
    {}
  )
  return {
    home: data?.home,
  }
}

// Gimmicks

export async function getGimmicks() {
  const data = await fetchAPI(
    `
    query { 
      gimmicks {
        id
        Name
        NFTID
        Details {
          Name
          BirthDate
          BirthPlace
          Citizenship
          Occupation
          Spouse
        }
        Properties {
          Bodies
          RightArm
          LeftArm
          Eyes
          Name
          Accessories
          Pendants
          Expression
          Collar
          Backdrops
        }
        Description
        Avatar {
          url
        }
      }
    }
  `,
  {}
  )
  return {
    gimmicks: data?.gimmicks,
  }
  // return null;
}
export async function getSomeGimmicks(limit) {
  const data = await fetchAPI(
    `
    query($limit: Int) {
      gimmicks(limit: $limit) {
        id
        Name
        NFTID
        Details {
          Name
          BirthDate
          BirthPlace
          Citizenship
          Occupation
          Spouse
        }
        Properties {
          Bodies
          RightArm
          LeftArm
          Eyes
          Name
          Accessories
          Pendants
          Expression
          Collar
          Backdrops
        }
        Description
        Avatar {
          url
        }
      }
    }
  `,
  {
    limit: limit
  }
  )
  return {
    gimmicks: data?.gimmicks,
  }
  return null;
}
export async function getGimmick(address) {
  try {  
    const res = await axios.get(`/getGimmick?address=${address}`);
    return res.data;
  }catch(error){
    return [];
  }
}

export async function getPunches(address) {
  try {
    const res = await axios.get(`/getPunches?address=${address}`);
    return res.data;
  }catch(error){
    return [];
  }
}

// no longer in use, use saveGimmick()
// export async function updateGimmick(id, description, details) {
//   const data = await fetchAPI(
//     `
//       mutation($id: ID!, $description: String, $detail: editComponentGimmickDetailsDetailInput ) {
//         updateGimmick(input: {where: {id: $id}, data: { Description: $description, Details: $detail }})
//         { 
//           gimmick {
//             Description
//           }
//         }
//       }
//     `,
//     {
//       id: id,
//       description: description,
//       detail: details
//     }
//   )
//   return {
//     gimmicks: data?.gimmicks,
//   }
// }




export const saveGimmick = async (signature, id, message, wallet, description, details) => {
  try {
    const res = await axios.post('/saveGimmick', 
    {
      variables:
      {
        id: id,
        description: description,
        details: details,
        message: message,
        wallet: wallet,
      },
      signature: signature
    });
    
    return res;
  } catch(error) {
    return error.response.data;
  }
}

export const getLeaderBoard = async (week) => {
  const res = await axios.get(`/gimmicks/leaderboard?week=${week}`);
  if(res) {
    return res.data;
  }
};
export const getMintedGimmicksAmount = async () => {
  const res = await axios.get('/gimmicks/amount');
  if(res) {
    return res.data.amount;
  }
};
export const getMintedGimmicksRange = async ({lowerLimit, upperLimit, updated=false}) => {

  const res = await axios.post('/gimmicks/range', {lowerLimit: lowerLimit, upperLimit: upperLimit, updated: updated});
  if(res) {
    return res.data;
  }
};
export const getSearchedMintedGimmicks = async ({query,updated=false}) => {
  const res = await axios.post('/gimmicks/search', {query: query,updated:updated});
  if(res) {
    return res.data;
  }
};

// Places

export async function getPlaces() {
  const data = await fetchAPI(
    `
    query { 
      places {
        id
        Name
        Description
        Avatar {
          url
        }
      }
    }
  `,
  {}
  )
  return {
    places: data?.places,
  }
  // return null;
}

export async function getSomePlaces(limit) {
  const data = await fetchAPI(
    `
    query($limit: Int) {
      places(limit: $limit) {
        id
        Name
        Description
        Avatar {
          url
        }
      }
    }
  `,
  {
    limit: limit
  }
  )
  return {
    places: data?.places,
  }
  return null;
}

export async function getPlace(id) {
  const data = await fetchAPI(
    `
    query($id: ID!) {
      place(id: $id) {
        id
        Name
        Description
        Avatar {
          url
        }
      }
    }
  `,
  {
    id: id
  }
  )
  return {
    place: data?.place,
  }
  return null;
}
export const savePlace = async (verifiedWallet, id, description, details) => {
  // const res = await axios.post('/savePlaceStrapi', 
  // {
  //   variables:
  //   {
  //     id: id,
  //     description: description
  //   },
  //   verifiedWallet: verifiedWallet
  // })
  //   .then((res) => {
  //     return res;
  //   })
  //   .catch((err) => {
  //     return err;
  //   })
  // if (res) {
  //   return res;
  // }
}

// events

export async function getEvents() {
  const data = await fetchAPI(
    `
    query { 
      events {
        id
        Name
        Description
        Avatar {
          url
        }
      }
    }
  `,
  {}
  )
  return {
    events: data?.events,
  }
  // return null;
}

export async function getSomeEvents(limit) {
  const data = await fetchAPI(
    `
    query($limit: Int) {
      events(limit: $limit) {
        id
        Name
        Description
        Avatar {
          url
        }
      }
    }
  `,
  {
    limit: limit
  }
  )
  return {
    events: data?.events,
  }
  return null;
}

export async function getEvent(id) {
  const data = await fetchAPI(
    `
    query($id: ID!) {
      event(id: $id) {
        id
        Name
        Description
        Avatar {
          url
        }
      }
    }
  `,
  {
    id: id
  }
  )
  return {
    event: data?.event,
  }
  return null;
  }

  export const saveEvent = async (verifiedWallet, id, description) => {
    // const res = await axios.post('/saveEventStrapi', 
    // {
    //   variables:
    //   {
    //     id: id,
    //     description: description,
    //   },
    //   verifiedWallet: verifiedWallet
    // })
    //   .then((res) => {
    //     return res;
    //   })
    //   .catch((err) => {
    //     return err;
    //   })
    // if (res) {
    //   return res;
    // }
  }

  //Factions

  export async function getFactions() {
    const data = await fetchAPI(
      `
      query { 
        factions {
          id
          Name
          Description
          Avatar {
            url
          }
        }
      }
    `,
    {}
    )
    return {
      factions: data?.factions,
    }
    // return null;
  }
  
  export async function getSomeFactions(limit) {
    const data = await fetchAPI(
      `
      query($limit: Int) {
        factions(limit: $limit) {
          id
          Name
          Description
          Avatar {
            url
          }
        }
      }
    `,
    {
      limit: limit
    }
    )
    return {
      factions: data?.factions,
    }
    return null;
  }
  
export async function getFaction(id) {
const data = await fetchAPI(
  `
    query($id: ID!) {
      faction(id: $id) {
        id
        Name
        Description
        Avatar {
          url
        }
      }
    }
  `,
  {
    id: id
  }
  )
  return {
    faction: data?.faction,
  }
  return null;
}
  
export const saveFaction = async (verifiedWallet, id, description) => {
  // endpoint not added in node
  const res = await axios.post('/saveFactionStrapi', 
  {
    variables:
    {
      id: id,
      description: description,
    },
    verifiedWallet: verifiedWallet
  })
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    })
  if (res) {
    return res;
  }
}

  // store
export async function getStorePage() {
  const data = await fetchAPI(
    `
    query {
      store {
          StoreHeader {
            Title,
            SubTitle,
            Background {
              url
            }
          }
      },
    }
    `,
    {}
  )
  return {
    store: data?.store,
  }
}

// export const sendReport = async () => {
//   const res = await axios.post('https://formspree.io/f/{form_id}', 
//   {
//     variables:
//     {
//       id: id,
//       description: description,
//     },
//     verifiedWallet: verifiedWallet
//   })
//     .then((res) => {
//       return res;
//     })
//     .catch((err) => {
//       return err;
//     })
//   if (res) {
//     return res;
//   }
// }
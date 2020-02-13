
const getUserId = (data) => {
    let arr = []
    for (let i = 0; i < data.length; i++) {
        arr.push(data[i].content.$t)
    }
    return arr.join(',')
}


export const getTable = (getUser) => {
    fetch('https://spreadsheets.google.com/feeds/cells/1SX9lV4-URRyErZJT-tDc6-A4vbpMzTniQKtUsRk10kg/1/public/full?alt=json')
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if(data) {
                // setShowUsers(getUserId(data.feed.entry))
                getUser(getUserId(data.feed.entry))
            }
        })
}



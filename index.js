const request = require('request-promise');
const Promise = require('bluebird');
const _ = require('lodash');

const URL = 'http://castles.poulpi.fr'
const ENTRY = '/castles/1/rooms/entry';
const EMPTY = 'This chest is empty :/ Try another one!';



const rq = (endpoint) => {
    const options = {
        uri:`${URL}${endpoint}`,
        json: true,
    };
    return request(options);
}


const collect = (endpoint) => {

    return rq(endpoint)
        .then(response => {
            const { id, rooms, chests } = response;
            if (!rooms || !rooms.length) {
                return chests || [];
            } else {
                return Promise.all(rooms.map(room => collect(room)))
                    .then(_chests => {
                        return [ ..._.flatten(_chests), ...chests ]
                    });
            }
        })
        .catch(err => {
            console.log(err);
            return [];
        })
}


return collect(ENTRY)
    .then(chests => {
        return Promise.filter(chests, (current) => {
            return rq(current)
                .then(response => {
                    const { status } = response;
                    return status !== EMPTY;
                });
            });
        })
    .then(chests => {
        console.log(`There are ${chests.length} chests with a treasure.`);
    })

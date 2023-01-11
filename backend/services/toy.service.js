const fs = require('fs');
// const PAGE_SIZE = 30000
var toys = require('../data/toy.json')

module.exports = {
    query,
    get,
    remove,
    save
}

function query(filterBy) {
    filterBy.labels = filterBy.labels.split(',')
    if (filterBy.labels.length === 1) filterBy.labels = filterBy.labels.join('')
    console.log(filterBy);
    filterBy.maxPrice = +filterBy.maxPrice
    let filteredToys = toys

    if (filterBy.labels) {
        filteredToys = filteredToys.filter(toy => toy.labels.includes(filterBy.labels))
    }
    if (filterBy.txt) {
        const regex = new RegExp(filterBy.txt, 'i')
        filteredToys = filteredToys.filter(toy => regex.test(toy.name))
    }
    if (filterBy.maxPrice) {
        filteredToys = filteredToys.filter(toy => toy.price <= filterBy.maxPrice)
    }
    // console.log('filteredToys:', filteredToys);
    return Promise.resolve(filteredToys)
}

function get(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    if (!toy) return Promise.reject('Toy not found')
    return Promise.resolve(toy)
}

function remove(toyId, loggedinUser) {
    const idx = toys.findIndex(toy => toy._id === toyId)
    if (idx === -1) return Promise.reject('No Such Toy')
    const toy = toys[idx]
    if (toy.owner._id !== loggedinUser._id) return Promise.reject('Not your Toy')
    toys.splice(idx, 1)
    return _writeCarsToFile()
}

function save(toy, loggedinUser) {
    if (toy._id) {
        const toyToUpdate = toys.find(currToy => currToy._id === toy._id)
        if (!toyToUpdate) return Promise.reject('No such Toy')
        if (toyToUpdate.owner._id !== loggedinUser._id) return Promise.reject('Not your Toy')

        toyToUpdate.vendor = toy.vendor
        toyToUpdate.speed = toy.speed
    } else {
        toy._id = _makeId()
        toy.owner = loggedinUser
        toys.push(toy)
    }
    return _writeCarsToFile().then(() => toy)
}


function _makeId(length = 5) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function _writeCarsToFile() {
    return new Promise((res, rej) => {
        const data = JSON.stringify(toys, null, 2)
        fs.writeFile('data/toy.json', data, (err) => {
            if (err) return rej(err)
            // console.log("File written successfully\n");
            res()
        });
    })
}
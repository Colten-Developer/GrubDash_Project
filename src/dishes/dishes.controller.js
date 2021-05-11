const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function dishExists(request, response, next) {
    const { dishesId } = request.params
    const foundDish = dishes.find((dish) => dish.id === dishesId)
    response.locals.dish = foundDish

    if(foundDish) {
        return next()
    }
    next({ status: 404, message: `${dishesId}`})
}

function hasName(req, res, next) {
    const { data: { name } = {} } = req.body

    if (name) {
        return next()
    }
    next({ status: 400, message: `A 'name' property is required.` })
}

function hasDescription(req, res, next) {
    const { data: { description } = {} } = req.body

    if(description) {
        return next()
    }
    next({ status: 400, message: `A 'description' property is required` })
}

function hasImageUrl(req, res, next) {
    const { data: { image_url } = {} } = req.body

    if(image_url) {
        return next()
    }
    next({ status: 400, message: `A 'image_url' property is required` })
}

function hasProperPrice(req, res, next) {
    const { data: { price } = {} } = req.body

    if(!price) {
        next({ status: 400, message: 'Dish must include a price' })
    }else if(price <= 0) {
        next({ status: 400, message: 'Dish must have a price that is an integer greater than 0' })
    }else if (typeof price != 'number') {
        next({ status: 400, message: 'Dish must have a price that is an integer greater than 0' })
    }else {
        next()
    }
}

function read(request, response) {
    response.json({ data: response.locals.dish })
}

function create(request, response) {
    const dishBody = request.body.data;
	console.log(dishBody)
    const newDish = { id: nextId(), name: dishBody.name, description: dishBody.description, image_url: dishBody.image_url, price: dishBody.price };
	console.log(newDish)
    dishes.push(newDish);
    response.status(201).json({ data: newDish });
  }

function list (request, response) {
    response.json({ data: dishes })
}

function update(request, response, next) {
    const { dish } = response.locals
    let originalDish = dish
    let newDish = request.body.data

    if(!newDish.id) {
        newDish.id = originalDish.id
    }


    if(originalDish.id != newDish.id) {
        return next({status: 400, message: `Dish id does not match route id. Dish: ${dish.id}, Route: ${newDish.id}` })
    }

    if (originalDish != newDish) {
        originalDish = newDish
    }
    response.json({ data: originalDish })
}

function destroy(request, response, next) {
    const { dishesId } = request.params;
    return next({
      status: 405,
      message: `DELETE Method allowed on urls/${dishesId}`,
    });
  }

module.exports = {
    create: [hasName, hasDescription, hasImageUrl, hasProperPrice, create],
    read: [dishExists, read],
    update: [hasProperPrice, dishExists, hasName, hasDescription, hasImageUrl, update],
    delete: [destroy],
    list,
    dishExists,
  }
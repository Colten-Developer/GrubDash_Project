const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function orderExists(request, response, next) {
    const { orderId } = request.params
    const foundOrder = orders.find((order) => order.id ===orderId)
    response.locals.order = foundOrder

    if(foundOrder) {
        return next()
    }
    next({ status: 404, message: `${orderId}`})
}

function hasDeliverTo(req, res, next) {
    const { data: { deliverTo } = {} } = req.body

    if(deliverTo) {
        return next()
    }
    next({ status: 400, message: 'deliverTo'})
}

function hasMobileNumber(req, res, next) {
    const { data: {mobileNumber } = {} } = req.body

    if(mobileNumber) {
        return next()
    }
    next({ status: 400, message: `A 'mobileNumber' property is required`})
}


//this is always returning 1 when inside the update and returns the wrong data when used
function hasDishes(req, res, next) {
    const { data: { dishes } = {} } = req.body
	
	if(dishes && Array.isArray(dishes) && dishes.length >0) {
		return next()
	}
	
	/*
	if(!dishes || typeof dishes != 'object'){
		next({ status: 400, message: `A 'dishes' property is required`})
	}else if(dishes.length === 0) {
		next({ status: 400, message: `dish`})
	}
	
	dishes.forEach((dish) => {
		if(dish.quantity === 0){
			next({ status: 400, message: '0'})
		}else if(!dish.quantity){
			next({ status: 400, message: '1'})
		}else if(Number.isInteger(dish.quantity)){
			next({status: 400, message: '2'})
		}
	})
	*/
    return next({ status: 400, message: `Order must include a dish ${dishes}`})
}

function dishQuantityProperty(req, res, next) {
	
	const { data: { dishes } = {} } = req.body
	dishes.forEach((dish, index) => {
		console.log(dish , index)
		
		if(!dish.quantity || dish.quantity === 0 || typeof dish.quantity !== 'number') {
			return next({ status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0`})
		}
	})
	
	return next()
}

function hasStatus(req, res, next) {
    const { data: { status } = {} } = req.body

    if(status && status != 'invalid') {
        return next()
    }
    next({ status: 400, message: 'status'})
}

function read(request, response) {
    response.json({ data: response.locals.order })
}

function create(request, response) {
    const orderBody = request.body.data;
	console.log(orderBody)
    const newOrder = { id: nextId(), deliverTo: orderBody.deliverTo, mobileNumber: orderBody.mobileNumber, status: orderBody.status, dishes: orderBody.dishes };
    orders.push(newOrder);
    response.status(201).json({ data: newOrder });
  }

function list (request, response) {
    response.json({ data: orders })
}

function update(request, response, next) {
    const { order } = response.locals
    let originalOrder = order
    let newOrder = request.body.data

    if(!newOrder.id) {
        newOrder.id = originalOrder.id
    }


    if(originalOrder.id != newOrder.id) {
        return next({status: 400, message: `Order id does not match route id. Order: ${order.id}, Route: ${newOrder.id}` })
    }

    if (originalOrder != newOrder) {
        originalOrder = newOrder
    }
    response.json({ data: originalOrder })
}

function destroy(request, response, next) {
    const { orderId } = request.params;
	const index = orders.findIndex((order) => order.id == orderId)
	
	let activeStatus = orders[index].status
	if(activeStatus !== 'pending'){
		return next({ status: 400, message: `pending`})
	}
	
	if(index > -1) {
		orders.splice(index, 1)
		response.sendStatus(204)
	}

  }
  
module.exports = {
    read: [orderExists, read],
    update: [orderExists, hasDeliverTo, hasMobileNumber, hasDishes, dishQuantityProperty, hasStatus, update],
    destroy: [orderExists, destroy],
    create: [hasDeliverTo, hasMobileNumber, hasDishes, dishQuantityProperty, create],
    list,
}
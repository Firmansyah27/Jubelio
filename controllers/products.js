
exports.import_products = async (request, h) => {
    try {
        const cs = new request.pgp.helpers.ColumnSet(['name', 'sku', 'image', 'price', 'description'], {table: 'products'});
        const query = request.pgp.helpers.insert(request.payload, cs);
        await request.db.none(query);
        return h.response({ message: "Product imported successfully", "statusCode": 200 })
    } catch (error) {
        return h.response({"Error": error.message}).code(400)
    }
}   

exports.create_product = async (request, h) => {
    try {
        var payload = request.payload
        var data = await request.db.one('INSERT INTO products(name, sku, image, price, description) VALUES (${name}, ${sku}, ${image}, ${price}, ${description}) RETURNING id', payload)
        return h.response({ message: "Products created successfully", product: { id: data.id}, "statusCode": 200  })
    } catch (error) {
        return h.response({"Error": error.message}).code(400)
    }
}   

exports.update_product = async (request, h) => {
    try {
        const id = request.params.id
        var product = await request.db.one('SELECT * FROM products WHERE id=$1', id)
        const condition = ` WHERE id = ${product.id}`
        const query = request.pgp.helpers.update(request.payload, ['name', 'sku', 'image', 'price', 'description'], 'products') + condition;
        await request.db.none(query)
        return h.response({ message: "Products updated successfully", "statusCode": 200 })
    } catch (error) {
        if(error.message.includes('No data returned from the query.')) return h.response({"Error": "Product not found or deleted."}).code(400)
        return h.response({"Error": error.message}).code(400)
    }
}   

exports.delete_product = async (request, h) => {
    try {
        const id = request.params.id
        await request.db.one('SELECT * FROM products WHERE id=$1', id)
        await request.db.none('DELETE FROM products WHERE id=$1', id)
        return h.response({ message: "Products deleted successfully", "statusCode": 200 })
    } catch (error) {
        if(error.message.includes('No data returned from the query.')) return h.response({"Error": "Product not found or deleted."}).code(400)
        return h.response({"Error": error.message}).code(400)
    }
}   

exports.list_product = async (request, h) => {
    const query_param = request.query
    const limit = query_param.limit
    const offset = (query_param.page - 1)* limit
    try {
        const [products, counts] = await request.db.multi('SELECT * FROM products ORDER BY id ASC LIMIT $1 OFFSET $2; SELECT COUNT(*) FROM products', [limit, offset])
        return h.response({products, counts})
    } catch (error) {
        if(error.message.includes('No data returned from the query.')) return h.response({"Error": "Product not found or deleted."}).code(400)
        return h.response({"Error": error.message}).code(400)
    }
}

exports.get_product = async (request, h) => {
    try {
        const id = request.params.id
        var product = await request.db.one('SELECT * FROM products WHERE id=$1', id)
        return h.response(product)
    } catch (error) {
        if(error.message.includes('No data returned from the query.')) return h.response({"Error": "Product not found or deleted."}).code(400)
        return h.response({"Error": error.message}).code(400)
    }
}   

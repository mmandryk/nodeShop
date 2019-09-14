const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth')


const Product = require('../models/product');

//---------------------------------------------------------------------------POBIERA PRODUCT
router.get('/', (req, res, next) => {
    Product.find()
        .select("name price _id")
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id
                        }
                    }
                })
            }
            // if (docs.lenght >= 0) {
            res.status(200).json(response);
            // } else {
            //     res.status(404).json({
            //         message: "no entries found"
            //     })
            // }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
});
//-----------------------------------------------------------------------------ZAMIESZCA PRODUKT
router.post('/', checkAuth, (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Product Created!',
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    request: 'GET',
                    url: 'http://localhost:3000/products/' + result._id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        })
});
//--------------------------------------------------------------------------------ID
router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('name price _id')
        .exec()
        .then(doc => {
            console.log("From database", doc);
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/'
                    }
                });
            } else {
                res.status(404).json({ message: "no id in base" })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});
//-----------------------------------------------------------------------------------UPDATE po slashu special
router.patch('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product updated!',
                request: {
                    type: 'UPDATE',
                    url: 'http://localhost:3000/products/' + id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
});
//-------------------------------------------------------------------------------------DELETE po slashu special
router.delete('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    Product.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product ' + id + ' deleted!',
                request: {
                    type: 'DELETE',
                    url: 'http://localhost:3000/produsts/',
                    body: { name: 'String', prise: 'Number' }
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});
module.exports = router;
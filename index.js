
const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000;
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nzh9xhl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJwt(req, res, next) {
    const authHeader = req.headers.authorization
    console.log(authHeader);
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access from authheader' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN , function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'unauthorixed access from token' })
        }
        req.decoded = decoded;
        next()
    })
}

async function run() {
    try {
        const serviceCollection = client.db('reviewPolish').collection('services')
        const reviewCollection = client.db('reviewPolish').collection('review')

        app.get('/services', async (req, res) => {
            const query = {}
            const result = await serviceCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await serviceCollection.findOne(query)
            res.send(result)
        })

        app.post('/review', async (req, res) => {
            const data = req.body
            const result = await reviewCollection.insertOne(data)
            res.send(result)
        })

        app.post('/jwt', async (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '30d' })
            res.send({ token })
        })


        app.get('/review',verifyJwt,  async (req, res) => {
            const decoded = req.decoded
            if (decoded.email !== req.query.email) {
                return res.status(401).send({ message: 'unauthorized access' })
            }
            let query = {}
            if (req.query.email) {
                query = { reviewerEmail: req.query.email }
            }
            // const email = req.query.email
            // const query = {reviewerEmail: email}
            const result = await reviewCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/review/:id', async (req, res) => {
            const id = req.params.id
            const query = { foodId: id }
            const result = await reviewCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await reviewCollection.findOne(query)
            res.send(result)
        })
        app.delete('/review/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
        })

        app.post('/services', async (req, res) => {
            const data = req.body
            const result = await serviceCollection.insertOne(data)
            res.send(result)
        })

        app.put('/review/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const data = req.body
            const option = { upsert: true }
            const updatedReview = {
                $set: {
                    review: data.review
                }
            }
            const result = await reviewCollection.updateOne(filter, updatedReview, option);
            res.send(result)
        })


    }
    finally {

    }
}
run().catch(console.log)

app.get('/', (req, res) => {
    res.send('review server is running')
})

app.listen(port, (req, res) => {
    console.log('server is running on port', port);
}) 
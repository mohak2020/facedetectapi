const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt-nodejs')
const cors = require('cors')
const knex = require('knex');

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : '123123',
      database : 'smart_brain'
    }
  })

//   console.log(db.select('*').from('users'));

const app = express()

app.use(bodyParser.json())
app.use(cors())

const database = {

users: [
    {
        id: '123',
        name: 'ali',
        email: 'ali@gmail.com',
        password: '123',
        entries: 0,
        joined: new Date()
    },

    {
        id: '124',
        name: 'ahmed',
        email: 'ahmed@gmail.com',
        password: '321',
        entries: 0,
        joined: new Date()
    }
  ]
}



app.get('/', (req, res)=>{

    res.json(database.users)

})

app.post('/signin', (req, res)=>{

    db.select('email', 'hash').from('login')
        .where('email', '=' ,req.body.email)
        .then(data =>{
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
            if(isValid){
                return db.select('*').from('users')
                .where('email', '=', req.body.email)
                .then(user => {
                  res.json(user[0])
                })
                .catch(err => res.status(400).json('unable to get user'))
            } else{
                res.status(400).json('wrong credentials')
            }
        })
        .catch(err => res.status(400).json('wrong credentials'))
})


app.post('/register', (req, res)=>{
    const {email,password,name} = req.body;

    const hash = bcrypt.hashSync(password);

    db.transaction(trx =>{
        trx.insert({
            email: email,
            hash: hash
        })
        .into('login')
        .returning('email')
        .then(loginEmail =>{

            return trx('users')
                .returning('*')
                .insert({
                    name: name,
                    email: loginEmail[0],
                    joined: new Date()

                    })
                .then(user =>{
                    res.json(user[0])
                    })
            })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json("unable to log in"));

    
})

app.get('/profile/:id', (req, res)=>{
    let found = false;
    const {id} = req.params

    db.select('*').from('users').where({
        id : id
    }).then(user =>{
        if(user.length){
            res.json(user[0])
        } else{
        res.status(400).json('not found')
            }
    }).catch(err=>res.status(400).json('error getting user'))


})

app.post('/image', (req, res)=>{
    //for some reason 'put' method is not working!

    let found = false;
    const {id} = req.body;

    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0])
    })
    .catch(err => res.status(400).json('unable to get entries'))

})

app.listen(3000)










  // database.users.push(
    //     {
    //         id: '126',
    //         name: name,
    //         email: email,
    //         password: password,
    //         entries: 0,
    //         joined: new Date()
    //     }
    // )


    // database.users.forEach(user =>{
    //     if (user.id === id){
    //         found = true;
    //        return res.json(user);
    //     }
    // })

    // if(!found){
    //     res.status(404).json('use not found');
    // }
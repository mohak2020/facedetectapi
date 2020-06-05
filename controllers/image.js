const Clarifai= require('clarifai');

const app = new Clarifai.App({
    apiKey: 'd217f992ade146028bc4a1412d15eecc'
   });

const handleApiCall = (req,res)=>{
    app.models
    .predict(Clarifai.FACE_DETECT_MODEL, this.body.input)
    .then(data =>{
        res.json(data);
    })
    .catch(err=>res.status(400).json('unable to work with API'))
}
   

const handleImage = (req, res)=>{
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

}

module.exports = {
    handleImage,
    handleApiCall
};
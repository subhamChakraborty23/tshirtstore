//try catch and async await or use promise every where
module.exports = (func) =>(req, res, next) =>{
    Promise.resolve(func(req, res, next))
    .catch(next);
}
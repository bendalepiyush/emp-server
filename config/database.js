if(process.env.MONGO_URI){
    module.exports = process.env.MONGO_URI;
}else{
    module.exports = "mongodb://admin:9158674554p@ds129536.mlab.com:29536/emp-attend";
}
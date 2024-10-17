Run MongoDB test:

docker run -it -e MONGO_INITDB_ROOT_USERNAME=root  -e MONGO_INITDB_ROOT_PASSWORD=example -p 27017:27017 mongo

docker run -it -e ME_CONFIG_MONGODB_ADMINUSERNAME=root -e ME_CONFIG_MONGODB_ADMINPASSWORD=example -e ME_CONFIG_MONGODB_URL=mongodb://root:example@172.17.0.4:27017/ -e ME_CONFIG_BASICAUTH=false -p 8081:8081 mongo-express

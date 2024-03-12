export default () => ({
    app: {
        port: parseInt(process.env.APP_PORT) || 3000,
        saltRound: Number(process.env.APP_SALT_ROUND),
        jwtSecretKey: process.env.JWT_SECRET_KEY
    },
    mongo: {
        uri: `${process.env.APP_MONGO_PREFIX}://${process.env.APP_MONGO_HOST}/`,
        user: process.env.APP_MONGO_USERNAME,
        password: process.env.APP_MONGO_PASSWORD,
        db: process.env.APP_MONGO_DATABASE
    }
})
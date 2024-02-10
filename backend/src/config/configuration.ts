export default () => ({
    app: {
        port: parseInt(process.env.APP_PORT) || 3000,
        saltRound: Number(process.env.APP_SALT_ROUND),
        jwtSecretKey: process.env.JWT_SECRET_KEY
    },
    mongoStringConnection: `${process.env.APP_MONGO_PREFIX}://${process.env.APP_MONGO_USERNAME}:${process.env.APP_MONGO_PASSWORD}@${process.env.APP_MONGO_HOST}/${process.env.APP_MONGO_DATABASE}`,
    throttler: {
        ttl: Number(process.env.APP_THROTTLE_TTL),
        limit: Number(process.env.APP_THROTTLE_LIMIT)
    }
})
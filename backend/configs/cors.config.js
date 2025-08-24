const cors = require('cors')

const whitelist = [
    process.env.DOMAIN_REMOTE,
    process.env.DOMAIN_LOCAL,
    'http://localhost:3000',
    'https://ascend-edu-f3de.vercel.app',
    'https://ascend-edu-frontend.vercel.app',
    'https://nexted-frontend.vercel.app'
]

const corsOptions = {
    origin: (origin, cb) => {
        // Allow non-browser requests or same-origin with no Origin header
        if (!origin) return cb(null, true)
        const originIsWhitelisted = whitelist.includes(origin)
        cb(null, originIsWhitelisted)
    },
    credentials: true
}

module.exports = app => {
    app.use(cors(corsOptions))
    // Explicitly handle preflight for all routes
    app.options('*', cors(corsOptions))
}

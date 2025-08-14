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
        console.log('CORS origin:', origin)
        // Allow server-to-server or tools (no origin)
        if (!origin) return cb(null, true)
        const originIsWhitelisted = whitelist.includes(origin)
        cb(null, originIsWhitelisted)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'Accept',
        'Content-Type',
        'X-Requested-With',
        'x-auth-token',
        'Authorization'
    ],
    exposedHeaders: ['x-auth-token'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}

module.exports = app => {
    app.use(cors(corsOptions))
    app.options('*', cors(corsOptions))
}

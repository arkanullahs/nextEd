const cors = require('cors')

const whitelist = [process.env.DOMAIN_REMOTE, process.env.DOMAIN_LOCAL, 'http://localhost:3000', 'https://ascend-edu-f3de.vercel.app', 'https://ascend-edu-frontend.vercel.app','https://nexted-frontend.vercel.app']



const corsOptions = {
    origin: (origin, cb) => {
        const originIsWhitelisted = whitelist.includes(origin)
        cb(null, originIsWhitelisted)
    },
    credentials: true
}


module.exports = app => app.use(cors(corsOptions))

require('dotenv').config();
const jwt = require('jsonwebtoken');

function validationToken(request, response, next) {
    const token = request.headers['authorization'];
    // const token = header && header.split(' ')[1];

    if (!token) return response.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, process.env.JWT_SECRET, { expiresIn: '1h' } , (error, decode) => {
        if (error) return response.status(401).json({ error: 'Unauthorized' });
        request.user = decode;
        next();
    });
}

module.exports = validationToken;
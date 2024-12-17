const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

// Rate limiting middleware (you can use a library like 'express-rate-limit')
const rateLimitMiddleware = require('express-rate-limit')({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(rateLimitMiddleware);

async function getFollowing(id, cursor = "") {
    let following = [];
    try {
        const response = await axios.get(`https://friends.roblox.com/v1/users/${id}/followings?limit=100&sortOrder=Asc${cursor ? `&cursor=${cursor}` : ''}`);
        
        for (let i = 0; i < response.data.data.length; i++) {
            following.push(response.data.data[i]);
        }
        
        if (response.data.nextPageCursor !== null && following.length === 100) { // Only continue if we got 100 items and there's a next page
            return getFollowing(id, response.data.nextPageCursor);
        } else {
            return following;
        }
    } catch (error) {
        console.error('Error fetching followers:', error);
        throw error; // Re-throw the error to be handled by Express
    }
}

app.post('/followers', async (req, res) => {
    try {
        const id = req.body.id;
        const following = await getFollowing(id);
        res.json({ data: following });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({
            data: []
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

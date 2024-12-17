const express = require('express');
const axios = require('axios');
const res = require('express/lib/response');


const app = express();
const port = 3000;
// Route to check if user is following IDs

async function getFollowing(id) {
  let following = []
  try {
    let cursor = ""
    while (true) {
      const response = await axios.get(`https://friends.roblox.com/v1/users/${id}/followings?limit=100&sortOrder=Asc&cursor=${cursor}`);
      
      for (let i = 0; i < response.data.data.length; i++) {
        following.push(response.data.data[i])
      }
      console.log(following)
      if (response.data.nextPageCursor !== null) 
        cursor = response.data.nextPageCursor
      else
        break
    }
    
  } catch (error) {
    console.error(error);
  }
  return following
}
app.post('/followers', async (req, res) => {
  const following = {
    data: await getFollowing(1936118388)
  }
  console.log(following)
  res.json(following)
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

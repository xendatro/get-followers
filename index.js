const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

const cookie = ".ROBLOSECURITY=_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_518FE3E0C9905C0DC5CC38A75E24008DB3995642415B0088BE8BB93BBF2A3834E533D4D8D5B29A174A1CC41BB28FAADE3186E493B0D9287CE6112006D416342AD1C2C467851AF42C9173CE74103D2FB350FF06535E6714A6E16BB0E589E6CCDD5B996FD6EF71452AB0533DA00470D78B99EF553E89353560BD901E47712AA9E41DEF8533AA1E26F82A01077249FFA903AAAB85D319BBED07CE7A00F5CF2D6AC523C12E2DE3AEA748560DFE7A54E1FC10FA947EB9F6151D4988C320A6981061192AC15F4ED183A45FF47C92C68601B52570C31E7DF71E176DFB3272DF1E5D94493D66DA3FCAD8E4C68FDDC1E4FD1422395ECF2A770AC14DAF927830F6D7476A5FDF04246E58597AB3E96912F1F77E9A8ECE78B6249BEF56C9BF70D1975B4F97C0AF240347C1D68A6FD08DBC7AE33E37D153CD2A062108285D72F97C70C4D9F28555AE59264D4E7B7730E77A5CF04FC1BF653F8A726CE3788B4C723ED394F4C9E3242D8EBA5E1F60CE258BEB07DB841BA0FD82D6C2DC89B360A7F4514B5BA4CCAB099DD5740518E610928A5E9E0F9626B59CE389EC3A07AD0BC79D6849B929A3B15871824DA7E04415A61A7D30C11D75F633B3026A6F1E245E9BAEE9BE3CA390388087B06065A6F02A7959D7ED99569EBD3A30763CA2C11F5B6442F821639D784EB409EDA7FB7309C8266952A8798C34E10F8568AEE683A4FA81A7F7F82590130B7B2B08F27A5B58A0594BC16995CEC1A4262BB1641BA15920216330B3B664C770407693A11C12083D6B43A49FAF4452B3730560126DFBB225E8C605504D2F3B2362D1B85605D992EF986A930D9223C7BDE761B12ABB1460DF8B279C8AB4B93E5F20247934F1B88CCEB7574059BDE5116207B676AE88CBB517970AB13B6475E802449FD39DEE9F0F13AFE20F56EA795E6CEFF5D152EBD5AE9C14D9DD8759FC2E84E89ABBA052E4D0C97EDABEEF2CA901994382DD97838B173E97B36539295D7BE9C57A57B19E09C74723C905D8280CB3FE4C7FA0005B9F7C8DE571FADF79C04FC9981C4D57C86FA920DC3A59A1F03761405BAC82E4287AC68DF8653AECF04D9F036C5C6D2C7E45D4F1685536A34AFF0586E1111963F680C3B9F089F52911FB8A948364B64B0C9E77A09E498A6A0F8D733CCDE04D13"

// Rate limiting middleware (you can use a library like 'express-rate-limit')
const rateLimitMiddleware = require('express-rate-limit')({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(rateLimitMiddleware);

async function getFollowing(id, cursor = "") {
    let following = [];
    try {
        const response = await axios.get(`https://friends.roblox.com/v1/users/${id}/followings?limit=100&sortOrder=Asc${cursor ? `&cursor=${cursor}` : ''}`, {
          headers: {
            "Cookie": cookie
          }
        });
        
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

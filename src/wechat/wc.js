// const axios = require('axios');
// const express = require('express');
// const bodyParser = require('body-parser');

// const app = express();
// app.use(bodyParser.json());

import axios from 'axios';

const corpId = 'ww2460c9d1886951ff'; // 企业ID
const corpSecret = 'H0FnPR_xIE397RPx7uiyFsmF_nfvCKB2pJJCPjxT_nU'; // 应用Secret

// 获取Access Token
async function getAccessToken() {
  const url = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpId}&corpsecret=${corpSecret}`;
  try {
    const response = await axios.get(url);
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching access token:', error);
    throw error;
  }
}


// async function getExternalContacts() {
//     const accessToken = await getAccessToken();
//     const url = `https://qyapi.weixin.qq.com/cgi-bin/externalcontact/list?access_token=${accessToken}&userid=USER_ID`;
//     const response = await axios.get(url);
//     return response.data.external_userid;
//   }
  
//   getExternalContacts().then(externalUsers => console.log(externalUsers));
  

// 发送消息
async function sendMessage(toUser, message) {
  const accessToken = await getAccessToken();
  const url = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${accessToken}`;

  const data = {
    touser: toUser, // 接收人
    msgtype: 'text',
    agentid: 1000002, // 应用ID
    text: {
      content: message,
    },
    safe: 0,
  };

  try {
    const response = await axios.post(url, data);
    console.log('Message sent:', response.data);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// 定义一个API端点，供外部调用
// app.post('/send', async (req, res) => {
//   const { toUser, message } = req.body;
//   try {
//     await sendMessage(toUser, message);
//     res.status(200).send('Message sent successfully');
//   } catch (error) {
//     res.status(500).send('Error sending message');
//   }
// });

// 启动服务器
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


var accessToken = await getAccessToken();
async function getExternalContacts() {
    const accessToken = await getAccessToken();
    const url = `https://qyapi.weixin.qq.com/cgi-bin/externalcontact/contact_list?access_token=${accessToken}&userid=USER_ID`;
    const response = await axios.get(url);
    console.log(response.data);
    return response.data.external_userid;
  }

  //getExternalContacts();
  
  async function getExternalContactDetails(externalUserId) {
    const accessToken = await getAccessToken();
    const url = `https://qyapi.weixin.qq.com/cgi-bin/externalcontact/get?access_token=${accessToken}&external_userid=${externalUserId}`;
    const response = await axios.get(url);
    console.log(response.data);
    return response.data.external_contact;
  }

  getExternalContactDetails("xtqvGUDAAAvFbK5BX4A0mm7cVJp_HFvA");

// await sendMessage(toUser, message);

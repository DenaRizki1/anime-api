
const db = require('./db');
const admin = require('firebase-admin');
const serviceAccount = require('./firebase_account_key.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });



exports.sendNotification = async({hash_user:hash_user,title:title,messageNotif:messageNotif, module: module}) =>{
    let queryUser = await getUser(hash_user)
    if (queryUser != null) {
        const message = {
            notification: {
            title: title,
            body: messageNotif,
            },
            data: {
                "module": module,
            },
            token: queryUser.token_notif
        };

        admin.messaging().send(message)
        .then((response) => {
            console.log('Successfully sent message:', message);
        })
        .catch((error) => {
            console.error('Error sending message:', error);
        });
    }

    

}

exports.sendNotificationTopic = async({title:title,messageNotif:messageNotif, topic: topic}) => {

    if (queryUser != null) {
        for (const d in messageNotif) {
            const message = {
                notification: {
                  title: title,
                  body: messageNotif[d],
                },
                topic: topic
            };
        
              admin.messaging().send(message)
            .then((response) => {
              console.log('Successfully sent message:', response);
            })
            .catch((error) => {
              console.error('Error sending message:', error);
            });
        }
    }
    
}

async function getUser(hash_user){
    if (hash_user != null) {
        return await db.sequelize.query("SELECT * FROM tb_login WHERE hash_user = $hash_user AND trash = $trash",{
            bind:{
                hash_user: hash_user,
                trash: '0'
            },
            plain:true,
            QueryTypes: db.sequelize.QueryTypes.SELECT,
        })
    }else{
        return await db.sequelize.query("SELECT * FROM tb_login WHERE trash = $trash",{
            bind:{
                trash: '0'
            },
            // plain:true,
            QueryTypes: db.sequelize.QueryTypes.SELECT,
        })
    }
}


const prefixApi = '/api/gm-feed/news-client-web';
import sanitize from "mongo-sanitize";
import * as helper from '../../../helper/helper.js'
import * as validator from '../../../helper/validator.js'

import { ModelNews } from '../../../models/News.js'
import { ModelYoutube } from '../../../models/Youtube.js'
import { ModelTypeNews } from '../../../models/TypeNews.js'
import multer from 'multer'
import path from 'path';

import axios from 'axios'
const KEY_YOUTUBE = "AIzaSyBXxsc5_8V3v4b_8yGG-PJyVN6u2cUw2nY"
export const get_data_client = async (app)=>{
    app.get(prefixApi, async (req, res)=>{
        try {
           const data_news_hot = await ModelNews.find().sort({news_index:1}).limit(4) // 4 tin slide ở đầu trang
           const data_news_review = await ModelNews.find({id_type:validator.ObjectId("62cd8c5ccde78ce1ca37f50d")}).sort({news_index:1}).limit(10) // tin review sản phẩm
           const data_news_outstanding = await ModelNews.find().sort({news_views:-1}).limit(10) // tin nôi bật
           const data_news_tips = await ModelNews.find({id_type:validator.ObjectId("62cd8c6ecde78ce1ca37f518")}).sort({news_index:1}).limit(10) // tin review sản phẩm // tin thủ thuật
           const data_news_game = await ModelNews.find({id_type:validator.ObjectId("62cd8c82cde78ce1ca37f524")}).sort({news_index:1}).limit(10) // tin review sản phẩm // tin game
            
           const video_youtube = await ModelYoutube.find({youtube_status:true}).sort({youtube_index:1}).limit(20)

            for(let i =0;i<video_youtube.length;i++){
                const data_api =  await get_data_video(video_youtube[i].youtube_id)
                if(data_api)
                video_youtube[i] = {
                    ...video_youtube[i],
                    ...data_api[0],

                }
            }

           return res.json({
            data_news_hot :data_news_hot,
            data_news_review :data_news_review,
            data_news_outstanding :data_news_outstanding,
            data_news_tips :data_news_tips,
            data_news_game :data_news_game,
            video_youtube:video_youtube
           })

        }
        catch (e) {
            console.log(e)
            return res.status(500).send("Thất bại! Có lỗi xảy ra")
        }
    })
}

const get_data_video = async (id_video) =>{
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    const data = await axios({
            method: "GET",
            url: `https://www.googleapis.com/youtube/v3/videos?id=${id_video}&key=${KEY_YOUTUBE}&part=snippet%2CcontentDetails%2Cstatistics%2Cstatus&fbclid=IwAR2lVM_IRHXrjesI5AmyFbg_1VuaZRYF7Bh12kmq3FChW96B7IjuzXreOlc`,
            headers: headers,
        })
    if(data)
        return data.data.items
    return null
}
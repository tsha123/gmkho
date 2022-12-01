const prefixApi = '/api/part';
import sanitize from "mongo-sanitize";
import * as helper from '../../helper/helper.js'
import * as validator from '../../helper/validator.js'
import {ModelPart} from '../../models/Part.js'

export const update_part = async (id_branch, part_value) => {   
    try {
        const data_current = await ModelPart.findOne({
            id_branch: id_branch,
            createdAt: validator.dateTimeZone().startOfDay
            
        })

       
        if (!data_current) {
            try {
                const insertNew = await new ModelPart({
                    createdAt: validator.dateTimeZone().startOfDay,
                    id_branch: id_branch,
                    part_value:part_value
                }).save()
              
            }
            catch (e) {
                console.log(e)
            }
            
        }
        await ModelPart.findByIdAndUpdate(data_current._id, {
            $inc: {
                part_value:part_value
            }
        })
      
    }
    catch (e) {
        console.log(e)
    }
    
}
import { TokenModel } from './../models/Token.js';
import * as validator from './validator.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import sanitize from 'mongo-sanitize';

export const HOST_URL = 'https://gmmarket.aecongnghe.com';
export const MAIN_HOST = 'https://gmkho.aecongnghe.com';
export const NAME_WEBSITE_COMPONENT = 'website_app_haiphongcomputer';
dotenv.config();

export const authenToken = async (req, res, next) => {
    try {
        const token = req.headers.token;
        if (!token) {
            res.sendStatus(401);
        } else {
            TokenModel.findOne({ token: token }, (err, result) => {
                if (err || !result) {
                    res.sendStatus(403);
                } else {
                    jwt.verify(
                        result.token,
                        process.env.ACCESS_TOKEN_SECRET,
                        (err, data) => {
                            if (!err) {
                                req.body = {
                                    ...req.body,
                                    _caller: data,
                                };
                                Object.keys(req.query).map((key) => {
                                    if (isNaN(parseInt(req.query[key]))) {
                                        req.query[key] = escapehtml(
                                            req.query[key]
                                        );
                                    }
                                });
                                next();
                            } else {
                                res.sendStatus(403);
                            }
                        }
                    );
                }
            });
        }
    } catch (err) {
        validator.throwError(err);
        res.sendStatus(500);
    }
};

export const signToken = async (token) => {
    try {
        const object = new TokenModel({
            token: token,
        });
        await object.save();
    } catch (err) {
        validator.throwError(err);
    }
};

export const unSignToken = async (token) => {
    try {
        await TokenModel.deleteOne({ token: token });
    } catch (err) {
        validator.throwError(err);
    }
};

export const signupjwt = (value) => {
    return jwt.sign(value, process.env.ACCESS_TOKEN_SECRET);
};

export const imageFilter = function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

import { ModelPermission } from './../models/Permission.js';
export const checkPermission = async (id_function, groupuser) => {
    try {
        const dataPer = await ModelPermission.findOne({
            id_function: id_function,
            id_employee_group: groupuser,
        });
        if (!dataPer) return false;
        if (dataPer.permission_status) {
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
};

export const escapehtml = (s) => {
    return s.replace(/([.*+?\^$(){}|\[\]\/\\])/g, '\\$1');
};

import { nanoid } from "nanoid";
import { cookieOptions } from "../config/config.js";
import jsonwebtoken from "jsonwebtoken"

export const generateNanoId = (length) =>{
    return nanoid(length);
}

const getJwtSecret = () =>{
    const secret = process.env.JWT_SECRET
    if(!secret) throw new Error("JWT_SECRET is not set. Add it to BACKEND/.env (see .env.example)")
    return secret
}

export const signToken = (payload) =>{
    return jsonwebtoken.sign(payload, getJwtSecret(), {expiresIn: "1h"})
}

export const verifyToken = (token) =>{
    const decoded = jsonwebtoken.verify(token, getJwtSecret())
    return decoded.id
}
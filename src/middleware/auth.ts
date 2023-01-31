import { NextFunction } from "connect";
import express, { Request, Response } from "express";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
// import multer from 'multer'
// import path from 'path'
// import fs from 'fs';

dotenv.config();
const secret: string = (process.env.JWTSECRET_KEY) ? process.env.JWTSECRET_KEY : "";


export async function authenticateToken(req: any, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers['authorization'] as string | undefined;
        const token = authHeader && authHeader.split(' ')[1]
        if (token == null) return res.status(401).json({ message: "You are not authorized"})
        jwt.verify(token, secret, (err: any, user: any) => {
            if (err) return res.status(403).send("A token is required for authentication");
            req.user = user
            next()
        })
    } catch(error) {
        res.status(500).send({messae:"Internal Server Error"});
    }
}
export function generateAccessToken(user: any) {
    return jwt.sign({ email: user.email, role: user.role ,id:user._id}, secret, { expiresIn: '2h' })
}



// const storage = multer.diskStorage({
//     destination: (req, file, callback) => {
//         let type = req.params.type;
//         const path = `./upload/${type}`;
        
//         fs.mkdirSync(path, { recursive: true })
//         callback(null, path)
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname)
//     }
// })

// export const upload = multer({
//     storage: storage, 
//     fileFilter: (req, file, callback) => {
//         var ext = path.extname(file.originalname);
//         if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
//             return callback(new Error('Only images are allowed'))
//         }
//         callback(null, true)
//     }
// }).single('image_upload');

 
// export const checkRole = (req: any, res: Response, next: NextFunction,roles:any) =>{
//     try {
//         console.log(req,res)
//     if (roles.includes(req.user.role))
//         next();
//     else {
//         return res.status(401).send({
//             message: `You don't have correct access`,
//         });
//     }
//     } catch(error){
//         res.status(500).send({message:"Internal server error"})
//     }
// }

// export const uploadMulti = multer({
//     storage: storage, 
//     fileFilter: (req, file, callback) => {
//         var ext = path.extname(file.originalname);
//         if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
//             return callback(new Error('Only images are allowed'))
//         }
//         callback(null, true)
//     }
// }).fields([
//     {name: 'artistImage', maxCount: 1},
//     {name: 'highlightsImage'},
//     {name: 'artistLogo', maxCount: 1},
// ]);


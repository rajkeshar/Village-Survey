import { NextFunction } from "connect";
import express, { Request, Response } from "express";

export const checkRole = (req: any, res: Response, next: NextFunction) =>{
let roles = 'superadmin'
    try {
        console.log(req,res)
    if (roles.includes(req.user.role))
        next();
    else {
        return res.status(401).send({
            message: `You don't have correct access`,
        });
    }
    } catch(error){
        res.status(500).send({message:"Internal server error"})
    }
}
checkRole as any
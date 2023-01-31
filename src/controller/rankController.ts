import express, { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose';
import rankModal from '../modal/typeofRanking'

export async function addNewRank(req: Request, res: Response) {
    try {
        let { rankType, number} = req.body
        if (!rankType) return res.status(400).send("Kindly send dept Name");
        if(rankType === '1to10'){
            let rank1to10 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            let rank = new rankModal({rankType : rank1to10});
            await rank.save();
            return res.status(201).send({ message: "Succesfully added  scheme",data: rank, success: true });
        }
        if(rankType === '1to10'){
            let rank1to10 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            let rank = new rankModal({rankType : rank1to10});
            await rank.save();
            return res.status(201).send({ message: "Succesfully added  scheme",data: rank, success: true });
        }
        if(rankType === '1to20'){
            let rank1to10 = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
            let rank = new rankModal({rankType : rank1to10});
            await rank.save();
            return res.status(201).send({ message: "Succesfully added  scheme",data: rank, success: true });
        }
        if(rankType === '1to5'){
            let rank1to10 = [1, 2, 3, 4, 5];
            let rank = new rankModal({rankType : rank1to10});
            await rank.save();
            return res.status(201).send({ message: "Succesfully added  scheme",data: rank, success: true });
        }
        if(rankType === 'greaterThen'){
            let greaterThenwhat =  `greaterThen + ${number}`
            let greaterCheck = [ greaterThenwhat];
            let rank = new rankModal({rankType : greaterCheck});
            await rank.save();
            return res.status(201).send({ message: "Succesfully added  scheme",data: rank, success: true });
        }
        if(rankType === 'lessThen'){
            let lessThenwhat =  `lessThen + ${number}`
            let lessCheck = [ lessThenwhat];
            let rank = new rankModal({rankType : lessCheck});
            await rank.save();
            return res.status(201).send({ message: "Succesfully added  scheme",data: rank, success: true });
        }
        if(rankType === 'YesNo'){
            let yesNo = ['yes', 'no'];
            let rank = new rankModal({rankType : yesNo});
            await rank.save();
            return res.status(201).send({ message: "Succesfully added  scheme",data: rank, success: true });
        }
       
    } catch (error) {
        res.status(500).send(error);
    }
}
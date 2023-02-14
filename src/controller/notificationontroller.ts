import express, { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose';
import webpush from 'web-push';
const publicKey = 'BEzgRTwwy8I4wF4_fLv39ow9_W3KPQTlweK39uvDsPkPXTBbkSIFXdBCEzy5PFWn782VRHWGpJTgDYb7hD6Lv9g';

const privateKey= 'hNxCEaebYkqpV-5w6mdYV_FxN_JLQ6YDqAbvqsVIX5U';
webpush.setVapidDetails("mailto: <nidhisharma050798@gmail.com>", publicKey,privateKey);

export async function sendNotifications(req: Request, res: Response) {
    try {
        const subscription = req.body;
    res.status(201).json({});
    const payload = JSON.stringify({ title: "Hello World", body: "This is your first push notification" });

    webpush.sendNotification(subscription, payload).catch(console.log);
        // return res.status(201).send({ message: 'fetched all',  success: true });
    } catch (error) {
        res.status(500).send(error);
    }
}
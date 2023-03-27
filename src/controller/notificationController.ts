import express, { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose';
import notificationModal from '../modal/notificationModal';

export async function addNotification(req: Request, res: Response) {
    try {
        let { message } = req.body
        let notification = new notificationModal({ message: message });
        await notification.save();
        return res.status(201).json({ message: "notification created successfully", success: true, data: notification });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function getNotificationById(req: Request, res: Response) {
    try {
        let { id } = req.params
        let notification = await notificationModal.findById({ id });
        if (!notification) return res.status(400).json({ message: "notification not existed" })
        return res.status(201).json({ message: "notification send successfully", success: true, data: notification });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function getNotificationList(req: Request, res: Response) {
    try {
        let notificationList = await notificationModal.find();
        return res.status(201).json({ message: "notification send successfully", success: true, data: notificationList });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function updateNotification(req: Request, res: Response) {
    try {
        let { message, isPinned } = req.body
        let { id } = req.params;
        let notification = await notificationModal.findById(id);
        if (!notification) return res.status(201).json({ message: "notification send successfully" })
        let result = await notificationModal.findByIdAndUpdate(id,
            {$set :{message : message,isPinned:isPinned}},
            {new:true}
            )
        return res.status(201).json({ message: "notification send successfully", success: true, data: notification });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
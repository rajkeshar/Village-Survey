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
        let notification = await notificationModal.findOne( {_id:new mongoose.Types.ObjectId(id)});
        if (!notification) return res.status(400).json({ message: "notification not existed" })
        return res.status(201).json({ message: "notification send successfully", success: true, data: notification });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function deleteNotificationById(req: Request, res: Response) {
    try {
        let { id } = req.params
        let notification = await notificationModal.findOne( {_id:new mongoose.Types.ObjectId(id)});
        await notificationModal.deleteOne({_id:new mongoose.Types.ObjectId(id)});
        if (!notification) return res.status(400).json({ message: "notification not existed" })
        return res.status(201).json({ message: "notification deleted successfully", success: true });
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
      const { message, isPinned } = req.body;
      const { id } = req.params;
  
      // Find the current notification and update it
      const currentNotification = await notificationModal.findOne({ _id: new mongoose.Types.ObjectId(id) });
      if (!currentNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      const updatedNotification = await notificationModal.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id) },
        { $set: { message, isPinned } },
        { new: true }
      );
      // If the updated notification is now pinned, update all other notifications to set isPinned to false
      if (isPinned && updatedNotification) {
        await notificationModal.updateMany(
          { _id: { $ne: updatedNotification._id } },
          { $set: { isPinned: false } }
        );
      }
      return res.status(200).json({ message: "Notification updated successfully", data: updatedNotification });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false });
    }
}
export async function getPinnedNotification(req: Request, res: Response) {
  try {
    const pinnedNotification = await notificationModal.findOne({ isPinned: true });

    if (!pinnedNotification) {
      return res.status(200).json({ message: "Pinned Notification not found" });
    }
   
    return res.status(201).json({ message: "Notification updated successfully", data: pinnedNotification,success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false });
  }
}
  
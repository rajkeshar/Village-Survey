import express, { NextFunction, Request, Response } from 'express'
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from 'axios';
import otpGenerator from "otp-generator";
import userModal from '../modal/userModal'
import otpModal from '../modal/userOTPModal'
import { generateAccessToken } from '../middleware/auth';
import initMB from 'messagebird';
import { sendEmail } from '../utils/email-auth'


import * as dotenv from 'dotenv'
import mongoose from 'mongoose';
dotenv.config()
const FAST2SMS = process.env.FAST2SMS;
let jwtkey = process.env.JWTSECRET_KEY as any
async function comparePassword(plaintextPassword: string | Buffer, hash: string) {
    const result = await bcrypt.compare(plaintextPassword, hash);
    return result;
}
async function hashPassword(plaintextPassword: string | Buffer) {
    const hash = await bcrypt.hash(plaintextPassword, 10);
    return hash;
}
export async function signUp(req: Request, res: Response){
    createUser(req,'admin',res);
}
// export async function createUser(req: Request, res: Response, next: NextFunction) {
//     let { fullname, role, email, password, contactNumber, ReportingAuthorityName, EmpID,
//         UniqueIDNumber, AssignedSurveyDepartment, Designation, CurrentVillageName, CurrentTalukaName, NoofSurveyconducted } = req.body;

//     if (!contactNumber || !fullname || !email || !ReportingAuthorityName || !EmpID) return res.status(400).json({ message: "Kindly send all required fields" })
//     const existingUser = await userModal.findOne({ contactNumber: contactNumber });

//     if (existingUser) return res.status(400).json({ message: "This Number is already registered!" })


//     contactNumber = '+91' + contactNumber;
//     bcrypt.hash(req.body.password, 10, async (err, encrypted) => {
//         const saveUser = new userModal(
//             {
//                 _id: new mongoose.Types.ObjectId(),
//                 fullname: fullname, email: email, password: encrypted,
//                 contactNumber: contactNumber,
//                 role: role,
//                 ReportingAuthorityName: ReportingAuthorityName,
//                 EmpID: EmpID,
//                 UniqueIDNumber: UniqueIDNumber,
//                 AssignedSurveyDepartment: AssignedSurveyDepartment,
//                 Designation: Designation,
//                 CurrentVillageName: CurrentVillageName,
//                 CurrentTalukaName: CurrentTalukaName,
//                 NoofSurveyconducted: NoofSurveyconducted
//             });
//         let newUser = await saveUser.save();
//         let user = newUser.toObject()
//         user["password"] = "";

//         res.status(201).json({ message: "User Created Successfully", data: user })
//     })
// }
export async function logIn(req: Request, res: Response, next: NextFunction) {
    let { password, email} = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and Password is required" })

    const user = await userModal.findOne({ email: email, "IsActive": true }) as any
    if(!user) return res.status(400).json({message :"User Is not exist"})
    var validPassword;
    if (user) {
        validPassword = await bcrypt.compare(password, user.password);
    }
    if (!validPassword) {
        return res.json({ message: "password is invalid" })
    }
    user.password = ""
    const token = generateAccessToken(user);
    return res.status(201).json({message:"Logged in successfully",token:token, data: user})
}
export async function superAdminRegister(req: Request, res: Response) {
    let searchQuery = {
        role: "superadmin",
        IsActive: true
    }
    const isSuperAdminLength = await userModal.findOne(searchQuery);
    if (isSuperAdminLength) return res.status(400).json({ message: "Superadmin already exist" })
    await createUser(req, "superadmin", res);
}
export async function createUser(req: any, role: string, res: Response) {

    let { fullname, email, password, contactNumber, ReportingAuthorityName, EmpID,
        UniqueIDNumber, AssignedSurveyDepartment, Designation, CurrentVillageName, CurrentTalukaName, NoofSurveyconducted } = req.body;
    try {

        const existingUser = await userModal.findOne({ email: email, IsActive: true });

        if (existingUser) return res.status(400).json({ message: "This User is already exist!" })
        //hash the  password
        bcrypt.hash(req.body.password, 10, async (err, encrypted) => {
            const saveUser = new userModal(
                {
                    _id: new mongoose.Types.ObjectId(),
                    fullname: fullname, email: email, password: encrypted,
                    contactNumber: contactNumber,
                    role: role,
                    ReportingAuthorityName: ReportingAuthorityName,
                    EmpID: EmpID,
                    UniqueIDNumber: UniqueIDNumber,
                    AssignedSurveyDepartment: AssignedSurveyDepartment,
                    Designation: Designation,
                    CurrentVillageName: CurrentVillageName,
                    CurrentTalukaName: CurrentTalukaName,
                    NoofSurveyconducted: NoofSurveyconducted
                });
            let newUser = await saveUser.save();
            let user = newUser.toObject()
            user["password"] = "";

            res.status(201).json({ message: "User Created Successfully", data: user })
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function loginSuperAdmin(req: Request, res: Response) {
    await verifyUserEmail(req, "superadmin", res);
    // await UserLogin(req, "superadmin", res);
};
export async function verifyUserEmail(req: Request, role: string, res: Response) {
    try {
        const { contactNumber, password } = req.body;
        const user = await userModal.findOne({ contactNumber: contactNumber, "IsActive": true }) as any
        var validPassword;
        if (user) {
            validPassword = await bcrypt.compare(password, user.password);
        }
        if (!user || !validPassword) {
            return res.json({ message: "Contact Number or password is invalid" })
        }
        if (user.role != role) {
            return res.json({ message: "Please login from the right portal..." })
        }
        const generateOTP = (length = 6) => {
            let otp = ''

            for (let i = 0; i < length; i++) {
                otp += Math.floor(Math.random() * 10)
            }

            return otp
        }
        const OTP = JSON.parse(generateOTP());
        const newPhoneNumber = `${contactNumber}`;
        const sec = 120;
        const message = `Dear user, OTP for resetting the Password for NECTERE SOLUTIONS is ${OTP}. The OTP is valid for ${sec} secs.
    NECTERE SOLUTIONS`
        const apiUrl = `https:webpostservice.com/sendsms_v2.0/sendsms.php?apikey=${process.env.apikey}&type=${process.env.TYPE}&sender=${process.env.sender}&mobile=${newPhoneNumber}&message=${message}&peId=${process.env.PEID}&tempId=${process.env.TEMPID}&username=${process.env.username}&password=${process.env.password}`; // Replace with the API endpoint URL
        user.otp = OTP;
        user.otpExpires = new Date(Date.now() + 2 * 60 * 1000); // 
        user.save();

        axios.get(apiUrl)
            .then(response => {
                console.log(response.data);
                const token = generateAccessToken(user);
                return res.status(201).json({ message: "An OTP send to your account number, Please verify", data: token })
            })
            .catch(error => {
                console.error(error);
            });
    } catch (error) {
        return res.status(400).send({ message: "An error occured" });
    }
};
// export async function validateUserEmail(req: Request, res: Response) {
//     try {
//         let { id, token } = req.params;
//         const user = await userModal.findOne({ _id: new mongoose.Types.ObjectId(id) });
//         if (!user) return res.status(400).send("Invalid link");
//         const secret: any = process.env.JWTSECRET_KEY
//         jwt.verify(token, secret, (err: any, user: any) => {
//             if (err) return res.status(403).send("Invalid link");
//         })

//         const jwtToken = generateAccessToken(user)
//         res.send({ message: "email verified sucessfully", user, jwtToken });
//     } catch (error) {
//         res.status(400).send("An error occured");
//     }
// };
export async function verifyOTP(req: Request, res: Response) {
    const { otp , confirmPassword} = req.body;
    const authHeader = req.headers['authorization'] as string | undefined;
    const token = authHeader && authHeader.split(' ')[1]

    if (!otp || !token) {
        res.status(400).send({ message: 'Missing OTP or token' });
        return;
    }
    if (!confirmPassword) {
        res.status(400).send({ message: 'Missing Confirm Password' });
        return;
    }

    const decodedToken = jwt.decode(token) as any;
    const userId = decodedToken.id;

    userModal.findById(userId, (err, user) => {
        if (err) {
            res.status(500).send({ message: err });
        } else if (!user) {
            res.status(404).send({ message: 'User not found' });
        } else if (user.otp !== otp) {
            res.status(401).send({ message: 'Invalid OTP' });
        } else if (user.otpExpires < new Date()) {
            res.status(401).send({ message: 'OTP expired' });
        } else {
            user.otp = undefined;
            user.otpExpires = undefined;
            user.save((err) => {
                if (err) {
                    res.status(500).send({ message: err });
                } else {
                    bcrypt.hash(confirmPassword, 10, (err, encrypted) => {
                                            userModal.findOneAndUpdate(userId, {
                                                password: encrypted
                                            })
                                        })
                                        //hash the pass
                    res.status(201).json({ message: 'Password updates successfully', data: user.email })
                }
            });
        }
    });
}
export async function deleteUser(req: Request, res: Response) {
    try {
        let { contactNumber, id } = req.params;

        const update = { IsActive: false };
        let existUser = await userModal.find({ _id: new mongoose.Types.ObjectId(req.params?.id), IsActive: true });

        if (!existUser.length) return res.status(400).json({ message: `User is not existed. Invalid ID!` });
        if (contactNumber) {
            contactNumber = "+91" + contactNumber;
            const filter = { contactNumber: contactNumber };
            let result = await userModal.findOneAndUpdate(filter, update, { new: true })
            res.status(200).json({ message: `User deleted successfully.` })
        } else {
            const filter = { _id: new mongoose.Types.ObjectId(req.params?.id) };

            let result = await userModal.findOneAndUpdate(filter, update, { new: true })
            res.status(200).json({ message: `User deleted successfully.` })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function getAllUser(req: Request, res: Response) {
    try {
        let userList = await userModal.find({ IsActive: true })
        return res.status(200).json({ message: `User list successfully.`, data: userList })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function updateUser(req: Request, res: Response) {
    try {
        if (!req.body) return res.status(400).send({ message: 'Please send required field to update' })

        const filter = { _id: new mongoose.Types.ObjectId(req.params?.id) };

        let existUser = await userModal.find({ _id: new mongoose.Types.ObjectId(req.params?.id), IsActive: true });
        if (!existUser.length) return res.status(400).json({ message: `User is not existed. Invalid ID!` });

        const payload = req.body;
        let result = await userModal.findByIdAndUpdate(filter, payload, { new: true })
        res.status(200).json({ message: `User updated successfully.`, data: result });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
    }
}
export async function forgetPassword(req: Request, res: Response) {
    try {
        let { contactNumber } = req.body;
        if (!contactNumber) return res.status(400).json({ message: "Contact Number is required" })

        const existingUser = await userModal.findOne({ contactNumber: contactNumber ,'IsActive' :true }) as any
        if (!existingUser) return res.status(400).json({ message: "This User is not exist!,Kindy SignUp with your phone number" })


        const generateOTP = (length = 6) => {
            let otp = ''

            for (let i = 0; i < length; i++) {
                otp += Math.floor(Math.random() * 10)
            }

            return otp
        }
        const OTP = JSON.parse(generateOTP());
        const newPhoneNumber = `${contactNumber}`;
        const sec = 120;
        const message = `Dear user, OTP for resetting the Password for NECTERE SOLUTIONS is ${OTP}. The OTP is valid for ${sec} secs.
    NECTERE SOLUTIONS`
        const apiUrl = `https:webpostservice.com/sendsms_v2.0/sendsms.php?apikey=${process.env.apikey}&type=${process.env.TYPE}&sender=${process.env.sender}&mobile=${newPhoneNumber}&message=${message}&peId=${process.env.PEID}&tempId=${process.env.TEMPID}&username=${process.env.username}&password=${process.env.password}`; // Replace with the API endpoint URL
        existingUser.otp = OTP;
        existingUser.otpExpires = new Date(Date.now() + 2 * 60 * 1000); // 
        existingUser.save();

        axios.get(apiUrl)
            .then(response => {
                console.log(response.data);
                const token = generateAccessToken(existingUser);
                return res.status(201).json({ message: "OTP send successfully", data: token })
            })
            .catch(error => {
                console.error(error);
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

// export async function sendforgetpasswordLink(req: Request, res: Response) {
//     //make sure user exist in db
//     try {
//         const { userId, token } = req.params;
//         const { password, confirmPassword } = req.body;

//         //check if this id exist in db
//         const user = await User.findOneBy({
//             userId: parseInt(userId)
//         })
//         if (!user || !confirmPassword) {
//             return res.json({ message: "New Password must be sent with userId" })
//         } else {
//             //user exist , generate otp 
//             const secret = process.env.JWTSECRET_KEY + user.password;
//             try {
//                 const payload = jwt.verify(token, secret)
//                 //update the pass
//                 const userRepository = myDataSource.getRepository('user');

//                 var hashPass = bcrypt.hash(confirmPassword, 10, (err, encrypted) => {
//                     userRepository.update(userId, {
//                         password: encrypted
//                     })
//                 })
//                 //hash the pass
//                 res.send({ message: 'Password updates successfully', email: user.email });
//             } catch (error) {
//                 console.log(error);
//                 res.send(error);
//             }
//         }
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: "Internal Server Error" })
//     }
// }

export async function verifyResetPassword(req: Request, res: Response) {
    //make sure user exist in db
    try {
        const { email, token } = req.params;
        //check if this id exist in db
        const user = await userModal.findOne({ email: email })
        if (!user) {
            return res.json({ message: "Invaild email" })
        } else {
            //user exist , generate otp 
            const secret = jwtkey + user.password;
            try {
                const payload = jwt.verify(token, secret)
                res.send({ message: 'reset password', email: user.email });
            } catch (error) {
                console.log(error);
                res.send(error);
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" })
    }
}
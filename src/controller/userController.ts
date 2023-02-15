import express, { NextFunction, Request, Response } from 'express'
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import  axios  from 'axios';
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
export async function signUp(req: Request, res: Response, next: NextFunction) {
    let { fullname,role, email, password, contactNumber, ReportingAuthorityName, EmpID,
        UniqueIDNumber,AssignedSurveyDepartment, Designation, CurrentVillageName, CurrentTalukaName, NoofSurveyconducted } = req.body;

    if (!contactNumber || !fullname || !email || !ReportingAuthorityName || !EmpID) return res.status(400).json({ message: "Kindly send all required fields" })
    const existingUser = await userModal.findOne({ contactNumber : contactNumber });

    if (existingUser) return res.status(400).json({ message: "This Number is already registered!" })


    contactNumber = '+91' + contactNumber;
    bcrypt.hash(req.body.password, 10, async (err, encrypted) => {
        const saveUser = new userModal(
            {
                _id: new mongoose.Types.ObjectId(),
                fullname: fullname, email: email, password: encrypted,
                contactNumber: contactNumber,
                role: role,
                ReportingAuthorityName : ReportingAuthorityName,
                EmpID : EmpID,
                UniqueIDNumber : UniqueIDNumber,
                AssignedSurveyDepartment : AssignedSurveyDepartment,
                Designation : Designation,
                CurrentVillageName : CurrentVillageName,
                CurrentTalukaName : CurrentTalukaName,
                NoofSurveyconducted : NoofSurveyconducted
            });
        let newUser = await saveUser.save();
        let user = newUser.toObject()
        user["password"] = "";

        res.status(201).json({ message: "User Created Successfully", data: user })
    })
}
export async function logIn(req: Request, res: Response, next: NextFunction) {
    let { contactNumber , email } = req.body;
    if (!contactNumber) return res.status(400).json({ message: "Contact Number is required" })

    const existingUser = await userModal.find({ contactNumber: contactNumber });
    if (!existingUser) return res.status(400).json({ message: "This User is not exist!,Kindy SignUp with your phone number" })
    const OTP = otpGenerator.generate(6,
        {
            digits: true, upperCaseAlphabets: false, specialChars: false
        });


    const newPhoneNumber = `${contactNumber}`;
    // 
    const baseURL = process.env.BASE_URL
    const apiUrl = `${baseURL}/sendsms_v2.0/sendsms.php?apikey=${process.env.apikey}&type=${process.env.TYPE}&sender=${process.env.sender}&mobile=${newPhoneNumber}&message=text=Hello+User%2C+Your+Login+OTP+is+%24%7BOTP%7D&peId=${process.env.PEID}&tempId=${process.env.TEMPID}&username=${process.env.username}&password=${process.env.password}`; // Replace with the API endpoint URL
    
    // const apiKey = 'TmVjdGVyZVQ6Y3A1RUVSOEo='; // Replace with your actual API key
    // const phone = newPhoneNumber; // Replace with the phone number of the recipient
    // const code = OTP; // Replace with your actual verification code
    
    axios.get(apiUrl)
    .then(response => {
      console.log(response.data);
      return res.status(201).json({ message: "OTP send successfully"})
    })
    .catch(error => {
      console.error(error);
    });
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
        UniqueIDNumber,AssignedSurveyDepartment, Designation, CurrentVillageName, CurrentTalukaName, NoofSurveyconducted } = req.body;
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
                    ReportingAuthorityName : ReportingAuthorityName,
                    EmpID : EmpID,
                    UniqueIDNumber : UniqueIDNumber,
                    AssignedSurveyDepartment : AssignedSurveyDepartment,
                    Designation : Designation,
                    CurrentVillageName : CurrentVillageName,
                    CurrentTalukaName : CurrentTalukaName,
                    NoofSurveyconducted : NoofSurveyconducted
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
        const { email, password } = req.body;
        const user = await userModal.findOne({ email: email, "IsActive": true }) as any
        var validPassword;
        if (user) {
            validPassword = await bcrypt.compare(password, user.password);
        }
        if (!user || !validPassword) {
            return res.json({ message: "Email or password is invalid" })
        }
        if (user.role != role) {
            return res.json({ message: "Please login from the right portal..." })
        }
        const secret: any = process.env.JWTSECRET_KEY;
        const payload = {
            email: user.email,
            userId: user._id
        }
        const token = jwt.sign(payload, secret, { expiresIn: '5m' });
        const message = `Kindly Click on the link to login 

        ${process.env.BASE_URL}/login-superadmin/verify/${user._id}/${token}`;
        await sendEmail(email, "Verify Email", message);

        return res.status(201).send({ message: "An Email sent to your account please verify", success: true });
    } catch (error) {
        return res.status(400).send({ message: "An error occured" });
    }
};
export async function validateUserEmail(req: Request, res: Response) {
    try {
        let { id, token } = req.params;
        const user = await userModal.findOne({ _id: new mongoose.Types.ObjectId(id) });
        if (!user) return res.status(400).send("Invalid link");
        const secret: any = process.env.JWTSECRET_KEY
        jwt.verify(token, secret, (err: any, user: any) => {
            if (err) return res.status(403).send("Invalid link");
        })

        const jwtToken = generateAccessToken(user)
        res.send({ message: "email verified sucessfully", user, jwtToken });
    } catch (error) {
        res.status(400).send("An error occured");
    }
};
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
    //make sure user exist in db
    try {
        const { email } = req.body;
        let baseURL = process.env.BASEURL as any

        // const checkAdmin = await superAdminValidator(req.query?.email as any);
        // if (!(checkAdmin)) return res.json({ message: "Only SuperAdmin can do this!" })

        const user = await userModal.findOne({ email: email })
        if (!user) {
            return res.json({ message: "User not found" })
        } else {
            //user exist , generate otp 
            const secret = jwtkey + user.password;
            const payload = {
                email: user.email,
                _id: user._id
            }
            const token = jwt.sign(payload, secret, { expiresIn: '5' });
            const link = `${baseURL}/api/user/resetpassword/${user._id}/${token}`;
            const data = {
                from: "noreply@village_survey.com",
                to: email,
                subject: "Passord Reset Link",
                html: `
                <h2>Please click on the link to reset your password</h2>
                <p>${link}</p>
                `
            }
            console.log(link);
            res.send({ message: "Password reset link send successfully", data: data });
        }
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
import express, { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
import otpGenerator from "otp-generator";
import userModal from "../modal/userModal";
import otpModal from "../modal/userOTPModal";
import combinationModel from "../modal/combinationOfAssignVillageAndDept";
import { generateAccessToken } from "../middleware/auth";

import * as dotenv from "dotenv";
import mongoose from "mongoose";
import zoneModal from "../modal/zoneModal";
import { ObjectId } from "mongodb";
import deptModal from "../modal/departmentModal";
import submitSurveyModal from "../modal/submitSurveyModal";
import surveyModal from "../modal/inspecionModal";
dotenv.config();
let jwtkey = process.env.JWTSECRET_KEY as any;
async function comparePassword(
  plaintextPassword: string | Buffer,
  hash: string
) {
  const result = await bcrypt.compare(plaintextPassword, hash);
  return result;
}
async function hashPassword(plaintextPassword: string | Buffer) {
  const hash = await bcrypt.hash(plaintextPassword, 10);
  return hash;
}
export async function signUp(req: Request, res: Response) {
  let role = req.body?.role;
  createUser(req, role, res);
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
  try {
    let { password, email,type } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and Password is required",status:400 });

    const user = (await userModal.findOne({
      email: email,
      IsActive: true,
    })) as any;
    if (!user) return res.status(400).json({ message: "User Is not exist",status:400 });
    if (user) {
      if (type == "web" && type) {
        if (user.role == "VillageManager") {
          return res.status(400).json({ message: "User Is not exist",status:400 });
        }
      } else {
        if (user.role == "DistrictManager") {
          return res.status(400).json({ message: "User Is not exist",status:400 });
        }
        if (user.role == "admin") {
            return res.status(400).json({ message: "User Is not exist",status:400 });
          }
      }
    }
    var validPassword;
    if (user) {
      validPassword = await bcrypt.compare(password, user.password);
    }
    if (!validPassword) {
      return res.json({ message: "password is invalid",status:400 });
    }

    user.password = "";
    const token = generateAccessToken(user);
    return res
      .status(201)
      .json({
        message: "Logged in successfully",
        token: token,
        data: user,
        success: true,
        status:200
      });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Internal Server Error",
        error: JSON.stringify(error),
        success: false,
        status:500
      });
  }
}

export async function isAvailableToDelete(req: Request, res: Response) {
  try{
                let users = await userModal.find({})
                let newArr:any = []
                users.map((user:any)=>{
                  if(user.AssignDepartments.departments.length > 0 )
                  {
                 newArr.push({assignDept:user.AssignDepartments.departments.length,assignVillage:user.AssignVillage.village.length})
                  }
                  else if(user.AssignVillage.village.length > 0 ){
                 newArr.push({assignDept:user.AssignDepartments.departments.length,assignVillage:user.AssignVillage.village.length})

                  }
                })


                res.status(200).json({
                  status:200,
                  data:newArr.length
                })
             
  }
  catch(err){
    res.status(500).json({
      status:500,
      data:1
    })
  }
}
export async function listOfAssignUserDeptVillage(req: Request, res: Response) {
  try{
    let result:any = await zoneModal.aggregate([
      { $unwind: "$blocks" },
      { $unwind: "$blocks.taluka.villages" },
      {
          $project: {
              _id: 1,
              districtName: 1,
              villageName: "$blocks.taluka.villages.villageName",
              villageUniqueId: "$blocks.taluka.villages.villageUniqueId"
          }
      }])

      let users = await   userModal.find({IsActive:true})
      let dept = await deptModal.find({isDisable:false,IsActive:true})
      let assignData:any = []
      users.map((userList:any)=>{
          userList.AssignVillage.villages.map((village:any)=>{
            result.map((oneVillage)=>{
                 if(oneVillage.villageUniqueId == village)
                 {
                  assignData.push({...oneVillage,name:userList.fullname,email:userList.email,userId:userList._id})
                 }
            })

          })

          
      })
      let assignDeptAndVillageData:any = []
      // dept.map((deptData:any)=>{
      //     assignData.map((assignData)=>{
      //        assignDeptAndVillageData.push({...assignData,deptName:deptData.deptName,deptId:deptData._id})
      //     })
      // })
      let newArr:any = []
      assignData.map((assign)=>{
            dept.map((deptdta)=>{
              newArr.push({...assign,deptId:deptdta._id, deptName:deptdta.deptName})
            })
      })
      
   
      

      res.json({newArr})
  }
  catch(err)
  {
    console.log(err)
    res.json(err)

  }
  
}
export async function superAdminRegister(req: Request, res: Response) {
  let searchQuery = {
    role: "superadmin",
    IsActive: true,
  };
  const isSuperAdminLength = await userModal.findOne(searchQuery);
  if (isSuperAdminLength)
    return res.status(400).json({ message: "Superadmin already exist",status:400 });
  await createUser(req, "superadmin", res);
}
export async function createUser(req: any, role: string, res: Response) {
  let {
    fullname,
    email,
    password,
    contactNumber,
    ReportingAuthorityName,
    EmpID,
    UniqueIDNumber,
    AssignedSurveyDepartment,
    Designation,
    CurrentVillageName,
    CurrentTalukaName,
    NoofSurveyconducted,
  } = req.body;
  try {
    const existingUser = await userModal.findOne({
      email: email,
      IsActive: true,
    });
    const existingUserByMobile = await userModal.findOne({
      contactNumber: contactNumber,
      IsActive: true,

    })
    
    if (existingUserByMobile)
    return res.status(400).json({ message: "This User is already exist!" });

    if (existingUser)
      return res.status(400).json({ message: "This User is already exist!" });
    //hash the  password
    bcrypt.hash(req.body.password, 10, async (err, encrypted) => {
      const saveUser = new userModal({
        _id: new mongoose.Types.ObjectId(),
        fullname: fullname,
        email: email,
        password: encrypted,
        contactNumber: contactNumber,
        role: role,
        ReportingAuthorityName: ReportingAuthorityName,
        EmpID: EmpID,
        UniqueIDNumber: UniqueIDNumber,
        AssignedSurveyDepartment: AssignedSurveyDepartment,
        Designation: Designation,
        CurrentVillageName: CurrentVillageName,
        CurrentTalukaName: CurrentTalukaName,
        NoofSurveyconducted: NoofSurveyconducted,
        isInspector:true
      });
      let newUser = await saveUser.save();
      let user = newUser.toObject();
      user["password"] = "";

      res
        .status(201)
        .json({ message: "User Created Successfully", data: user });
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Internal Server Error",
        error: JSON.stringify(error),
        success: false,
      });
  }
}
export async function loginSuperAdmin(req: Request, res: Response) {
  await verifyUserEmail(req, "superadmin", res);
  // await UserLogin(req, "superadmin", res);
}
export async function verifyUserEmail(
  req: Request,
  role: string,
  res: Response
) {
  try {
    const { contactNumber, password } = req.body;
    const user = (await userModal.findOne({
      contactNumber: contactNumber,
      IsActive: true,
    })) as any;
    var validPassword;
    if (user) {
      validPassword = await bcrypt.compare(password, user.password);
    }
    if (!user || !validPassword) {
      return res.json({ message: "Contact Number or password is invalid" });
    }
    if (user.role != role) {
      return res.json({ message: "Please login from the right portal..." });
    }
    const generateOTP = (length = 6) => {
      let otp = "";

      for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10);
      }

      return otp;
    };
    const OTP = JSON.parse(generateOTP());
    const newPhoneNumber = `${contactNumber}`;
    const sec = 120;
    const message = `Dear user, OTP for resetting the Password for NECTERE SOLUTIONS is ${OTP}. The OTP is valid for ${sec} secs.
    NECTERE SOLUTIONS`;
    const apiUrl = `https:webpostservice.com/sendsms_v2.0/sendsms.php?apikey=${process.env.apikey}&type=${process.env.TYPE}&sender=${process.env.sender}&mobile=${newPhoneNumber}&message=${message}&peId=${process.env.PEID}&tempId=${process.env.TEMPID}&username=${process.env.username}&password=${process.env.password}`; // Replace with the API endpoint URL
    user.otp = OTP;
    user.otpExpires = new Date(Date.now() + 2 * 60 * 1000); //
    user.save();

    axios
      .get(apiUrl)
      .then((response) => {
        console.log(response.data);
        const token = generateAccessToken(user);
        return res
          .status(201)
          .json({
            message: "An OTP send to your account number, Please verify",
            data: token,
          });
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
    return res.status(400).send({ message: "An error occured" });
  }
}
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
  const { otp, confirmPassword } = req.body;
  console.log(req.body)
  const authHeader = req.headers["authorization"] as string | undefined;
  const token = authHeader && authHeader.split(" ")[1];




  if (!otp || !token) {
    res.status(400).send({ message: "Missing OTP or token" });
    return;
  }
  if (!confirmPassword) {
    res.status(400).send({ message: "Missing Confirm Password" });
    return;
  }

  const decodedToken = jwt.decode(token) as any;
  const userId = decodedToken.id;

  userModal.findById(userId, (err, user) => {
    if (err) {
      res.status(500).send({ message: err });
    } else if (!user) {
      res.status(404).send({ message: "User not found" });
    } else if (user.otp !== otp) {
      res.status(401).send({ message: "Invalid OTP" });
    } else if (user.otpExpires < new Date()) {
      res.status(401).send({ message: "OTP expired" });
    } else {
      user.otp = undefined;
      user.otpExpires = undefined;
      user.save((err) => {
        if (err) {
          res.status(500).send({ message: err });
        } else {
          bcrypt.hash(confirmPassword, 10, async (err, encrypted) => {
            await userModal.findOneAndUpdate(
              { _id: new mongoose.Types.ObjectId(userId) },
              {
                password: encrypted,
              }
            );
          });
          //hash the pass
          res
            .status(201)
            .json({
              message: "Password updates successfully",
              data: user.email,
            });
        }
      });
    }
  });
}
export async function deleteUser(req: Request, res: Response) {
  try {
    let { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: `ID required for delete!` });
    }
    const update = { IsActive: false };
    let existUser = await userModal.findOne({
      _id: new mongoose.Types.ObjectId(id),
      IsActive: true,
    });
    if (!existUser)
      return res
        .status(400)
        .json({ message: `User is not existed. Invalid ID!` });
    const filter = { _id: new mongoose.Types.ObjectId(id) };
    await userModal.findOneAndUpdate(filter, update);
    res.status(201).json({ message: `User deleted successfully.` });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Internal Server Error",
        error: JSON.stringify(error),
        success: false,
      });
  }
}
export async function getAllUser(req: Request, res: Response) {
  try {
    let userList = await userModal.find({ IsActive: true });
    return res
      .status(201)
      .json({ message: `User list successfully.`, data: userList });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Internal Server Error",
        error: JSON.stringify(error),
        success: false,
      });
  }
}
export async function updateUser(req: Request, res: Response) {
  try {
    if (!req.body)
      return res
        .status(400)
        .send({ message: "Please send required field to update" });

    const filter = { _id: new mongoose.Types.ObjectId(req.params?.id) };

    let existUser = await userModal.find({
      _id: new mongoose.Types.ObjectId(req.params?.id),
      IsActive: true,
    });
    if (!existUser.length)
      return res
        .status(400)
        .json({ message: `User is not existed. Invalid ID!` });

    const payload = req.body;
    let result = await userModal.findByIdAndUpdate(filter, payload, {
      new: true,
    });
    res
      .status(201)
      .json({ message: `User updated successfully.`, data: result });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Internal Server Error",
        error: JSON.stringify(error),
        success: false,
      });
  }
}
export async function forgetPassword(req: Request, res: Response) {
  try {
    let { contactNumber } = req.body;
    if (!contactNumber)
      return res.status(400).json({ message: "Contact Number is required" });

    const existingUser = (await userModal.findOne({
      contactNumber: contactNumber,
      IsActive: true,
    })) as any;
    if (!existingUser)
      return res
        .status(400)
        .json({
          message:
            "This User is not exist!,Kindy SignUp with your phone number",
        });

    const generateOTP = (length = 6) => {
      let otp = "";

      for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10);
      }

      return otp;
    };
    const OTP = JSON.parse(generateOTP());
    const newPhoneNumber = `${contactNumber}`;
    const sec = 120;
    const message = `Dear user, OTP for resetting the Password for NECTERE SOLUTIONS is ${OTP}. The OTP is valid for ${sec} secs.
    NECTERE SOLUTIONS`;
    const apiUrl = `https:webpostservice.com/sendsms_v2.0/sendsms.php?apikey=${process.env.apikey}&type=${process.env.TYPE}&sender=${process.env.sender}&mobile=${newPhoneNumber}&message=${message}&peId=${process.env.PEID}&tempId=${process.env.TEMPID}&username=${process.env.username}&password=${process.env.password}`; // Replace with the API endpoint URL
    existingUser.otp = OTP;
    existingUser.otpExpires = new Date(Date.now() + 2 * 60 * 1000); //
    existingUser.save();

    axios
      .get(apiUrl)
      .then((response) => {
        console.log(response.data);
        const token = generateAccessToken(existingUser);
        return res
          .status(201)
          .json({ message: "OTP send successfully", data: token , status:200,success:true });
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error",status:500,success:false  });
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

// export async function verifyResetPassword(req: Request, res: Response) {
//     //make sure user exist in db
//     try {
//         const { email, token } = req.params;
//         //check if this id exist in db
//         const user = await userModal.findOne({ email: email })
//         if (!user) {
//             return res.json({ message: "Invaild email" })
//         } else {
//             //user exist , generate otp
//             const secret = jwtkey + user.password;
//             try {
//                 const payload = jwt.verify(token, secret)
//                 return res.status(201).json({ message: 'reset password', email: user.email ,sucess:true});
//             } catch (error) {
//                 console.log(error);
//                 res.send(error);
//             }
//         }
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ message: "Internal Server Error", error: JSON.stringify(error), success: false })
//     }
// }
export async function getUserById(req: Request, res: Response) {
  try {
    let existUser = await userModal.findOne({
      _id: new mongoose.Types.ObjectId(req.params?.id),
      IsActive: true,
    });
    if (!existUser)
      return res
        .status(400)
        .json({ message: `User is not existed. Invalid ID!` });
    return res
      .status(201)
      .json({
        message: `User fetched successfully.`,
        data: existUser,
        success: true,
      });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Internal Server Error",
        error: JSON.stringify(error),
        success: false,
      });
  }
}
export async function makeInspectoreProfile(req: Request, res: Response) {
  try {
    let { id } = req.params;
    let existUser = await userModal.findOne({
      _id: new mongoose.Types.ObjectId(id),
      IsActive: true,
    });
    if (!existUser)
      return res
        .status(400)
        .json({ message: `User is not existed. Invalid ID!` });
    if (existUser.role != "VillageManager")
      return res
        .status(400)
        .json({
          message: `Only VillageManager or superadmin can do the survey`,
        });
    let result = await userModal.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), IsActive: true },
      { $set: { isInspector: true } },
      { new: true }
    );
    return res
      .status(201)
      .json({
        message: `User updated successfully.`,
        data: result,
        success: true,
      });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Internal Server Error",
        error: JSON.stringify(error),
        success: false,
      });
  }
}
export async function villageAssignmentForSurveyor(
  req: Request,
  res: Response
) {
  try {
    let { id } = req.params;
    let villageUniqueIds = req.body.Village;

    let existUser:any = await userModal.findOne({
      _id: new mongoose.Types.ObjectId(req.params?.id),
      IsActive: true,
    });
    if (!existUser)
      return res
        .status(400)
        .json({ message: `User is not existed. Invalid ID!` });
    if (!existUser.isInspector)
      return res
        .status(400)
        .json({
          message: `User is not inspector. Kindly make this profile Inspector!`,
        });

        const villagesAlreadyAssignedToOtherUsers = await userModal.find({
          'AssignVillage.villages': { $in: villageUniqueIds },
          _id: { $ne: id },
          IsActive: true,
        });

        const assignedToOtherUsers = villagesAlreadyAssignedToOtherUsers.flatMap(
          (otherUser:any) => otherUser.AssignVillage.villages
        );
    
        // Get the village IDs that are not assigned to the specified user but are assigned to other users
        const villagesAssignedToOtherUsers = villageUniqueIds.filter(
          (villageId) => assignedToOtherUsers.includes(villageId) && !existUser.AssignVillage.villages.includes(villageId)
        );
    
        // let newArray = []
        if (villagesAlreadyAssignedToOtherUsers.length > 0) {
          let newArray = villageUniqueIds.filter(item => !villagesAssignedToOtherUsers.includes(item))
          // console.log(filterdArrayIDsOFVillage)
          // return res.status(400).json({ message: 'Some villages are already assigned to other users.',villagesAssignedToOtherUsers,newArray });
          let result = (await userModal.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(id) },
            { $addToSet: { "AssignVillage.villages": { $each: newArray } } },
            { new: true }
          )) as any;
          await userModal.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(id), IsActive: true },
            { $set: { "AssignVillage.userId": new mongoose.Types.ObjectId(id) } },
            { new: true }
          );
          if (!result) {
            return res
              .status(400)
              .json({ message: `Department Array is not updated!` });
          }
        
          return res
            .status(201)
            .json({
              message: `village assign successfully.`,
              data: result,
              success: true,
            });
       
        }
        else{
          let result = (await userModal.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(id) },
            { $addToSet: { "AssignVillage.villages": { $each: villageUniqueIds } } },
            { new: true }
          )) as any;
          await userModal.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(id), IsActive: true },
            { $set: { "AssignVillage.userId": new mongoose.Types.ObjectId(id) } },
            { new: true }
          );
          if (!result) {
            return res
              .status(400)
              .json({ message: `Department Array is not updated!` });
          }
        
          return res
            .status(201)
            .json({
              message: `village assign successfully.`,
              data: result,
              success: true,
            });
        }
   
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Internal Server Error",
        error: JSON.stringify(error),
        success: false,
      });
  }
}
export async function departmentAssignmentForSurveyor(
  req: Request,
  res: Response
) {
  try {
    let { id } = req.params;
    let ID = new mongoose.Types.ObjectId(id);
    let deptIds = req.body.Departments;
    if (!id) {
      return res.status(400).json({ message: `kindly send ID!` });
    }
    let existUser = await userModal.findOne({ _id: ID, IsActive: true });
    if (!existUser)
      return res
        .status(400)
        .json({ message: `User is not existed. Invalid ID!` });
    if (!existUser.isInspector)
      return res
        .status(400)
        .json({
          message: `User is not inspector. Kindly make this profile Inspector!`,
        });
    let userData = (await userModal.findOneAndUpdate(
      { _id: ID },
      { $addToSet: { "AssignDepartments.departments": { $each: deptIds } } },
      { new: true }
    )) as any;
    await userModal.findOneAndUpdate(
      { _id: ID },
      { $set: { "AssignDepartments.userId": ID } },
      { new: true }
    );
    //if village are present in the user data Village Array
    if (!userData) {
      return res
        .status(400)
        .json({ message: `Department Array is not updated!` });
    }
    let villageUniqueIds = [] as any;
    if (userData) {
      villageUniqueIds.push(userData.Village);
    }
    // for (let villageUniqueId = 0; villageUniqueId < userData.Village.length; villageUniqueId++) {
    //     let uniqId = userData.Village[villageUniqueId];
    //     let zone = await zoneModal.findOne(
    //         { "blocks.taluka.villages": { $elemMatch: { "villageUniqueId": uniqId } } },
    //         { "blocks.$": 1 }) as any
    //     let blockUniqueId = zone.blocks[0].blockUniqueId;
    //     let result = await zoneModal.findOneAndUpdate(
    //         { "blocks.taluka.villages.villageUniqueId": uniqId },
    //         { $addToSet: { "blocks.$[block].taluka.villages.$[village].departments": { $each: deptIds } } },
    //         { arrayFilters: [{ "block.blockUniqueId": blockUniqueId }, { "village.villageUniqueId": uniqId }] })
    //     // await zoneModal.findOneAndUpdate({"blocks.taluka.villages.villageUniqueId" : villageUniqueId },
    //     // { $addToSet: { "departments": { $each: deptIds } } })
    // }
    return res
      .status(201)
      .json({
        message: `dept assign successfully.`,
        data: userData,
        success: true,
      });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Internal Server Error",
        error: JSON.stringify(error),
        success: false,
      });
  }
}
export async function checkVillageArray(req: Request, res: Response) {
  try {
    let existUser = await userModal.distinct("Village", {
      userStatus: "active",
      IsActive: true,
    });
    let totalCountFromUserCollection = (await userModal.aggregate([
      { $match: { userStatus: "active", IsActive: true } },
      { $unwind: "$Village" },
      { $group: { _id: null, villages: { $addToSet: "$Village" } } },
      { $project: { count: { $size: "$villages" }, _id: 0 } },
    ])) as any;
    let totalVillage = (await zoneModal
      .find({ userStatus: "active", IsActive: true })
      .count()) as any;
    if (totalCountFromUserCollection != totalVillage) {
      return res
        .status(400)
        .json({
          message: `Some Villages is left , Do you still wanna continue`,
        });
    }

    return res
      .status(201)
      .json({
        message: `dept assign successfully.`,
        data: totalCountFromUserCollection,
        success: true,
      });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Internal Server Error",
        error: JSON.stringify(error),
        success: false,
      });
  }
}
export async function checkDuplicateDeparmentAssignInVillage(
  req: Request,
  res: Response
) {
  try {
    const deptVillageMap = {};
    let villageUniqueIdArray = (await userModal.aggregate([
      { $unwind: "$AssignVillage.villages" },
      {
        $group: {
          _id: null,
          villages: { $addToSet: "$AssignVillage.villages" },
        },
      },
      {
        $project: {
          _id: 0,
          villages: 1,
        },
      },
    ])) as any;
    let zoneVillageUniqueArray = (await zoneModal.aggregate([
      { $unwind: "$blocks" },
      { $unwind: "$blocks.taluka.villages" },
      {
        $project: {
          _id: 1,
          districtName: 1,
          villageName: "$blocks.taluka.villages.villageName",
          villageUniqueId: "$blocks.taluka.villages.villageUniqueId",
        },
      },
    ])) as any;

    const uniqueVillage = zoneVillageUniqueArray.filter(
      (value) => !villageUniqueIdArray.includes(value)
    );
    if (uniqueVillage)
      return res
        .status(201)
        .json({ message: `Some Village is not assigned to surveyor` });

    (await userModal.find({ isInspector: true, IsActive: true })).forEach(
      (user) => {
        const userId = user._id.toString();
        if (!user.AssignVillage || !user.AssignDepartments)
          return res
            .status(201)
            .send({
              message:
                "Some Surveyor has no village or departments for surveying",
            });
        const village = user.AssignVillage.villages[0];
        const departments = user.AssignDepartments.departments;

        for (let i = 0; i < departments.length; i++) {
          const dept = departments[i].toString();
          if (dept in deptVillageMap) {
            if (deptVillageMap[dept].includes(village)) {
              console.log(
                `User ${userId} has department ${dept} assigned to village ${village} which is the same as another user.`
              );
            } else {
              deptVillageMap[dept].push(village);
            }
          } else {
            deptVillageMap[dept] = [village];
          }
        }
      }
    );
    return res
      .status(201)
      .json({ message: `dept assign successfully.`, success: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Internal Server Error",
        error: JSON.stringify(error),
        success: false,
      });
  }
}
export async function getUserAssignedVillageAndDepartment(
  req: Request,
  res: Response
) {
  let { id } = req.params;
  try {
    let user = await userModal.find(
      { _id: new mongoose.Types.ObjectId(id), IsActive: true },
      { AssignVillage: 1, AssignDepartments: 1 }
    );
    if (!user.length)
      return res
        .status(400)
        .send({ message: "This id is not exist, Invaild Id" });
    return res
      .status(201)
      .send({ message: "Successfully fetched", data: user, success: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Internal Server Error",
        error: JSON.stringify(error),
        success: false,
      });
  }
}

export async function getSelectedVillageList(req: Request, res: Response) {
  let { id } = req.params;

  try {
    let user: any = await userModal.find(
      { _id: new mongoose.Types.ObjectId(id), IsActive: true },
      { AssignVillage: 1, AssignDepartments: 1 }
    );
    if (!user.length)
      return res
        .status(400)
        .send({ message: "This id is not exist, Invaild Id" });
    let dist = await zoneModal.findOne({ IsActive: true });
    if (!dist)
      return res
        .status(201)
        .send({ message: "District Id or block Id is not found, Invalid ID" });
    let villageArray = [] as any;
    let result = await zoneModal.aggregate([
      { $unwind: "$blocks" },
      { $unwind: "$blocks.taluka.villages" },
      {
        $project: {
          _id: 1,
          districtName: 1,
          villageName: "$blocks.taluka.villages.villageName",
          villageUniqueId: "$blocks.taluka.villages.villageUniqueId",
        },
      },
    ]);

    let finalArray: any = [];
    console.log(user, "user");
    result.map((vill: any) => {
      user[0].AssignVillage.villages.map((id) => {
        if (id == vill.villageUniqueId) {
          finalArray.push(vill);
        }
      });
    });

    console.log(finalArray.length, user[0].AssignVillage.villages.length);
    return res
      .status(201)
      .send({
        message: "Successfully fetched",
        data: finalArray,
        success: true,
      });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Internal Server Error",
        error: JSON.stringify(error),
        success: false,
      });
  }
}
export async function pullVillageFromSurveyor(req: Request, res: Response) {
  let { id } = req.params;
  let { villageIds } = req.body;
  try {
    let user = await userModal.find({
      _id: new mongoose.Types.ObjectId(id),
      IsActive: true,
    });
    if (!user.length)
      return res
        .status(400)
        .send({ message: "This id is not exist, Invaild Id" });
    await userModal.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { $pull: { "AssignVillage.villages": { $in: villageIds } } }
    );
    return res
      .status(201)
      .send({ message: "Successfully removed", success: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Internal Server Error",
        error: JSON.stringify(error),
        success: false,
      });
  }
}
export async function pullDepartmentsFromSurveyor(req: Request, res: Response) {
  let { id } = req.params;
  let { deptIds } = req.body;
  let departmentIdsArray = [] as any;
  try {
    deptIds.forEach((deptId) => {
      const objectId = new ObjectId(deptId);
      departmentIdsArray.push(objectId);
    });
    let user = await userModal.find({
      _id: new mongoose.Types.ObjectId(id),
      IsActive: true,
    });
    if (!user.length)
      return res
        .status(400)
        .send({ message: "This id is not exist, Invaild Id" });
    await userModal.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $pull: { "AssignDepartments.departments": { $in: departmentIdsArray } },
      }
    );
    return res
      .status(201)
      .send({ message: "Successfully removed", success: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Internal Server Error",
        error: JSON.stringify(error),
        success: false,
      });
  }
}

export async function findAssignVillageAndDept(assignDeptAndVillageData:any) {
  
  let villageListData:any = []
  let deptListData:any = []

  assignDeptAndVillageData.map((listOfAssignVillageAndDept:any)=>{
    villageListData.push({villageUniqueId:listOfAssignVillageAndDept.villageId,villageName:listOfAssignVillageAndDept.villageName})
    deptListData.push({deptId:listOfAssignVillageAndDept.deptId,deptName:listOfAssignVillageAndDept.deptName})

  })

 const uniqueDept:any = []
  const uniquevillageListData:any = new Set();
 const uniqueVill:any = []

  const uniquedeptListData:any = new Set();


for (const item of deptListData) {
  if (!uniquedeptListData.has(item.deptId)) {
    uniquedeptListData.add(item.deptId);
    uniqueDept.push(item);
  }
}
for (const item of villageListData) {
if (!uniquevillageListData.has(item.villageUniqueId)) {
  uniquevillageListData.add(item.villageUniqueId);
  uniqueVill.push(item);
}
}

return {uniqueVill, uniqueDept}
  
}
export async function getAssignVillageName(req: Request, res: Response) {
  let { id } = req.params;
  try {
    let idFindOfSurvey = await surveyModal.find({IsOnGoingSurvey:"OnGoing"})
     let remaningVillageCount = []
    
 
    // let user:any = await userModal.find({_id:id})
    const deduplicatedArray:any = [];
    let assignDeptAndVillageData = await combinationModel.find({userID:id})   
    // let alredySubmitSurvey = submitSurveyAlready.filter((submitedSurvey:any)=>{
    //     return submitedSurvey.email == user[0].email
    // })

    let {uniqueVill, uniqueDept}:any = await findAssignVillageAndDept(assignDeptAndVillageData)

    const uniqueRemainingVill:any = []

 if(idFindOfSurvey.length != 0)
    {
      console.log(assignDeptAndVillageData)
      let submitSurveyListData = await submitSurveyModal.find({surveyId:idFindOfSurvey[0]._id,email:assignDeptAndVillageData[0].userEmail})
      // assignDeptAndVillageData.map((assignDeptAndVillageDatacheck)=>{
      //   submitSurveyListData.map((alreadySubmit:any)=>{
      //         if(alreadySubmit.villageUniqueId != assignDeptAndVillageDatacheck.villageId && alreadySubmit.deptId.toString() != assignDeptAndVillageDatacheck.deptId) 
      //         {

      //         }       
      //   })
      // })

      const uniqueSecondArray:any = assignDeptAndVillageData.filter((secondItem:any) => {
        return !submitSurveyListData.some((firstItem:any) => {
          return (
            secondItem.deptId === firstItem.surveyDetail.deptId.toString() &&
            secondItem.villageId === firstItem.villageUniqueId.toString()
          );
        });
      });

      console.log(uniqueSecondArray)
      const uniquevillageListData:any = new Set();
      for (const item of uniqueSecondArray) {
        if (!uniquevillageListData.has(item.villageId)) {
          uniquevillageListData.add(item.villageId);
          uniqueRemainingVill.push(item);
        }
        }
         
    }
    return res
      .status(201)
      .send({
        message: "Successfully fetched village name",
        data: {
          remaningVillageArrayCount:uniqueRemainingVill.length,
          assignVillageArrayCount: uniqueVill.length,
          villageArray: uniqueVill?uniqueVill:[],
          deptList:uniqueDept?uniqueDept:[],
        },
        success: true,
      });

    } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Internal Server Error",
        error: JSON.stringify(error),
        success: false,
      });
  }
}
export async function getRemaingVillageNAmeByUserID(
  req: Request,
  res: Response
) {
  let { id,surveyId } = req.params;
  try {
    let user = await userModal.findOne({
      _id: new mongoose.Types.ObjectId(id),
      IsActive: true,
    });
    if (!user)
      return res
        .status(400)
        .send({ message: "This id is not exist, Invaild Id" });
//     let villagesIds = user?.AssignVillage?.villages as any;
//     let deptIds = user?.AssignDepartments?.departments as any;

//     let array = [] as any;
//     // Object.entries(villagesIds).forEach(([key, value]) => array.push(value));

    
//     const pendingVillages = await submitSurveyModal.find({
//       email: user.email,
//       surveyId:surveyId
//     });

//    let toRemoveArray:any = []
//     pendingVillages.map((findDeptAndVillage:any)=>{
//       toRemoveArray.push({
//           "deptId":findDeptAndVillage.surveyDetail.deptId.toString(),
//           "deptName":findDeptAndVillage.surveyDetail.deptName,
//           "villageUniqueId":findDeptAndVillage.villageUniqueId,
//           "villageName":findDeptAndVillage.villageName,
//           "surveyId":findDeptAndVillage.surveyId

//         })
//     })

//     // console.log(submitVillagesAndDept,"array")

//     let villages = await zoneModal.aggregate([
//       { $unwind: "$blocks" },
//       { $unwind: "$blocks.taluka" },
//       { $unwind: "$blocks.taluka.villages" },
//       {
//         $match: {
//           "blocks.taluka.villages.villageUniqueId": {
//             $nin: array,
//           },
//         },
//       },
//       {
//         $group: {
//           _id: "$blocks.taluka.villages.villageName",
//           villageUniqueId: { $push: "$blocks.taluka.villages.villageUniqueId" },
//         },
//       },
//       {
//         $project: {
//           villageName: "$_id",
//           villageUniqueId: 1,
//           _id: 0,
//         },
//       },
//     ]);

//  let AssignUserData =  villages.filter((assignVillages)=>{
//     return villagesIds.includes(assignVillages.villageUniqueId)
//   })
//    console.log(AssignUserData,"AssignUserData")

//     const dept:any = await  deptModal.find({IsActive:true,isDisable:false})
//    let remainingData = dept.filter((deptData)=>{
//       return deptIds.includes(deptData._id)
//    })


// let dataArray:any = []
// AssignUserData.map((numberOfVillages)=>{
//   remainingData.map((numberOfDept)=>{
//     dataArray.push({
//       villageUniqueId:numberOfVillages.villageUniqueId[0],
//       villageName:numberOfVillages.villageName,
//       deptId:numberOfDept._id.toString(),
//       deptName:numberOfDept.deptName


//     })
//   })
// })
// // let finalNotSubmittedAt:any = []
// // numberOfAssignVillageAndDept.map((notSubmit)=>{
// //   submitVillagesAndDept.map((submited)=>{
// //     if(notSubmit.villageUniqueId != submited.villageUniqueId  )
// //     {
// //       if(notSubmit.deptId != submited.deptId)
// //       {
// //       finalNotSubmittedAt.push(notSubmit)
// //       }
// //     }
// //   })
// // })
   
// const filteredDataArray = dataArray.map(dataObj => {
//   const matchingRemoveObj = toRemoveArray.find(removeObj => (
//       dataObj.villageUniqueId === removeObj.villageUniqueId &&
//       dataObj.deptId === removeObj.deptId
//   ));
  
//   return matchingRemoveObj ? null : dataObj;
// })
// .filter(obj => obj !== null);

let assignDeptAndVillageData = await combinationModel.find({userID:id})   
// let alredySubmitSurvey = submitSurveyAlready.filter((submitedSurvey:any)=>{
//     return submitedSurvey.email == user[0].email
// })

if(!surveyId)
{
  return res
  .status(400)
  .json({
    message: "Successfully fetched village name",
    remainingData:[],
    success: true,
    status:400
  });
}

const uniqueRemainingVill:any = []


  console.log(assignDeptAndVillageData)
  let submitSurveyListData = await submitSurveyModal.find({surveyId:surveyId,email:user.email})
  // assignDeptAndVillageData.map((assignDeptAndVillageDatacheck)=>{
  //   submitSurveyListData.map((alreadySubmit:any)=>{
  //         if(alreadySubmit.villageUniqueId != assignDeptAndVillageDatacheck.villageId && alreadySubmit.deptId.toString() != assignDeptAndVillageDatacheck.deptId) 
  //         {

  //         }       
  //   })
  // })

  const uniqueSecondArray:any = assignDeptAndVillageData.filter((secondItem:any) => {
    return !submitSurveyListData.some((firstItem:any) => {
      return (
        secondItem.deptId === firstItem.surveyDetail.deptId.toString() &&
        secondItem.villageId === firstItem.villageUniqueId.toString()
      );
    });
  });

  console.log(uniqueSecondArray)
  const uniquevillageListData:any = new Set();
  for (const item of uniqueSecondArray) {
    if (!uniquevillageListData.has(item.villageId)) {
      uniquevillageListData.add(item.villageId);
      uniqueRemainingVill.push(item);
    }
    }

    if(uniqueSecondArray.length == 0)
    {
      return res
      .status(400)
      .json({
        message: "Successfully fetched village name",
        remainingData:uniqueSecondArray,
        success: true,
        status:400
      });
    }
    else
    {
    return res
      .status(201)
      .json({
        message: "Successfully fetched village name",
        remainingData:uniqueSecondArray,
        success: true,
        status:200
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Internal Server Error",
        error: JSON.stringify(error),
        remainingData:[],
        success: false,
        status:500
      });
  }
}


export async function numberOfVillageRemaingCount(
  req: Request,
  res: Response
) {
  let { id,surveyId } = req.params;
  try {
    let user = await userModal.findOne({
      _id: new mongoose.Types.ObjectId(id),
      IsActive: true,
    });
    if (!user)
      return res
        .status(400)
        .send({ message: "This id is not exist, Invaild Id" });
   
        let assignDeptAndVillageData = await combinationModel.find({userID:id})   
// let alredySubmitSurvey = submitSurveyAlready.filter((submitedSurvey:any)=>{
//     return submitedSurvey.email == user[0].email
// })

let {uniqueVill, uniqueDept}:any = await findAssignVillageAndDept(assignDeptAndVillageData)

const uniqueRemainingVill:any = []


  console.log(assignDeptAndVillageData)
  let submitSurveyListData = await submitSurveyModal.find({surveyId:surveyId,email:user.email})
  // assignDeptAndVillageData.map((assignDeptAndVillageDatacheck)=>{
  //   submitSurveyListData.map((alreadySubmit:any)=>{
  //         if(alreadySubmit.villageUniqueId != assignDeptAndVillageDatacheck.villageId && alreadySubmit.deptId.toString() != assignDeptAndVillageDatacheck.deptId) 
  //         {

  //         }       
  //   })
  // })

  const uniqueSecondArray:any = assignDeptAndVillageData.filter((secondItem:any) => {
    return !submitSurveyListData.some((firstItem:any) => {
      return (
        secondItem.deptId === firstItem.surveyDetail.deptId.toString() &&
        secondItem.villageId === firstItem.villageUniqueId.toString()
      );
    });
  });

  console.log(uniqueSecondArray)
  const uniquevillageListData:any = new Set();
  for (const item of uniqueSecondArray) {
    if (!uniquevillageListData.has(item.villageId)) {
      uniquevillageListData.add(item.villageId);
      uniqueRemainingVill.push(item);
    }
    }

const  surveys:any = await surveyModal.findOne({_id:surveyId})
   console.log(surveys)

   function calculateRemainingDays(startDate, endDate) {
    const start = startDate;
    const end = endDate;

    // Calculate the time difference in milliseconds
    const timeDiff = end - start;

    // Calculate the number of days
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return daysRemaining;
}
 let startDate = new Date()
 let endDate = new Date(surveys.surveyEndDate)
 let remainingDay = calculateRemainingDays(startDate, endDate)
 
    return res
      .status(200)
      .json({
        message: "Successfully fetched village name",
        data:{remaningVillage:uniqueRemainingVill.length,remainingDay:remainingDay},
        success: true,
        status:200
      });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        message: "Internal Server Error",
        error: JSON.stringify(error),
        success: false,
        status:500
      });
  }
}


export async function combinationAdd(req: Request, res: Response) {
  try {
    console.log(req.body)
    const combinationDataArray = req.body; // Array of combinations

    // Arrays to store created combinations and existing combinations
    const createdCombinations:any = [];
    const existingCombinations:any = [];

    for (const combinationData of combinationDataArray) {
      const { deptId, villageId } = combinationData;
      const existingCombination = await combinationModel.findOne({ deptId, villageId });

      if (existingCombination) {
        existingCombinations.push(existingCombination);
      } else {
        const newCombination = new combinationModel(combinationData);
        const savedCombination = await newCombination.save();
        createdCombinations.push(savedCombination);
      }
    }

    if (existingCombinations.length > 0) {
      // Send the existing combinations to the user with the variable name "alreadyAssignedCombinations"
      res.status(200).json({
        status:200,
        createdCombinations,
        alreadyAssignedCombinations: existingCombinations,
        mssg:"some combination is already assign to this user or another user"
      });
    } else {
      res.status(201).json({createdCombinations:createdCombinations,mssg:"success",status:201});
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


export async function getCombinationData(req: Request, res: Response) {
  try {
    console.log(req.params.id,"--p")
    const combinations = await combinationModel.find({userID:req.params.id,isDisable:false});
    return res.status(200).json(combinations);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}


export async function deleteCombination(req: Request, res: Response){
  try {
    const { id } = req.params;
    const deletedCombination = await combinationModel.findByIdAndRemove(id);

    if (!deletedCombination) {
      return res.status(404).json({ error: 'Combination not found',status:400 });
    }

    return res.status(200).json({mssg:"Assigment Removed Successfully",status:200});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error',status:500 });
  }
};
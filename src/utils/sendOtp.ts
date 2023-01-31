// import express from 'express'
import initMB from 'messagebird';
 import * as dotenv from 'dotenv'
import otpModal from '../modal/userOTPModal';
// import n from "nexo";
const { Vonage } = require('@vonage/server-sdk')
const vonage = new Vonage({
  apiKey: "1f099d6e",
  apiSecret: "3VUGb63Kxde57hFA"
});

dotenv.config();
const MSGBIRD = process.env.MSGBIRD as any;
const messagebird = initMB(MSGBIRD);


export async function generateOTP(otp_length:any){
  // Declare a digits variable
  // which stores all digits
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < otp_length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilio = require('twilio')
export async function sendOTP(contactNumber,otp){
  const params = {
     originator : '+919927890044',
  body : `Hello World, I am a text message and I was hatched by Javascript code!${otp}`
} as any
  messagebird.messages.create(contactNumber,params)
}
// vonage.verify.start({
//   number: "919927890044",
//   brand: "Vonage"
// })
//   .then(resp => console.log(resp.request_id))
//   .catch(err => console.error(err));
export async function sendSMS(to, from, text) {
  vonage.verify.start({
    number: "919927890044",
    brand: "Village_Survey"
  }).then(async (resp) => {
    // const otp = new otpModal({
    //      contactNumber: "+919927890044",
    //     // otp: OTP,
    //     reqId: resp.request_id
    // })
    // await otp.save();
    console.log(resp.request_id)
    let verifyCodeId = resp.request_id;
    const otp = new otpModal({
        // otp: OTP,
        reqId: verifyCodeId
    })
    await otp.save();
    return verifyCodeId;
  }).catch(err => console.error(err));;
}
export async function verifyUser(REQUEST_ID, CODE) {
  vonage.verify.check(REQUEST_ID, CODE)
  .then(resp => console.log(resp))
  .catch(err => console.error(err));
}

 
 
// export async 
// smsService.sendSMS(contactNumber,message);
// export async function fast2sms({message , contactNumber},next:any){
//   try {
//     const res = smsService.sendSMS(contactNumber,message);
//     // var options = {authorization : FAST2SMS , 
//     //   message,
//     //   numbers: [contactNumber]
//     // };
//     // const res = await fast2sms.sendMessage(options)
//     // const res = await fast2sms.sendMessage({
//     //   authorization: FAST2SMS,
//     //   message,
//     //   numbers: [contactNumber],
//     // });
//     console.log(res);
//     return res;
//   } catch (error) {
//     next(error);
//   }
// };
// var options = {authorization : FAST2SMS , message : 'YOUR_MESSAGE_HERE' ,  numbers : ['9999999999','8888888888']} 
// exports.fast2sms.sendMessage(options) //Asynchronous Function.

// export { fast2sms };


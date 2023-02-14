// import express from 'express'
import initMB from 'messagebird';
 import * as dotenv from 'dotenv'
import otpModal from '../modal/userOTPModal';

dotenv.config();



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

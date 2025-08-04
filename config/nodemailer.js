import nodemailer from "nodemailer";
 const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
         user: process.env.AMAIL_ID,
    pass: process.env.APASSWORD 
    }
});

export {transporter};
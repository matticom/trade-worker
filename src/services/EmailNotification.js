import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
      user: process.env.EMAIL,
      pass: process.env.PW,
   },
});

export function sendEmail(subject, text) {
   // transporter.verify().then(console.log).catch(console.error);
   transporter
      .sendMail({
         from: `"Matti FinGuru" <${process.env.EMAIL}>`,
         to: `${process.env.EMAIL_RECEIVER}`,
         subject,
         text,
         // html: "<b>There is a new article. It's about sending emails, check it out!</b>", // html body
      })
      // .then((info) => {
      //    console.log({ info });
      // })
      .catch(console.error);
}

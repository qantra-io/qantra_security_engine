
const nodemailer = require("nodemailer");


let notifiy =(content, config)=>{

  let transporter = nodemailer.createTransport(config.transport);
  const mailOptions = {
    from: 'qantra.io@gmail.com', // sender address
    to: config.to, // list of receivers
    subject: `${content.title}`, // Subject line
    html: `<p>${content.body}</p>
    <p>${content.footer}</p>`// plain text body
  };

  transporter.sendMail(mailOptions, function (err, info) {
    if(err){
      console.log(err)
    }else{
      console.log('mail sent.')
    }
  });
  

}

module.exports = {
  notifiy
}
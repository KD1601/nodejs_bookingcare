const nodeMailer = require('nodemailer')
require('dotenv').config();

exports.sendSimpleEmail = (dataSend) => {
    const transport = nodeMailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        }
    })

    const options = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: dataSend.receiverEmail,
        subject: "Thông tin đặt lịch khám bệnh",
        html: getBodyHTMLEmail(dataSend)
    }
    return transport.sendMail(options);
}

let getBodyHTMLEmail = (dataSend) => {
    let result = ''
    if (dataSend.language === 'vi') {
        result = `
    
        <h3>Xin chào ${dataSend.patientName}</h3>
        <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên Felix Care</p>
        <p>Thông tin đặt lịch khám bệnh: </p>
        <div><b>Thời gian: ${dataSend.time}</b></div>
        <div><b>Bác sĩ: ${dataSend.doctorName}</b></div>

        <p>Nếu các thông tin trên là đúng sự thật vui lòng click vào đường link bên dưới để 
        xác nhận và hoàn tất thủ tục đặt lịch khám bệnh
        </p>
        <div>
        <a href="${dataSend.redirectLink}" target="_blank">Nhấn vào đây</a>
        </div>
        <div>Xin chân thành cảm ơn</div>
        `
    }
    if (dataSend.language === 'en') {
        result = `
    
        <h3>Dear ${dataSend.patientName}</h3>
        <p>You received this email because you made an online medical appointment on Felix Care</p>
        <p>Information on scheduling medical examinations: </p>
        <div><b>Time: ${dataSend.time}</b></div>
        <div><b>Doctor: ${dataSend.doctorName}</b></div>

        <p>If the above information is true, please click on the link below to confirm and complete the medical appointment procedure.
        </p>
        <div>
        <a href="${dataSend.redirectLink}" target="_blank">Click here</a>
        </div>
        <div>Sincerely thank</div>
        `
    }
    return result
}
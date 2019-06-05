const nodemailer = require("nodemailer");
const config = require('./emailConfig')

// async..await is not allowed in global scope, must use a wrapper
function sendemail(content, toEmail) {
    async function main() {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: config.authHost,
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: config.authUser, // generated ethereal user
                pass: config.authPws // generated ethereal password
            }
        });

        let html = "<table border=\"1\">\n" +
            "  <tr>\n" +
            "    <th>时间</th>\n" +
            "    <th>机器</th>\n" +
            "    <th>规则id</th>\n" +
            "    <th>报警原因</th>\n" +
            "  </tr>\n"
        for (let i = 0; i < content.length; i++) {
            html += "  <tr>\n" +
                "    <td>" + content[i].time + "</td>\n" +
                "    <td>" + content[i].machine_id + "</td>\n" +
                "    <td>" + content[i].rule_id + "</td>\n" +
                "    <td>" + content[i].reason + "</td>\n" +
                "  </tr>\n"
        }
        html += "</table>\n"

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"数据监控中心" <' + config.authUser + '>', // sender address
            to: toEmail, // list of receivers
            subject: "数据库异常", // Subject line
            text: "数据库异常，请去查看", // plain text body
            html: html
        });
    }

    main().catch(console.error);
}

module.exports = sendemail;

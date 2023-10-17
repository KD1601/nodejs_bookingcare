const db = require("../models")
require('dotenv').config()
import _ from 'lodash';


const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE

let getTopDoctorHome = (limit) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = await db.User.findAll({
                limit: limit,
                where: { roleId: 'R2' },
                order: [['createdAt', 'DESC']],
                attributes: {
                    exclude: ['password']
                },
                include: [
                    { model: db.AllCode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                    { model: db.AllCode, as: 'genderData', attributes: ['valueEn', 'valueVi'] },

                ],
                raw: true,
                nest: true
            })

            resolve({
                errCode: 0,
                data: users
            })
        } catch (e) {
            reject(e);
        }
    })
}

let getAllDoctors = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: { roleId: 'R2' },
                attributes: {
                    exclude: ['password', 'image']
                },
            })
            resolve({
                errCode: 0,
                doctors
            })
        } catch (e) {
            reject(e);
        }
    })
}

let getInfoDoctor = (data) => {
    return new Promise(async (resolve, reject) => {
        try {

            if (!data.doctorId || !data.contentHTML || !data.contentMarkdown
                || !data.action || !data.selectedPrice || !data.selectedPayment ||
                !data.selectedProvince || !data.nameClinic || !data.addressClinic ||
                !data.note) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                if (data.action === 'CREATE') {
                    await db.Markdown.create({
                        contentHTML: data.contentHTML,
                        contentMarkdown: data.contentMarkdown,
                        description: data.description,
                        doctorId: data.doctorId
                    })
                } else if (data.action === 'EDIT') {
                    let doctorMarkdown = await db.Markdown.findOne({
                        where: { doctorId: data.doctorId },
                        raw: false
                    })
                    if (doctorMarkdown) {
                        doctorMarkdown.contentHTML = data.contentHTML
                        doctorMarkdown.contentMarkdown = data.contentMarkdown
                        doctorMarkdown.description = data.description
                        doctorMarkdown.updateAt = new Date()
                        await doctorMarkdown.save()
                    }
                }

                // upser to doctor_info table
                let doctorInfo = await db.Doctor_info.findOne({
                    where: {
                        doctorId: data.doctorId,
                    },
                    raw: false
                })
                if (doctorInfo) {
                    // update
                    doctorInfo.doctorId = data.doctorId
                    doctorInfo.priceId = data.selectedPrice
                    doctorInfo.provinceId = data.selectedProvince
                    doctorInfo.paymentId = data.selectedPayment
                    doctorInfo.addressClinic = data.addressClinic
                    doctorInfo.nameClinic = data.nameClinic
                    doctorInfo.note = data.note
                    await doctorInfo.save()
                } else {
                    // Create
                    await db.Doctor_info.create({
                        doctorId: data.doctorId,
                        priceId: data.selectedPrice,
                        provinceId: data.selectedProvince,
                        paymentId: data.selectedPayment,
                        addressClinic: data.addressClinic,
                        nameClinic: data.nameClinic,
                        note: data.note,
                    })
                }


                resolve({
                    errCode: 0,
                    errMessage: 'Save info doctor successfully'
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getDetailDoctorById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: -1,
                    errMessage: 'Missing required parameter'
                })
            } else {
                let data = await db.User.findOne({
                    where: { id: id },
                    attributes: {
                        exclude: ['password']
                    },
                    include: [
                        {
                            model: db.Markdown,
                            attributes: ['description', 'contentHTML', 'contentMarkdown']
                        },
                        {
                            model: db.AllCode, as: 'positionData', attributes: ['valueEn', 'valueVi']
                        },
                        {
                            model: db.Doctor_info,
                            attributes: {
                                exclude: ['id', 'doctorId']
                            },
                            include: [
                                { model: db.AllCode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.AllCode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                                { model: db.AllCode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] }
                            ]
                        },

                    ],
                    raw: false,
                    nest: true
                })

                if (data && data.image) {
                    data.image = new Buffer(data.image, 'base64').toString('binary')
                }

                if (!data) data = {}

                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

let bulkCreateSchedule = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.arrSchedule || !data.doctorId || !data.formattedDate) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter'
                })
            } else {
                let schedule = data.arrSchedule
                if (schedule && schedule.length > 0) {
                    schedule = schedule.map(item => {
                        item.maxNumber = MAX_NUMBER_SCHEDULE
                        return item
                    })
                }
                // Get all existing data
                let existing = await db.Schedule.findAll({
                    where: { doctorId: data.doctorId, date: data.formattedDate },
                    attributes: ['timeType', 'date', 'doctorId', 'maxNumber'],
                    raw: true
                })
                // Compare different 
                let toCreate = _.differenceWith(schedule, existing, (a, b) => {
                    return a.timeType === b.timeType && +a.date === +b.date
                })
                // Create data
                if (toCreate && toCreate.length > 0) {
                    await db.Schedule.bulkCreate(toCreate)
                }

                resolve({
                    errCode: 0,
                    errMessage: 'OK'
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

let getScheduleByDate = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter'
                })
            } else {
                let dataSchedule = await db.Schedule.findAll({
                    where: {
                        doctorId: doctorId,
                        date: date
                    },
                    include: [
                        {
                            model: db.AllCode, as: 'timeTypeData', attributes: ['valueEn', 'valueVi']
                        },
                    ],
                    raw: false,
                    nest: true
                })

                if (!dataSchedule) dataSchedule = []
                resolve({
                    errCode: 0,
                    data: dataSchedule
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    getTopDoctorHome, getAllDoctors, getInfoDoctor, getDetailDoctorById,
    bulkCreateSchedule, getScheduleByDate
}
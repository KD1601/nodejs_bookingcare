const db = require("../models")
import bcrypt from 'bcryptjs'

const salt = bcrypt.genSaltSync(10);

let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            var hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword)
        } catch (err) {
            reject(err)
        }
    })
}

let handleUserLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {}
            let isExist = await checkUserEmail(email)
            if (isExist) {
                let user = await db.User.findOne({
                    where: { email: email },
                    attributes: ['id', 'email', 'roleId', 'password', 'firstName', 'lastName'],
                    raw: true
                })
                if (user) {
                    let check = await bcrypt.compareSync(password, user.password)
                    if (check) {
                        userData.errCode = 0
                        userData.errMsg = 'Ok'
                        delete user.password
                        userData.user = user
                    } else {
                        userData.errCode = 3
                        userData.errMessage = `Wrong password`
                    }
                } else {
                    userData.errCode = 2
                    userData.errMessage = `User's not found`
                }
            } else {
                userData.errCode = 1
                userData.errMessage = `Your's email isn't exist in your system. Please try other email!`
                resolve(userData)
            }
            resolve(userData)
        } catch (e) {
            reject(e)
        }
    })
}

let checkUserEmail = async (userEmail) => {
    try {
        let user = await db.User.findOne({
            where: { email: userEmail }
        })
        if (user) {
            return true
        } else {
            return false
        }
    } catch (err) {
        throw new Error(err)
    }
}

let getAllUsers = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = ''
            if (userId === 'ALL') {
                users = await db.User.findAll({
                    attributes: {
                        exclude: ['password']
                    },
                })
            }
            if (userId && userId !== 'ALL') {
                users = await db.User.findOne({
                    where: { id: userId },
                    attributes: {
                        exclude: ['password']
                    }
                })
            }
            resolve(users)
        } catch (e) {
            reject(e)
        }
    })
}

let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // check email exist
            let check = await checkUserEmail(data.email)
            if (check === true) {
                resolve({
                    errCode: 1,
                    errMessage: 'Your email is already in use, please try another email'
                })
            } else {
                let hashPasswordFromBcrypt = await hashUserPassword(data.password)
                await db.User.create({
                    email: data.email,
                    password: hashPasswordFromBcrypt,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    address: data.address,
                    phoneNumber: data.phoneNumber,
                    gender: data.gender,
                    roleId: data.roleId,
                    position: data.positionId,
                    image: data.avatar
                })

                resolve({
                    errCode: 0,
                    message: 'OK'
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}


let deleteUser = (id) => {
    return new Promise(async (resolve, reject) => {
        let user = await db.User.findOne({
            where: { id: id }
        })
        if (!user) {
            resolve({
                errCode: 2,
                errMessage: `The user isn't exist`
            })
        }

        await db.User.destroy({
            where: { id: id }
        })
        resolve({
            errCode: 0,
            message: 'The user is deleted'
        })
    })
}

let updateUserData = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.roleId || !data.position || !data.gender) {
                resolve({
                    errCode: 2,
                    errMessage: 'Missing required parameter'
                })
            }
            let user = await db.User.findOne({ where: { id: data.id }, raw: false })
            if (user) {
                user.firstName = data.firstName
                user.lastName = data.lastName
                user.address = data.address
                user.roleId = data.roleId
                user.position = data.position
                user.gender = data.gender
                user.phoneNumber = data.phoneNumber
                if (data.avatar) {
                    user.image = data.avatar
                }
                await user.save()
                resolve({
                    errCode: 0,
                    message: 'Update the user successfully'
                })
            } else {
                resolve({
                    errCode: 1,
                    errMessage: 'User not found'
                })
            }
        } catch (err) {
            reject(err)
        }
    })
}

let getAllCodeService = (typeInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!typeInput) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter'
                })
            } else {
                let res = {}
                let allcode = await db.AllCode.findAll({
                    where: { type: typeInput }
                })
                res.errCode = 0
                res.data = allcode
                resolve(res)

            }
        } catch (err) {
            reject(err)
        }
    })
}

module.exports = {
    handleUserLogin, checkUserEmail, getAllUsers, createNewUser,
    deleteUser, updateUserData, getAllCodeService
}
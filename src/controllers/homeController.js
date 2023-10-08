import { json } from 'body-parser';
import { request } from 'express';
import db from '../models/index'
import CRUDservice from '../services/CRUDservice'


let getHomePage = async (req, res) => {
    try {
        let data = await db.User.findAll()
        return res.render('homepage.ejs', { data: JSON.stringify(data) });
    } catch (e) {
        console.log(e)
    }
}

let getAboutPage = (req, res) => {
    return res.render('test/about.ejs');
}

let getCRUD = (req, res) => {
    return res.render('crud.ejs');
}

let postCRUD = async (req, res) => {
    let message = await CRUDservice.createNewUser(req.body)
    return res.send('post CRUD');
}

let displayCRUD = async (req, res) => {
    let data = await CRUDservice.getAllUser()
    return res.render('displayCRUD.ejs', { data: data });
}

let getEditCRUD = async (req, res) => {
    let userId = req.query.id
    if (userId) {
        let userData = await CRUDservice.getUserInfoById(userId)
        // check user data not found

        return res.render('editCRUD.ejs', { userData: userData })
    } else {
        return res.send('User not found')
    }
}

let putCRUD = async (req, res) => {
    let data = req.body
    let status = await CRUDservice.updateUserData(data)
    if (status) {
        return res.redirect('/get-crud')
    }
    return res.send('update failed')
}

let deleteCRUD = async (req, res) => {
    let id = req.query.id
    if (id) {
        let status = await CRUDservice.deleteUserById(id)
        if (status) {
            return res.send('Delete the user successfully')
        } else {
            return res.send('Delete the user failed')
        }
    } else {
        return res.send('User not found')
    }

}

module.exports = {
    getHomePage, getAboutPage, getCRUD, postCRUD, displayCRUD, getEditCRUD, putCRUD,
    deleteCRUD
}

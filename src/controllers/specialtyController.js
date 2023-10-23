import specialtyService from "../services/specialtyServicer"

let createSpecialty = async (req, res) => {
    try {
        let response = await specialtyService.createSpecialty(req.body);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e)
        res.status(200).json({
            errCode: -1,
            message: 'Error from server...'
        })
    }
}

let getAllSpecialty = async (req, res) => {
    try {
        let response = await specialtyService.getAllSpecialty();
        return res.status(200).json(response);
    } catch (e) {
        console.log(e)
        res.status(200).json({
            errCode: -1,
            message: 'Error from server...'
        })
    }
}

module.exports = { createSpecialty, getAllSpecialty }
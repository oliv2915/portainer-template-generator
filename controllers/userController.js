const router = require("express").Router();
const { UserModel } = require("../models");
const { UniqueConstraintError, ValidationError } = require("sequelize");
const bcrypt = require("bcrypt");

/* 
	Add User
*/
router.post("/register", (req, res) => {
	// get access to the new user data
	const { email, firstName, lastName, password } = req.body.user;
	// check for password length requirements
	// greater than or equal to 8 and less than 32, save password
	if (password.length >= 8 && password.length <= 32) {
		// create user using data provided
		UserModel.create({
			email,
			firstName,
			lastName,
			// if password is present, encrypt it or return null
			// this will cause a good error, it is needed for validation to work correctly
			password: bcrypt.hashSync(password, 13),
		})
			.then((createdUser) => createdUser.get()) // get returned user obj
			.then((userData) => {
				// return a 201 status and a sterlized user obj
				return res.status(201).json({
					message: "User created successfully",
					// id and password removed
					user: {
						uuid: userData.uuid,
						email: userData.email,
						firstName: userData.firstName,
						lastName: userData.lastName,
						suffix: userData.suffix,
						createdAt: userData.createdAt,
					},
				});
			}) // catch errors and handle as needed
			.catch((err) => {
				// email address is in use but another user
				if (err instanceof UniqueConstraintError) {
					return res.status(409).json({
						error: "UniqueConstraintError",
						message: err.message,
					});
					// something wrong with the requirements for saving the user data
				} else if (err instanceof ValidationError) {
					return res.status(400).json({
						error: "ValidationError",
						message: err.message,
					});
				} else {
					return res.status(500).json({
						error: "Error",
						message: "The server has encoutered an error",
					});
				}
			});
	} else {
		return res.status(400).json({
			message: "Password length does not fit requirements.",
		});
	}
});
/*
	User Login
*/
router.post("/login", (req, res) => {});
/*
	Update User
*/
router.put("/update", (req, res) => {});
/*
	Get all users
*/
router.get("/", async (req, res) => {
	const foundUsers = await UserModel.findAll();
	res.status(200).json(foundUsers);
});

module.exports = router;

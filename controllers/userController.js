const router = require("express").Router();
const { UserModel } = require("../models");
const { UniqueConstraintError, ValidationError } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/* 
	Add User
*/
router.post("/register", (req, res) => {
	// get access to the new user data
	const { email, firstName, lastName, suffix, password } = req.body.user;
	// if password is not >= 8
	if (!(password.length >= 8)) {
		// password does not match requirements
		return res.status(400).json({
			message: "Password must be greater than 8 characters",
		});
	}
	// create user
	UserModel.create({
		email,
		firstName,
		lastName,
		suffix,
		password,
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
			// email address is in use by another user
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
});
/*
	User Login
*/
router.post("/login", (req, res) => {
	const { email, password } = req.body.user;
	// if password is not >= 8
	if (!(password.length >= 8)) {
		// password does not match requirements
		return res.status(400).json({
			message: "Password must be greater than 8 characters",
		});
	}

	// find the user in the database and compare the password
	UserModel.findOne({ where: { email: email } })
		.then((foundUser) => {
			// if user is found, return the user
			if (foundUser) return foundUser.get();
			// else return no user found
			return res
				.status(400)
				.json({ message: "Invalid email or password was used" });
		})
		.then((user) => {
			// compare password
			if (bcrypt.compare(password, user.password)) {
				return res.status(200).json({
					message: "Login successful",
					token: jwt.sign({ uuid: user.uuid }, process.env.JWT_SECRET, {
						expiresIn: 60 * 60 * 24,
					}),
				});
			}
			// not authorized
			return res
				.status(400)
				.json({ message: "Invalid email or password was used" });
		})
		.catch((err) => res.status(500).json({ message: "Server Error" }));
});
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

const { DataTypes } = require("sequelize");
const db = require("../db");
const bcrypt = require("bcrypt");

const User = db.define("user", {
	uuid: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
	},
	email: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: {
			args: true,
			msg: "Email address already in use",
		},
		validate: {
			isEmail: {
				args: true,
				msg: "Email must be in a valid format. ex: john.doe@example.com",
			},
			notEmpty: {
				args: true,
				msg: "Email can not be empty",
			},
			notNull: {
				args: true,
				msg: "Email can not be empty",
			},
		},
	},
	firstName: {
		type: DataTypes.STRING,
		allowNull: false,
		validate: {
			notEmpty: {
				args: true,
				msg: "Firstname can not be empty",
			},
			notNull: {
				args: true,
				msg: "Firstname can not be empty",
			},
		},
	},
	lastName: {
		type: DataTypes.STRING,
		allowNull: false,
		validate: {
			notEmpty: {
				args: true,
				msg: "Lastname can not be empty",
			},
			notNull: {
				args: true,
				msg: "Lastname can not be empty",
			},
		},
	},
	suffix: {
		type: DataTypes.STRING,
		defaultValue: "",
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false,
		validate: {
			notEmpty: {
				args: true,
				msg: "Password can not be empty",
			},
			notNull: {
				msg: "Password can not be empty",
			},
		},
		set(password) {
			this.setDataValue("password", bcrypt.hashSync(password, 13));
		},
	},
});

module.exports = User;

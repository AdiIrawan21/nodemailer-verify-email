const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const { getHTML } = require("../libs/nodemailer");
const { JWT_SECRET_KEY } = process.env;

module.exports = {
    register: async (req, res, next) => {
        try {
            let { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({
                    status: false,
                    message: 'name, email, password are required',
                    data: null
                });
            };

            let exist = await prisma.user.findFirst({
                where: {
                    email
                }
            });

            if (exist) {
                return res.status(400).json({
                    status: false,
                    message: 'email has already been used!',
                    data: null
                });
            };

            // enkripsi password
            let encryptedPassword = await bcrypt.hash(password, 10);
            let user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: encryptedPassword
                }
            });

            delete user.password

            return res.status(201).json({
                status: true,
                message: 'Registered are successfull',
                data: { user }
            });

        } catch (error) {
            next(error);
        }
    },

    login: async (req, res, next) => {
        try {
            let { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    status: false,
                    message: 'email or password are required',
                    data: null
                });
            };

            let user = await prisma.user.findFirst({ where: { email } })

            if (!user) {
                return res.status(401).json({
                    status: false,
                    message: 'users not found',
                    data: null
                });
            };

            let isPasswordCorrect = await bcrypt.compare(password, user.password);

            if (!isPasswordCorrect) {
                return res.status(400).json({
                    status: false,
                    message: 'invalid email or password',
                    data: null
                });
            };
            delete user.password

            let token = jwt.sign(user, JWT_SECRET_KEY)
            return res.status(200).json({
                status: true,
                message: 'User logged in success',
                data: { ...user, token }
            });

        } catch (error) {
            next(error);
        }
    },

    whoami: async (req, res, next) => {
        try {
            return res.status(200).json({
                status: true,
                message: 'OK',
                data: {
                    user: req.user
                }
            });

        } catch (error) {
            next(error);
        }
    },

    // Function verify email
    verifyEmail: async (req, res, next) => {
        try {
            // check token di dalam query
            const { token } = req.query;

            // verify token -> ambil user_id
            jwt.verify(token, JWT_SECRET_KEY, async (err, data) => {
                if (err) {
                    // return error
                    return res.send('<h1>Failed to Verify</h1>')
                }

                // update is_verified = true where id=user_id
                await prisma.user.update({
                    data: { is_verified: true },
                    where: { id: data.id }
                });
            });
            // render html (success)
            res.send('<h1>Verified Success</h1>');

        } catch (error) {
            next(error);
        }
    },

    // function request verify email
    requestVerifyEmail: async (req, res, next) => {
        try {
            // generate token untuk url verifikasi
            let token = jwt.sign({ id: req.user.id });

            // // generate url untuk verifikasi
            let url = `http://localhost:3000/api/v1/verify?token=${token}`;

            let html = await getHTML('verification-code.ejs', { name: 'adi', verification_url: url });
            res.send(html);

        } catch (error) {
            next(error);
        }
    }
};
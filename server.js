
const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./config/database')

require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Test database connection
app.get('/api/status', async (req, res) => {
    try {
        await db.query('SELECT 1');

        res.json({
            success: true,
            message: 'ChickConnect backend and database connected!'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database connection failed.'
        });
    }
});

// USER REGISTRATION
app.post('/api/auth/register', async (req, res) => {
    try {
        const { full_name, email, phone, password, location } = req.body;

        if (!full_name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields.'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least 8 characters.'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const [existingUser] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [normalizedEmail]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'This email is already registered.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const [result] = await db.query(
            `INSERT INTO users
            (full_name, email, phone, password_hash, location)
            VALUES (?, ?, ?, ?, ?)`,
            [
                full_name.trim(),
                normalizedEmail,
                phone.trim(),
                hashedPassword,
                location || null
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Your ChickConnect account was created successfully!',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Registration error:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to register. Please try again.'
        });
    }
});

// USER LOGIN
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [normalizedEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const user = users[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            message: 'Login successful!',
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                location: user.location
            }
        });

    } catch (error) {
        console.error('Login error:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to log in. Please try again.'
        });
    }
});


// AUTHENTICATION MIDDLEWARE
function authenticateToken(req, res, next) {

    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: 'Please login first.'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {

        if (error) {
            return res.status(403).json({
                message: 'Invalid or expired session.'
            });
        }

        req.user = user;
        next();
    });
}


// CREATE A CHICKEN LISTING
app.post('/api/listings', authenticateToken, async (req, res) => {
    try {
        const {
            title,
            description,
            chicken_type,
            quantity,
            price,
            location,
            image
        } = req.body;

        // Validate required fields
        if (
            !title ||
            !chicken_type ||
            !quantity ||
            !price ||
            !location
        ) {
            return res.status(400).json({
                message: 'Please complete all required fields.'
            });
        }

        if (Number(quantity) <= 0 || Number(price) <= 0) {
            return res.status(400).json({
                message: 'Quantity and price must be greater than zero.'
            });
        }


// GET ALL AVAILABLE CHICKEN LISTINGS
app.get('/api/listings', async (req, res) => {
    try {
        const [listings] = await db.query(`
            SELECT
                listings.id,
                listings.title,
                listings.description,
                listings.chicken_type,
                listings.quantity,
                listings.price,
                listings.location,
                listings.image,
                listings.created_at,
                users.full_name AS seller_name,
                users.phone AS seller_phone
            FROM listings
            JOIN users ON listings.user_id = users.id
            WHERE listings.status = 'available'
            ORDER BY listings.created_at DESC
        `);

        res.json({
            success: true,
            listings: listings
        });

    } catch (error) {
        console.error('Marketplace Error:', error);

        res.status(500).json({
            message: 'Unable to load chicken listings.'
        });
    }
});


        // Save listing in MySQL
        const [result] = await db.query(
            `INSERT INTO listings
            (user_id, title, description, chicken_type,
             quantity, price, location, image, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'available')`,
            [
                req.user.id,
                title,
                description || '',
                chicken_type,
                Number(quantity),
                Number(price),
                location,
                image || null
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Your chicken listing was created successfully!',
            listingId: result.insertId
        });

    } catch (error) {
        console.error('Listing Error:', error);

        res.status(500).json({
            message: 'Unable to create your listing.'
        });
    }
});



// GET LOGGED-IN USER
app.get('/api/auth/me', authenticateToken, async (req, res) => {

    try {

        const [users] = await db.query(
            `SELECT id, full_name, email, phone, location
             FROM users WHERE id = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: 'User account not found.'
            });
        }

        res.json({
            success: true,
            user: users[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Unable to retrieve user information.'
        });
    }
});


// START SERVER
app.listen(PORT, () => {
    console.log(`ChickConnect running at http://localhost:${PORT}`);
});

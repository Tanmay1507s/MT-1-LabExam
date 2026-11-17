
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Food records
let foods = [
    {
        id: 1,
        foodName: "Pizza",
        category: "Fast Food",
        price: 250,
        availability: true
    },
    {
        id: 2,
        foodName: "Burger",
        category: "Fast Food",
        price: 120,
        availability: true
    },
    {
        id: 3,
        foodName: "Pasta",
        category: "Italian",
        price: 180,
        availability: false
    }
];

// Helper function for JSON response
function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json'
    });

    res.end(JSON.stringify(data));
}

// Create HTTP server
const server = http.createServer((req, res) => {

    const { method, url } = req;

    // GET /
    if (method === 'GET' && url === '/') {

        res.writeHead(200, {
            'Content-Type': 'text/html'
        });

        res.end(`
            <h1>Welcome to Food Ordering Application</h1>
            <p>Order your favourite food here!</p>
        `);
    }

    // GET /foods
    else if (method === 'GET' && url === '/foods') {

        const availableFoods = foods.filter(
            food => food.availability === true
        );

        sendJSON(res, 200, availableFoods);
    }

    // GET /about
    else if (method === 'GET' && url === '/about') {

        res.writeHead(200, {
            'Content-Type': 'text/html'
        });

        res.end(`
            <h1>About Our Restaurant</h1>
            <p>We serve delicious food at affordable prices.</p>
        `);
    }

    // GET /menu
    else if (method === 'GET' && url === '/menu') {

        const menuPath = path.join(__dirname, 'public', 'menu.html');

        fs.readFile(menuPath, 'utf8', (err, data) => {

            if (err) {
                sendJSON(res, 500, {
                    message: "Error reading menu file"
                });
                return;
            }

            res.writeHead(200, {
                'Content-Type': 'text/html'
            });

            res.end(data);
        });
    }

    // POST /add-food
    else if (method === 'POST' && url === '/add-food') {

        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {

            try {
                const newFood = JSON.parse(body);

                const { id, foodName, category, price, availability } = newFood;

                if (
                    !Number.isInteger(id) ||
                    typeof foodName !== 'string' ||
                    !foodName.trim() ||
                    typeof category !== 'string' ||
                    !category.trim() ||
                    typeof price !== 'number' ||
                    price <= 0 ||
                    typeof availability !== 'boolean'
                ) {
                    sendJSON(res, 400, {
                        message: "Missing or invalid food details"
                    });
                    return;
                }

                if (foods.some(food => food.id === id)) {
                    sendJSON(res, 400, {
                        message: "Food ID already exists"
                    });
                    return;
                }

                foods.push(newFood);

                sendJSON(res, 201, {
                    message: "Food added successfully",
                    food: newFood
                });

            } catch (error) {

                sendJSON(res, 400, {
                    message: "Invalid JSON format"
                });
            }
        });
    }

    // Invalid routes
    else {

        sendJSON(res, 404, {
            message: "Route not found"
        });
    }
});

// Start HTTP server
server.listen(3000, () => {
    console.log("HTTP Server running at http://localhost:3000");
});

const express = require('express');
const bodyParser = require('body-parser');
const soap = require('soap');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.raw({ type: 'text/xml' }));

// Servicio de la calculadora
const service = {
    CalculatorService: {
        CalculatorPort: {
            Add: function(args) {
                const result = parseFloat(args.number1) + parseFloat(args.number2);
                return { result: result };
            },
            Subtract: function(args) {
                const result = parseFloat(args.number1) - parseFloat(args.number2);
                return { result: result };
            },
            Multiply: function(args) {
                const result = parseFloat(args.number1) * parseFloat(args.number2);
                return { result: result };
            },
            Divide: function(args) {
                const n2 = parseFloat(args.number2);
                if (n2 === 0) {
                    throw new Error("Division by zero");
                }
                const result = parseFloat(args.number1) / n2;
                return { result: result };
            }
        }
    }
};

// Cargar WSDL
const wsdlPath = path.join(__dirname, 'calculator.wsdl');
const wsdlContent = fs.readFileSync(wsdlPath, 'utf8');

// Ruta para el WSDL
app.get('/calculator.wsdl', function(req, res) {
    res.type('application/xml');
    res.send(wsdlContent);
});

// Configuración para Render
const port = process.env.PORT || 8000;
const host = '0.0.0.0';

// Iniciar servidor SOAP
const server = app.listen(port, host, function() {
    console.log(`Servidor SOAP escuchando en http://${host}:${port}`);
    soap.listen(app, '/calculator', service, wsdlContent);
});

// Manejo de errores
server.on('error', function(err) {
    console.error('Error del servidor:', err);
});
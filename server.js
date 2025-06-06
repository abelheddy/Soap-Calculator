const express = require('express');
const bodyParser = require('body-parser');
const soap = require('soap');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.raw({ type: function () { return true; }, limit: '5mb' }));

// Definición del servicio SOAP
const service = {
    CalculatorService: {
        CalculatorPort: {
            Add: ({ number1, number2 }) => ({ result: parseFloat(number1) + parseFloat(number2) }),
            Subtract: ({ number1, number2 }) => ({ result: parseFloat(number1) - parseFloat(number2) }),
            Multiply: ({ number1, number2 }) => ({ result: parseFloat(number1) * parseFloat(number2) }),
            Divide: ({ number1, number2 }) => {
                if (parseFloat(number2) === 0) throw new Error('Division by zero');
                return { result: parseFloat(number1) / parseFloat(number2) };
            }
        }
    }
};

// Leer el WSDL
const wsdlPath = path.join(__dirname, 'calculator.wsdl');
const wsdlXml = fs.readFileSync(wsdlPath, 'utf8');

// Ruta pública del WSDL
app.get('/calculator.wsdl', (_, res) => {
    res.type('text/xml');
    res.send(wsdlXml);
});

// Escuchar en el puerto asignado por Render
const port = process.env.PORT || 8000;
const host = '0.0.0.0';

const server = app.listen(port, host, () => {
    console.log(`SOAP service running at http://${host}:${port}`);
    soap.listen(server, '/calculator', service, wsdlXml);
});

server.on('error', (err) => {
    console.error('Server error:', err);
});

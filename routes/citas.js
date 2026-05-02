const express = require('express');
const router  = express.Router();
const { disponibilidad, misCitas, crearCita, cancelarCita } = require('../controllers/citaController');
const { verificarToken } = require('../middleware/auth');

router.get('/disponibilidad', disponibilidad);
router.get('/',               verificarToken, misCitas);
router.post('/',              verificarToken, crearCita);
router.delete('/:id',         verificarToken, cancelarCita);

module.exports = router;
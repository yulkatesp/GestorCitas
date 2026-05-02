const express = require('express');
const router  = express.Router();
const { todasLasCitas, listarMedicos, crearMedico, estadisticas } = require('../controllers/adminController');
const { verificarToken, soloAdmin } = require('../middleware/auth');

// ✅ Esta ruta es pública para todos los usuarios autenticados
router.get('/medicos', verificarToken, listarMedicos);

// 🔒 Estas solo para admin
router.get('/citas',        verificarToken, soloAdmin, todasLasCitas);
router.post('/medicos',     verificarToken, soloAdmin, crearMedico);
router.get('/estadisticas', verificarToken, soloAdmin, estadisticas);

module.exports = router;
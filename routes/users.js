const express = require('express');
const router  = express.Router();
const { register, login, perfil } = require('../controllers/userController');
const { verificarToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login',    login);
router.get('/perfil',    verificarToken, perfil);

module.exports = router;
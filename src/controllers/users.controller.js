
import bcrypt from 'bcryptjs';
import {
  getUserById,
  updatePassword,
  getAllUsers,
} from '../services/users.service.js';

export async function getMe(req, res) {
  try {
    const user = await getUserById(req.user.sub);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
      last_access: user.last_access,
    });
  } catch (error) {
    console.error('Error en getMe:', error);
    return res.status(500).json({ message: 'Error interno al obtener usuario' });
  }
}


export async function changeMyPassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'faltan campos' });
    }

    const user = await getUserById(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'usuario no encontrado' });
    }

    const ok = await bcrypt.compare(currentPassword, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'contraseña actual incorrecta' });
    }

    await updatePassword(user.id, newPassword);
    return res.json({ message: 'contraseña actualizada correctamente' });
  } catch (error) {
    console.error('error en changeMyPassword:', error);
    return res.status(500).json({ message: 'Error interno al cambiar contraseña' });
  }
}

export async function listUsers(req, res) {
  try {
    const users = await getAllUsers();
    return res.json(users);
  } catch (error) {
    console.error('error en lista de usuarios:', error);
    return res.status(500).json({ message: 'error interno al listar usuarios' });
  }
}


export async function home(req, res) {
  try {
    const user = await getUserById(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no existe' });
    }

    return res.json({
      message: `Bienvenido/a, ${user.full_name}`,
      last_access: user.last_access,
      role: user.role,
    });
  } catch (error) {
    console.error('Error en home:', error);
    return res.status(500).json({ message: 'Error interno en home' });
  }
}

/**
 * Cloud Function: hapusAkun
 * Menghapus akun login (Firebase Authentication) beserta datanya.
 * Dipanggil dari admin.html (tombol "Hapus akun" pada Akun Pengajar/Pengurus dan Akun Orang Tua).
 *
 * Siapa yang dianggap admin (cukup salah satu):
 *  1. custom claim  admin === true pada token pengguna
 *  2. dokumen Firestore  admins/{uid}  ada
 *  3. email pengguna terdaftar di variabel lingkungan ADMIN_EMAILS (pisahkan dengan koma)
 * Sesuaikan fungsi adalahAdmin() bila aplikasi Anda menentukan admin dengan cara lain.
 */
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
admin.initializeApp();

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

async function adalahAdmin(auth) {
  if (!auth) return false;
  const t = auth.token || {};
  if (t.admin === true) return true;
  if (t.email && ADMIN_EMAILS.includes(String(t.email).toLowerCase())) return true;
  const s = await admin.firestore().doc('admins/' + auth.uid).get();
  return s.exists;
}

exports.hapusAkun = onCall({ region: 'us-central1' }, async (req) => {
  if (!(await adalahAdmin(req.auth))) throw new HttpsError('permission-denied', 'Hanya admin yang boleh menghapus akun.');
  const uid = String((req.data && req.data.uid) || '').trim();
  if (!uid) throw new HttpsError('invalid-argument', 'uid wajib diisi.');
  if (uid === req.auth.uid) throw new HttpsError('failed-precondition', 'Akun admin yang sedang dipakai tidak bisa dihapus.');
  const db = admin.firestore();
  if ((await db.doc('admins/' + uid).get()).exists) throw new HttpsError('failed-precondition', 'Akun admin tidak bisa dihapus dari sini.');

  // 1. hapus akun login
  try { await admin.auth().deleteUser(uid); }
  catch (e) { if (e.code !== 'auth/user-not-found') throw new HttpsError('internal', 'Gagal menghapus akun login: ' + e.message); }

  // 2. hapus data akun
  const batch = db.batch();
  batch.delete(db.doc('staf/' + uid));
  batch.delete(db.doc('ortu/' + uid));
  const taut = await db.collection('tautan').where('uid', '==', uid).get();
  taut.forEach(d => batch.delete(d.ref));
  // 3. lepas santri yang tertaut (data santri tetap ada)
  const sn = await db.collection('santri').where('ortuUid', '==', uid).get();
  sn.forEach(d => batch.update(d.ref, { ortuUid: '', ortuNama: '' }));
  await batch.commit();
  return { ok: true };
});

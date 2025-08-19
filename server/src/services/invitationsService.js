const crypto = require('crypto');
const db = require('../config/database');

function hashCode(code){
  return crypto.createHash('sha256').update(code).digest('hex');
}

async function createInvitation({ email=null, role='admin', expiresAt=null, createdBy=null }) {
  const code = crypto.randomBytes(24).toString('hex');
  const codeHash = hashCode(code);
  await db.query(`INSERT INTO invitations (code_hash, email, role, expires_at, created_by) VALUES (?,?,?,?,?)`,[
    codeHash, email, role, expiresAt, createdBy
  ]);
  return { code, email, role, expiresAt };
}

async function listInvitations({ page=1, limit=20 }) {
  const offset = (page-1)*limit;
  const rows = await db.query(`SELECT id, email, role, expires_at, used_at, created_by, created_at FROM invitations ORDER BY id DESC LIMIT ? OFFSET ?`,[limit, offset]);
  return rows;
}

async function validateInvitation(code, email) {
  if(!code) return null;
  const codeHash = hashCode(code);
  const rows = await db.query(`SELECT * FROM invitations WHERE code_hash=? LIMIT 1`,[codeHash]);
  if(!rows.length) return null;
  const inv = rows[0];
  if(inv.used_at) return null;
  if(inv.expires_at && new Date(inv.expires_at) < new Date()) return null;
  if(inv.email && email && inv.email.toLowerCase() !== email.toLowerCase()) return null;
  return inv;
}

async function markInvitationUsed(id) {
  await db.query(`UPDATE invitations SET used_at=NOW() WHERE id=? AND used_at IS NULL`,[id]);
}

module.exports = { createInvitation, listInvitations, validateInvitation, markInvitationUsed };

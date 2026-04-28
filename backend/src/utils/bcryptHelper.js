const crypto = require("crypto");

function hashPassword(password) {
	const salt = crypto.randomBytes(16).toString("hex");
	const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
	return `${salt}:${hash}`;
}

function comparePassword(password, storedHash) {
	if (!storedHash || !storedHash.includes(":")) {
		return false;
	}

	const [salt, originalHash] = storedHash.split(":");
	const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
	const hashBuffer = Buffer.from(hash, "hex");
	const originalBuffer = Buffer.from(originalHash, "hex");

	if (hashBuffer.length !== originalBuffer.length) {
		return false;
	}

	return crypto.timingSafeEqual(hashBuffer, originalBuffer);
}

module.exports = { hashPassword, comparePassword };

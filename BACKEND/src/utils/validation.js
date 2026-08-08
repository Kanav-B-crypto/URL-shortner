import { BadRequestError } from "./errorHandler.js"

// Deliberately permissive: catches obvious typos without rejecting valid
// but unusual addresses. Real verification happens by emailing the user.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const MIN_PASSWORD_LENGTH = 6

export const validateRegisterInput = ({ name, email, password }) => {
    if (typeof name !== "string" || !name.trim()) {
        throw new BadRequestError("Name is required")
    }
    if (typeof email !== "string" || !email.trim()) {
        throw new BadRequestError("Email is required")
    }
    if (!EMAIL_REGEX.test(email.trim())) {
        throw new BadRequestError("Please provide a valid email address")
    }
    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
        throw new BadRequestError(
            `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
        )
    }

    return {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
    }
}

export const validateLoginInput = ({ email, password }) => {
    if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
        throw new BadRequestError("Email and password are required")
    }

    return { email: email.trim().toLowerCase(), password }
}

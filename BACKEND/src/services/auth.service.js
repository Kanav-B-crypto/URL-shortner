import { createUser, findUserByEmail, findUserByEmailByPassword } from "../dao/user.dao.js"
import { ConflictError, UnauthorizedError } from "../utils/errorHandler.js"
import {signToken} from "../utils/helper.js"
import { validateLoginInput, validateRegisterInput } from "../utils/validation.js"

export const registerUser = async (rawName, rawEmail, rawPassword) => {
    const {name, email, password} = validateRegisterInput({name: rawName, email: rawEmail, password: rawPassword})

    const existing = await findUserByEmail(email)
    if(existing) throw new ConflictError("User already exists")
    const newUser = await createUser(name, email, password)
    return {user:newUser}
}

export const loginUser = async (rawEmail, rawPassword) => {
    const {email, password} = validateLoginInput({email: rawEmail, password: rawPassword})

    const user = await findUserByEmailByPassword(email)
    if(!user) throw new UnauthorizedError("Invalid email or password")

    const isPasswordValid = await user.comparePassword(password)
    if(!isPasswordValid) throw new UnauthorizedError("Invalid email or password")
    const token = signToken({id: user._id})
    return {token,user}
}


import { Router } from "express";
import { auth, nonAuth, isSame, isExist } from "../middlewares/auth";
import { upload } from "../utils/multer";
import { validate } from "../middlewares/validate";
import { saveFile } from "../middlewares/file";
import {
  forgotSchema,
  registerSchema,
  resetSchema,
  userSchema,
} from "../utils/joi";
import {
  loginUser,
  logoutUser,
  registerUser,
  resetUser,
  forgotUser,
  verifyUser,
  getUsers,
  getUserById,
  updateUser,
} from "../controllers/user";
/**
 * @openapi
 * components:
 *   schemas:
 *     LoginPayload:
 *       type: object
 *       properties:
 *         emailOrUsername:
 *           type: string
 *           example: user@example.com
 *         password:
 *           type: string
 *           example: 1234567890
 *       required:
 *         - emailOrUsername
 *         - password
 *     RegisterPayload:
 *       type: object
 *       properties:
 *         full_name:
 *           type: string
 *           example: User
 *         email:
 *           type: string
 *           example: user@example.com
 *         password:
 *           type: string
 *           example: 1234567890
 *       required:
 *         - full_name
 *         - email
 *         - password
 *     ResetPayload:
 *       type: object
 *       properties:
 *         password:
 *           type: string
 *           example: 1234567890
 *         newPassword:
 *           type: string
 *           example: 1234567890
 *       required:
 *         - password
 *         - newPassword
 *     VerifyPayload:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *     UserPayload:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         username:
 *           type: string
 *         full_name:
 *           type: string
 *         email:
 *           type: string
 *         photo_profile:
 *           type: string
 *         bio:
 *           type: string
 *     UpdatePayload:
 *       type: object
 *       properties:
 *         photo_profile:
 *           type: string
 *           format: binary
 *           example: Upload image here
 *         full_name:
 *           type: string
 *           example: User
 *         username:
 *           type: string
 *           example: user
 *         bio:
 *           type: string
 *           example: user bio
 *       required:
 *         - full_name
 */
const router = Router();
/**
 * @openapi
 * /api/v1/login:
 *   post:
 *     summary: Login
 *     description: This endpoint give all endpoint access to this api.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/LoginPayload'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.post("/login", nonAuth, loginUser);
/**
 * @openapi
 * /api/v1/register:
 *   post:
 *     summary: Register
 *     description: This endpoint used to create a new user.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/RegisterPayload'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.post("/register", nonAuth, validate(registerSchema), registerUser);
router.post("/forgot", nonAuth, validate(forgotSchema), forgotUser);
/**
 * @openapi
 * /api/v1/logout:
 *   post:
 *     summary: Logout
 *     description: This endpoint cut all endpoint access to this api.
 *     tags: [User]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.post("/logout", auth, logoutUser);
/**
 * @openapi
 * /api/v1/reset/{id}:
 *   put:
 *     summary: Post Reset
 *     description: This endpoint used to reset user password.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         description: View for specific user by their id.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ResetPayload'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.put(
  "/reset/:id",
  nonAuth,
  isExist("user"),
  validate(resetSchema),
  resetUser
);
/**
 * @openapi
 * /api/v1/verify:
 *   get:
 *     summary: Get Verify
 *     description: This endpoint retrieves log info to prove user is logged-in.
 *     tags: [User]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   $ref: '#/components/schemas/VerifyPayload'
 */
router.get("/verify", auth, verifyUser);
/**
 * @openapi
 * /api/v1/user:
 *   get:
 *     summary: Get All Users
 *     description: This endpoint retrieves all user information.
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: search
 *         description: Search for users by username or full name.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserPayload'
 */
router.get("/user", auth, getUsers);
/**
 * @openapi
 * /api/v1/user/{id}:
 *   get:
 *     summary: Get User
 *     description: This endpoint retrieves specific user information by their ID.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         description: View for specific user by their id.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   $ref: '#/components/schemas/UserPayload'
 */
router.get("/user/:id", auth, getUserById);
/**
 * @openapi
 * /api/v1/user/{id}:
 *   put:
 *     summary: Update User
 *     description: This endpoint used to update user account.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         description: View for specific user by their id.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *          multipart/form-data:
 *            schema:
 *              $ref: '#/components/schemas/UpdatePayload'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.put(
  "/user/:id",
  auth,
  isSame,
  isExist("user"),
  upload.single("photo_profile"),
  validate(userSchema),
  saveFile,
  updateUser
);

export default router;

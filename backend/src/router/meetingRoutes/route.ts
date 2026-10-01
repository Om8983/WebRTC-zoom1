import { Router } from "express";
import {
  createMeeting,
  endMeeting,
  joinMeeting,
  leaveMeeting,
  viewParticipants,
} from "../../controllers/meetingControllers/meetingControllers";

const router = Router();

router.post("/createMeeting", createMeeting);
router.post("/joinMeeting", joinMeeting);
router.post("/leaveMeeting", leaveMeeting);
router.post("/endMeeting", endMeeting);
router.get("/viewParticipants", viewParticipants);

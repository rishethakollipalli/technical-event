import { renderStudentDashboard } from "./dashboards/student.js";
import { renderProctorDashboard } from "./dashboards/proctor.js";
import { renderEventInChargeDashboard } from "./dashboards/event-in-charge.js";

export const ROLE_LABELS = {
  student: "Student",
  proctor: "Proctor",
  event_in_charge: "Event In-Charge"
};

export function normalizeRole(role) {
  return ROLE_LABELS[role] ? role : null;
}

export function getRoleLabel(role) {
  return ROLE_LABELS[role] ?? "Role not assigned";
}

export async function renderRoleDashboard(role, workspace, user) {
  const normalizedRole = normalizeRole(role);

  if (!normalizedRole) {
    workspace.textContent =
      "Your role has not been assigned. Please contact the event team.";
    return;
  }

  switch (normalizedRole) {
    case "student":
      await renderStudentDashboard(workspace, user);
      break;

    case "proctor":
      await renderProctorDashboard(workspace, user);
      break;

    case "event_in_charge":
      await renderEventInChargeDashboard(workspace, user);
      break;

    default:
      workspace.textContent = "Dashboard unavailable.";
  }
}
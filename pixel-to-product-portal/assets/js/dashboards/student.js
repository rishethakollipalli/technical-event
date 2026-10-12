import { supabase } from "../supabase-client.js";

export async function renderStudentDashboard(workspace, user) {
  workspace.replaceChildren();

  const heading = document.createElement("h1");
  heading.textContent = "Student Dashboard";

  const intro = document.createElement("p");
  intro.textContent =
    "Explore events and track your participation requests.";

  const eventHeading = document.createElement("h2");
  eventHeading.textContent = "Open Events";

  const eventList = document.createElement("div");
  eventList.className = "dashboard-list";
  eventList.textContent = "Loading events...";

  const requestHeading = document.createElement("h2");
  requestHeading.textContent = "My Participation Requests";

  const requestList = document.createElement("div");
  requestList.className = "dashboard-list";
  requestList.textContent = "Loading your requests...";

  workspace.append(
    heading,
    intro,
    eventHeading,
    eventList,
    requestHeading,
    requestList
  );

  // Load real open events.
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id, title, description, location, starts_at")
    .eq("status", "open")
    .order("starts_at", { ascending: true });

  eventList.replaceChildren();

  if (eventsError) {
    eventList.textContent = "Unable to load events. Please try again.";
    console.error("Events query failed:", eventsError);
  } else if (!events?.length) {
    eventList.textContent = "There are no open events at the moment.";
  } else {
    for (const event of events) {
      const card = document.createElement("article");
      card.className = "dashboard-card";

      const title = document.createElement("h3");
      title.textContent = event.title;

      const description = document.createElement("p");
      description.textContent =
        event.description || "No description provided.";

      const location = document.createElement("p");
      location.textContent = `Location: ${event.location || "Not specified"}`;

      const date = document.createElement("p");
      date.textContent = `Starts: ${new Date(event.starts_at).toLocaleString()}`;

      const applyButton = document.createElement("button");
      applyButton.type = "button";
      applyButton.textContent = "Request Participation";

      applyButton.addEventListener("click", async () => {
        applyButton.disabled = true;
        applyButton.textContent = "Submitting...";

        const { error } = await supabase
          .from("participation_requests")
          .insert({
            event_id: event.id,
            student_id: user.id
          });

        if (error) {
          console.error("Request submission failed:", error);
          applyButton.textContent =
            error.code === "23505"
              ? "Already Requested"
              : "Submission Failed";

          if (error.code !== "23505") {
            applyButton.disabled = false;
          }
          return;
        }

        applyButton.textContent = "Request Submitted";
        applyButton.disabled = true;
        await loadRequests();
      });

      card.append(title, description, location, date, applyButton);
      eventList.append(card);
    }
  }

  async function loadRequests() {
    requestList.textContent = "Loading your requests...";

    const { data: requests, error } = await supabase
      .from("participation_requests")
      .select("id, status, submitted_at, events(title)")
      .eq("student_id", user.id)
      .order("submitted_at", { ascending: false });

    requestList.replaceChildren();

    if (error) {
      requestList.textContent =
        "Unable to load your requests. Please try again.";
      console.error("Requests query failed:", error);
      return;
    }

    if (!requests?.length) {
      requestList.textContent = "You have not requested any events yet.";
      return;
    }

    for (const request of requests) {
      const card = document.createElement("article");
      card.className = "dashboard-card";

      const title = document.createElement("h3");
      title.textContent = request.events?.title || "Event";

      const status = document.createElement("p");
      status.textContent = `Status: ${request.status}`;

      const submitted = document.createElement("p");
      submitted.textContent =
        `Submitted: ${new Date(request.submitted_at).toLocaleString()}`;

      card.append(title, status, submitted);
      requestList.append(card);
    }
  }

  await loadRequests();
}
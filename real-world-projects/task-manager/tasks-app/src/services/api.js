const mock = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  userId: 1,
  title: [
    "Prepare quarterly roadmap",
    "Review pull requests",
    "Write project documentation",
    "Plan team workshop",
    "Update dependencies",
    "Design onboarding flow",
    "Organize product backlog",
    "Publish release notes",
  ][index],
  completed: index % 3 === 0,
}));

export async function fetchTasks() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.TASKS_API_TIMEOUT || 10000));

  try {
    const response = await fetch(`${process.env.TASKS_API_BASE_URL || "https://jsonplaceholder.typicode.com"}/todos?_limit=12`, {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`API tâches ${response.status}`);
    return { data: await response.json(), source: "JSONPlaceholder" };
  } catch (error) {
    return {
      data: mock,
      source: "Mock local",
      warning: error.name === "AbortError" ? "La requête a dépassé le délai." : error.message,
    };
  } finally {
    clearTimeout(timeout);
  }
}

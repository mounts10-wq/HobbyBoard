import { useState } from "react";

function TaskForm({ onCreateTask }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Not Started",
    priority: "Medium",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Task title is required.");
      return;
    }

    setLoading(true);

    try {
      await onCreateTask(formData);

      setFormData({
        title: "",
        description: "",
        status: "Not Started",
        priority: "Medium",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <h2>Add a Task</h2>

      <label>
        Task Title
        <input
          type="text"
          name="title"
          placeholder="Example: Order supplies"
          value={formData.title}
          onChange={handleChange}
        />
      </label>

      <label>
        Description
        <textarea
          name="description"
          placeholder="Add details about this task..."
          value={formData.description}
          onChange={handleChange}
        />
      </label>

      <label>
        Status
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Complete">Complete</option>
        </select>
      </label>

      <label>
        Priority
        <select name="priority" value={formData.priority} onChange={handleChange}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </label>

      {error && <p className="error-message">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Task"}
      </button>
    </form>
  );
}

export default TaskForm;

import { useState } from "react";

function BoardForm({ onCreateBoard }) {
  const [formData, setFormData] = useState({
    title: "",
    hobby_type: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!formData.title.trim() || !formData.hobby_type.trim()) {
      setError("Title and hobby type are required.");
      return;
    }

    setLoading(true);

    try {
      await onCreateBoard(formData);

      setFormData({
        title: "",
        hobby_type: "",
        description: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="board-form">
      <h2>Create a New Project Board</h2>

      <label>
        Board Title
        <input
          type="text"
          name="title"
          placeholder="Example: Mustang Restoration"
          value={formData.title}
          onChange={handleChange}
        />
      </label>

      <label>
        Project Type
        <input
          type="text"
          name="hobby_type"
          placeholder="Example: Cars, Crochet, Woodworking"
          value={formData.hobby_type}
          onChange={handleChange}
        />
      </label>

      <label>
        Description
        <textarea
          name="description"
          placeholder="Describe what this board is for..."
          value={formData.description}
          onChange={handleChange}
        />
      </label>

      {error && <p className="error-message">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Board"}
      </button>
    </form>
  );
}

export default BoardForm;
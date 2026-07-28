import { useState } from "react";
import { Link } from "react-router-dom";

function BoardCard({ board, onDeleteBoard, onUpdateBoard }) {
  const [isEditing, setIsEditing] = useState(false);

  const hobbyTags = board.hobby_type
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 3);

  const [formData, setFormData] = useState({
    title: board.title,
    hobby_type: board.hobby_type,
    description: board.description || "",
  });

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
      setError("Title and project type are required.");
      return;
    }

    try {
      await onUpdateBoard(board.id, formData);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  }

  if (isEditing) {
    return (
      <article className="board-card">
        <form onSubmit={handleSubmit} className="edit-form">
          <label>
            Board Title
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
          </label>

          <label>
            Project Type
            <input
              type="text"
              name="hobby_type"
              value={formData.hobby_type}
              onChange={handleChange}
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </label>

          {error && <p className="error-message">{error}</p>}

          <div className="board-card-actions">
            <button type="submit" className="save-edit-button">
              Save
            </button>

            <button
              type="button"
              className="cancel-button"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article className="board-card">
      <div>
        <h3>{board.title}</h3>
        <p className="board-type">{board.hobby_type}</p>
        {hobbyTags.length > 0 && (
          <div className="hobby-tag-row">
            {hobbyTags.map((tag) => (
              <span key={`${board.id}-${tag}`} className="hobby-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
        <p>{board.description || "No description added yet."}</p>
      </div>

      <div className="board-card-actions">
        <Link to={`/boards/${board.id}`} className="view-button">
          View Tasks
        </Link>

        <button className="edit-button" onClick={() => setIsEditing(true)}>
          Edit
        </button>

        <button className="danger-button" onClick={() => onDeleteBoard(board.id)}>
          Delete
        </button>
      </div>
    </article>
  );
}

export default BoardCard;